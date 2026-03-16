create table if not exists public.studio_requests (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references auth.users(id) on delete cascade,
  studio_name text not null,
  contact_name text not null,
  contact_email text not null,
  role_needed text not null,
  animation_type text not null,
  required_tools text[] not null default '{}'::text[],
  experience_level text not null,
  contract_type text not null,
  timeline text not null,
  budget_range text not null,
  artists_needed integer not null default 1 check (artists_needed > 0),
  project_brief text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'shortlisting', 'matched', 'closed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_requests_studio_id_idx
  on public.studio_requests(studio_id);

create index if not exists studio_requests_status_idx
  on public.studio_requests(status);

grant select, insert, update on public.studio_requests to authenticated;

alter table public.studio_requests enable row level security;

drop policy if exists "studio_requests_select_own" on public.studio_requests;
create policy "studio_requests_select_own"
  on public.studio_requests
  for select
  to authenticated
  using (auth.uid() = studio_id);

drop policy if exists "studio_requests_insert_own" on public.studio_requests;
create policy "studio_requests_insert_own"
  on public.studio_requests
  for insert
  to authenticated
  with check (auth.uid() = studio_id);

drop policy if exists "studio_requests_update_own" on public.studio_requests;
create policy "studio_requests_update_own"
  on public.studio_requests
  for update
  to authenticated
  using (auth.uid() = studio_id)
  with check (auth.uid() = studio_id);

create or replace function public.handle_studio_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_studio_requests_updated_at on public.studio_requests;
create trigger handle_studio_requests_updated_at
  before update on public.studio_requests
  for each row
  execute function public.handle_studio_requests_updated_at();
