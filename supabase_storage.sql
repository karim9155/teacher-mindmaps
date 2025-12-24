-- Create a storage bucket for posters
insert into storage.buckets (id, name, public)
values ('posters', 'posters', true);

-- Set up access policies for the storage bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'posters' );

create policy "Authenticated users can upload posters"
  on storage.objects for insert
  with check ( bucket_id = 'posters' and auth.role() = 'authenticated' );
