alter table "public"."lessons" drop constraint "lessons_parent_lesson_id_fkey";

drop function if exists "public"."update_lesson_videos_count"();

drop view if exists "public"."user_purchased_lessons";

alter table "public"."instructor_profiles" drop column "total_earnings";

alter table "public"."lessons" drop column "parent_lesson_id";

alter table "public"."lessons" drop column "videos_count";

alter table "public"."lessons" alter column "price" set data type numeric(10,2) using "price"::numeric(10,2);

alter table "public"."purchases" drop column "video_id";

alter table "public"."purchases" alter column "amount" set data type numeric(10,2) using "amount"::numeric(10,2);

alter table "public"."purchases" alter column "stripe_payment_id" set data type character varying(255) using "stripe_payment_id"::character varying(255);

CREATE UNIQUE INDEX instructor_profiles_user_id_key ON public.instructor_profiles USING btree (user_id);

alter table "public"."instructor_profiles" add constraint "instructor_profiles_user_id_key" UNIQUE using index "instructor_profiles_user_id_key";

create or replace view "public"."user_purchased_lessons" as  SELECT p.user_id,
    p.lesson_id,
    l.title,
    l.description,
    l.thumbnail_url,
    p.created_at AS purchase_date
   FROM (purchases p
     JOIN lessons l ON ((p.lesson_id = l.id)));



