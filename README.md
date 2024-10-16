Deploying your **Teach Niche** website involves several steps to ensure that both the frontend and backend are properly configured and accessible in a production environment. Below is a comprehensive guide to help you prepare and deploy your application successfully.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Configure Environment Variables](#configure-environment-variables)
3. [Prepare the Frontend for Deployment](#prepare-the-frontend-for-deployment)
4. [Set Up Supabase for Production](#set-up-supabase-for-production)
5. [Deploy Supabase Functions](#deploy-supabase-functions)
6. [Configure Stripe for Production](#configure-stripe-for-production)
7. [Deploy the Frontend](#deploy-the-frontend)
8. [Set Up Custom Domain and SSL](#set-up-custom-domain-and-ssl)
9. [Final Checks](#final-checks)
10. [Useful Resources](#useful-resources)

---

## Prerequisites

Before proceeding, ensure you have the following:

- **Supabase Account**: To host your database and serverless functions.
- **Stripe Account**: For handling payments.
- **Hosting Service Account**: Such as Vercel, Netlify, or another preferred platform for deploying your frontend.
- **Domain Name**: If you plan to use a custom domain.
- **Git Repository**: Your project should be version-controlled using Git.

## 1. Configure Environment Variables

Environment variables are crucial for storing sensitive information like API keys. Ensure that all necessary environment variables are correctly set for both development and production environments.

### Frontend Environment Variables

Create a `.env.production` file in your frontend project directory with the following variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_FUNCTIONS_URL=your_supabase_functions_url
REACT_APP_FRONTEND_URL=https://your-frontend-domain.com
```

### Backend (Supabase Functions) Environment Variables

Set the following environment variables in your Supabase project settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_CLIENT_ID`
- `STRIPE_REDIRECT_URI`
- `FRONTEND_URL`
- `S3_HOST`
- `S3_REGION`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `OPENAI_API_KEY` *(if used)*

**Note:** Ensure that these variables are kept secret and are **not** exposed in your frontend code.

## 2. Prepare the Frontend for Deployment

### Install Dependencies

Ensure all dependencies are installed and up-to-date.

```bash
npm install
```

### Build the Project

Create an optimized production build of your React application.

```bash
npm run build
```

This will generate a `build` directory with your production-ready assets.

## 3. Set Up Supabase for Production

### Initialize Supabase Project

If you haven't already, initialize a new Supabase project:

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. Note down the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the project settings.

### Configure Database Schema

Ensure that your database schema matches the requirements of your application. You can use Supabase's SQL editor to run migrations or scripts.

For example, to create necessary tables:

```sql
-- profiles table
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  email text,
  bio text,
  avatar_url text,
  social_media_tag text,
  stripe_account_id text,
  stripe_onboarding_complete boolean default false
);

-- tutorials table
create table tutorials (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price numeric not null,
  video_url text,
  content jsonb not null,
  creator_id uuid references profiles(id),
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- purchases table
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  tutorial_id uuid references tutorials(id),
  purchase_date timestamp with time zone default timezone('utc'::text, now())
);

-- categories table
create table categories (
  id serial primary key,
  name text not null
);

-- tutorial_categories table
create table tutorial_categories (
  tutorial_id uuid references tutorials(id),
  category_id integer references categories(id),
  primary key (tutorial_id, category_id)
);
```

### Enable Authentication

Ensure that Supabase Authentication is enabled and configured correctly:

1. In your Supabase project, navigate to the **Authentication** section.
2. Configure allowed redirect URLs (e.g., `https://your-frontend-domain.com/profile`).
3. Set up email templates and providers as needed.

## 4. Deploy Supabase Functions

Supabase provides a serverless environment to deploy your backend functions. Follow these steps to deploy your Deno functions.

### Install Supabase CLI

If you haven't installed the Supabase CLI, do so now:

```bash
npm install -g supabase
```

### Log In to Supabase

Authenticate using the CLI:

```bash
supabase login
```

### Deploy Functions

Navigate to your project directory and deploy each function.

#### Example: Deploying `create-lesson` Function

```bash
supabase functions deploy create-lesson
```

Repeat the deployment step for each of your functions:

- `create-stripe-connect`
- `create-checkout-session`
- `stripe-webhook`
- `stripe-oauth-callback`

**Note:** Ensure that your function code is correctly placed in the `supabase/functions/` directory and that all necessary environment variables are set.

### Set Environment Variables for Functions

Use the Supabase CLI or dashboard to set environment variables for your functions.

```bash
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
# Add other variables as needed
```

## 5. Configure Stripe for Production

### Update Stripe Settings

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Developers > API keys**.
3. Use the **Live** keys for production.
4. Update your Supabase functions with the live `STRIPE_SECRET_KEY`.

### Set Up Webhooks

1. In the Stripe Dashboard, go to **Developers > Webhooks**.
2. Add a new endpoint for your `stripe-webhook` function.
   - URL: `https://your-supabase-project.supabase.co/functions/v1/stripe-webhook`
3. Select the events you want to listen to, such as `checkout.session.completed`.
4. Obtain the **Webhook Signing Secret** and set it as an environment variable in Supabase:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 6. Deploy the Frontend

You can deploy your React frontend using various hosting services. Below is an example using **Vercel**, but similar steps apply to **Netlify**, **Firebase Hosting**, etc.

### Deploying with Vercel

1. **Install Vercel CLI** (optional):

   ```bash
   npm install -g vercel
   ```

2. **Initialize Vercel Project**:

   In your project root directory:

   ```bash
   vercel
   ```

   Follow the prompts to link your project to Vercel.

3. **Set Environment Variables in Vercel**:

   - Go to your project dashboard on Vercel.
   - Navigate to **Settings > Environment Variables**.
   - Add the environment variables from your `.env.production` file.

4. **Deploy the Project**:

   ```bash
   vercel --prod
   ```

   Alternatively, Vercel will automatically deploy when you push to your connected Git repository's main branch.

### Alternative: Deploying with Netlify

1. **Create a Netlify Account** and connect it to your Git repository.
2. **Set Up Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
3. **Set Environment Variables** in Netlify under **Site Settings > Build & Deploy > Environment**.
4. **Deploy** the site.

## 7. Set Up Custom Domain and SSL

### Using Vercel

1. **Add a Custom Domain**:

   - In your Vercel dashboard, go to your project.
   - Navigate to **Settings > Domains**.
   - Add your custom domain (e.g., `www.yourdomain.com`).

2. **Configure DNS Settings**:

   - Update your domain's DNS records as instructed by Vercel.
   - This typically involves adding `CNAME` or `A` records pointing to Vercel's servers.

3. **Enable SSL**:

   - Vercel automatically provisions SSL certificates for your domains.

### Using Netlify

1. **Add a Custom Domain**:

   - In your Netlify dashboard, go to your site.
   - Navigate to **Domain settings**.
   - Add your custom domain.

2. **Configure DNS Settings**:

   - Update your domain's DNS records as instructed by Netlify.
   - Usually involves adding `CNAME` or `A` records.

3. **Enable SSL**:

   - Netlify automatically provision SSL certificates via Let's Encrypt.

## 8. Final Checks

Before going live, perform the following checks:

### Functionality Testing

- **Authentication**: Test sign-up, login, and protected routes.
- **Stripe Integration**: Perform test transactions to ensure payments are processed correctly.
- **CRUD Operations**: Verify that creating, reading, updating, and deleting lessons work as expected.
- **User Profiles**: Ensure user profile updates and Stripe connections function properly.

### Security

- **Environment Variables**: Confirm that sensitive data is not exposed in the frontend.
- **CORS Configuration**: Ensure that your CORS settings allow only trusted origins.
- **HTTPS**: Ensure all requests are served over HTTPS to secure data in transit.

### Performance

- **Optimize Assets**: Ensure images and other assets are optimized for faster loading times.
- **Lazy Loading**: Implement lazy loading for components and images where applicable.

### Monitoring

- **Error Tracking**: Set up error tracking tools like Sentry to monitor and log errors.
- **Analytics**: Integrate analytics tools to monitor user interactions and site performance.

## 9. Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

By following this guide, you should be able to successfully deploy your **Teach Niche** website, ensuring that both frontend and backend components are properly configured and operational in a production environment. Remember to continuously monitor your application post-deployment to address any issues promptly and ensure a smooth user experience.