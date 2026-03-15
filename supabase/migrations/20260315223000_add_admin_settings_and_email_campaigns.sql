create table if not exists public.admin_settings (
  id integer primary key default 1 check (id = 1),
  maintenance_mode boolean not null default false,
  allow_signups boolean not null default true,
  post_moderation boolean not null default true,
  payment_sandbox boolean not null default true,
  weekly_digest boolean not null default true,
  notification_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.admin_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) >= 3),
  audience text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'paused')),
  send_date timestamptz,
  subject text not null,
  message text not null,
  sent_to text[] not null default '{}',
  open_rate integer not null default 0 check (open_rate >= 0 and open_rate <= 100),
  click_rate integer not null default 0 check (click_rate >= 0 and click_rate <= 100),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_email_campaigns_status_idx
  on public.admin_email_campaigns(status);

create index if not exists admin_email_campaigns_created_at_idx
  on public.admin_email_campaigns(created_at desc);

alter table public.admin_settings enable row level security;
alter table public.admin_email_campaigns enable row level security;

drop policy if exists "admin_settings_public_select" on public.admin_settings;
create policy "admin_settings_public_select"
  on public.admin_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_email_campaigns_admin_select" on public.admin_email_campaigns;
create policy "admin_email_campaigns_admin_select"
  on public.admin_email_campaigns
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create or replace function public.handle_admin_tables_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_admin_settings_updated_at on public.admin_settings;
create trigger handle_admin_settings_updated_at
  before update on public.admin_settings
  for each row
  execute function public.handle_admin_tables_updated_at();

drop trigger if exists handle_admin_email_campaigns_updated_at on public.admin_email_campaigns;
create trigger handle_admin_email_campaigns_updated_at
  before update on public.admin_email_campaigns
  for each row
  execute function public.handle_admin_tables_updated_at();
