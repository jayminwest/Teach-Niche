drop policy "Allow Public Access Videos" on "storage"."objects";

drop policy "Allow authenticated uploads 16v3daf_0" on "storage"."objects";

drop policy "Allow authenticated uploads" on "storage"."objects";

create policy "Allow Owner Access"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'videos'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated uploads 16v3daf_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'thumbnails'::text));


create policy "Allow authenticated uploads"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'videos'::text) AND (auth.uid() = owner)));



