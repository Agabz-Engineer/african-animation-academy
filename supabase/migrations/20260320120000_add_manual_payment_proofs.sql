alter table public.payments
  add column if not exists manual_sender_name text,
  add column if not exists manual_sender_phone text,
  add column if not exists manual_note text,
  add column if not exists manual_proof_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_proofs_select_own" on storage.objects;
create policy "payment_proofs_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      owner = auth.uid()
      or (
        (storage.foldername(name))[1] = 'proofs'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );

drop policy if exists "payment_proofs_insert_own" on storage.objects;
create policy "payment_proofs_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = 'proofs'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "payment_proofs_update_own" on storage.objects;
create policy "payment_proofs_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      owner = auth.uid()
      or (
        (storage.foldername(name))[1] = 'proofs'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  )
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = 'proofs'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "payment_proofs_delete_own" on storage.objects;
create policy "payment_proofs_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      owner = auth.uid()
      or (
        (storage.foldername(name))[1] = 'proofs'
        and (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );
