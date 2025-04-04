# Supabase Schema Setup for Local Development

This document provides guidance on setting up your Supabase schema for local development.

## Database Tables

Based on the project structure, here's a recommended schema setup for your local Supabase instance.

### Users Table

```sql
create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  bio text,
  role text default 'user'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now(),
  avatar_url text,
  email text,
  stripe_customer_id text
);

-- Enable RLS
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data" on users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on users
  for update using (auth.uid() = id);
```

### Instructor Profiles Table

```sql
create table public.instructor_profiles (
  id uuid primary key,
  user_id uuid references public.users not null,
  stripe_account_id text,
  stripe_account_enabled boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.instructor_profiles enable row level security;

-- Create policies
create policy "Instructors can view their own profile" on instructor_profiles
  for select using (auth.uid() = user_id);

create policy "Instructors can update their own profile" on instructor_profiles
  for update using (auth.uid() = user_id);
```

### Videos Table

```sql
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null default 0,
  instructor_id uuid references public.users not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now(),
  thumbnail_url text,
  video_path text,
  stripe_product_id text,
  stripe_price_id text
);

-- Enable RLS
alter table public.videos enable row level security;

-- Create policies
create policy "Videos are viewable by everyone" on videos
  for select using (true);

create policy "Instructors can insert their own videos" on videos
  for insert with check (auth.uid() = instructor_id);

create policy "Instructors can update their own videos" on videos
  for update using (auth.uid() = instructor_id);
```

### Lessons Table

```sql
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null default 0,
  instructor_id uuid references public.users not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now(),
  thumbnail_url text,
  stripe_product_id text,
  stripe_price_id text,
  parent_lesson_id uuid references public.lessons
);

-- Enable RLS
alter table public.lessons enable row level security;

-- Create policies
create policy "Lessons are viewable by everyone" on lessons
  for select using (true);

create policy "Instructors can insert their own lessons" on lessons
  for insert with check (auth.uid() = instructor_id);

create policy "Instructors can update their own lessons" on lessons
  for update using (auth.uid() = instructor_id);
```

### Lesson Videos Table

```sql
create table public.lesson_videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons not null,
  video_id uuid references public.videos not null,
  order_index integer not null default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.lesson_videos enable row level security;

-- Create policies
create policy "Lesson videos are viewable by everyone" on lesson_videos
  for select using (true);

create policy "Instructors can manage lesson videos" on lesson_videos
  for all using (
    auth.uid() in (
      select instructor_id from public.lessons where id = lesson_id
    )
  );
```

### Purchases Table

```sql
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users not null,
  video_id uuid references public.videos,
  lesson_id uuid references public.lessons,
  stripe_payment_id text,
  amount numeric not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now(),
  stripe_product_id text,
  stripe_price_id text,
  instructor_payout_amount numeric,
  platform_fee_amount numeric,
  payout_status text default 'pending'::text
);

-- Enable RLS
alter table public.purchases enable row level security;

-- Create policies
create policy "Users can view their own purchases" on purchases
  for select using (auth.uid() = user_id);

create policy "Instructors can view purchases of their content" on purchases
  for select using (
    auth.uid() in (
      select instructor_id from public.videos where id = video_id
      union
      select instructor_id from public.lessons where id = lesson_id
    )
  );
```

## Views

### User Purchased Videos View

```sql
create or replace view public.user_purchased_videos as
select 
  v.id as video_id,
  v.title,
  v.description,
  v.thumbnail_url,
  v.video_path,
  p.user_id,
  p.created_at as purchase_date
from 
  public.purchases p
join 
  public.videos v on p.video_id = v.id;
```

### User Purchased Lessons View

```sql
create or replace view public.user_purchased_lessons as
select 
  l.id as lesson_id,
  l.title,
  l.description,
  l.thumbnail_url,
  p.user_id,
  p.created_at as purchase_date
from 
  public.purchases p
join 
  public.lessons l on p.lesson_id = l.id;
```

## Storage Buckets

Create the necessary storage buckets:

```sql
-- Create videos bucket
insert into storage.buckets (id, name, public) 
values ('videos', 'videos', false);

-- Create thumbnails bucket
insert into storage.buckets (id, name, public) 
values ('thumbnails', 'thumbnails', true);
```

## Applying the Schema

1. Save the above SQL to a file in `supabase/migrations/` (e.g., `20230101000000_initial_schema.sql`)

2. Apply the migrations:
   ```bash
   supabase db reset
   ```

3. Verify the schema in Supabase Studio (http://localhost:54323)

## Test Data

You can create test data with SQL inserts or through the Supabase Studio interface.

Example test user:
```sql
-- Insert a test user (password: password123)
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}'
);

-- Insert user profile
insert into public.users (
  id, name, role, email
) values (
  '00000000-0000-0000-0000-000000000000',
  'Test User',
  'instructor',
  'test@example.com'
);
```

## Troubleshooting

If you encounter issues with the schema:

1. Check the Supabase logs:
   ```bash
   supabase logs
   ```

2. Reset the database if needed:
   ```bash
   supabase db reset
   ```

3. Access the PostgreSQL database directly:
   ```bash
   supabase db studio
   ```
