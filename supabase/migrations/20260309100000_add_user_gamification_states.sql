create table if not exists public.user_gamification_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_gamification_states_updated_at_idx
  on public.user_gamification_states(updated_at desc);

alter table public.user_gamification_states enable row level security;

drop policy if exists "user_gamification_states_select_own" on public.user_gamification_states;
create policy "user_gamification_states_select_own"
  on public.user_gamification_states
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_gamification_states_insert_own" on public.user_gamification_states;
create policy "user_gamification_states_insert_own"
  on public.user_gamification_states
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_gamification_states_update_own" on public.user_gamification_states;
create policy "user_gamification_states_update_own"
  on public.user_gamification_states
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.user_gamification_states;
    exception
      when duplicate_object then
        null;
    end;
  end if;
end
$$;
