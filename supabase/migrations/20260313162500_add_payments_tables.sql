-- Payment and revenue tracking tables
-- Run via Supabase migrations.

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'pro', 'team')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  price decimal(10,2) not null check (price >= 0),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  cancelled_at timestamptz,
  provider text,
  provider_subscription_id text,
  provider_customer_id text,
  provider_reference text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id),
  amount decimal(10,2) not null check (amount > 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  provider text,
  provider_payment_id text,
  provider_customer_id text,
  provider_reference text,
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Course enrollments table
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'dropped')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  unique(user_id, course_id)
);

-- Indexes for subscriptions
create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);

create index if not exists subscriptions_plan_idx
  on public.subscriptions(plan);

-- Indexes for payments
create index if not exists payments_user_id_idx
  on public.payments(user_id);

create index if not exists payments_status_idx
  on public.payments(status);

create index if not exists payments_created_at_idx
  on public.payments(created_at desc);

-- Indexes for course enrollments
create index if not exists course_enrollments_user_id_idx
  on public.course_enrollments(user_id);

create index if not exists course_enrollments_course_id_idx
  on public.course_enrollments(course_id);

create index if not exists course_enrollments_status_idx
  on public.course_enrollments(status);

-- Enable RLS
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.course_enrollments enable row level security;

-- Policies for subscriptions (users can see their own, admins can see all)
drop policy if exists "subscriptions_select_user" on public.subscriptions;
create policy "subscriptions_select_user"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "subscriptions_select_admin" on public.subscriptions;
create policy "subscriptions_select_admin"
  on public.subscriptions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policies for payments (users can see their own, admins can see all)
drop policy if exists "payments_select_user" on public.payments;
create policy "payments_select_user"
  on public.payments
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policies for course enrollments (users can see their own, admins can see all)
drop policy if exists "course_enrollments_select_user" on public.course_enrollments;
create policy "course_enrollments_select_user"
  on public.course_enrollments
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "course_enrollments_select_admin" on public.course_enrollments;
create policy "course_enrollments_select_admin"
  on public.course_enrollments
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Policies for inserting enrollments (users can enroll themselves)
drop policy if exists "course_enrollments_insert_user" on public.course_enrollments;
create policy "course_enrollments_insert_user"
  on public.course_enrollments
  for insert
  to authenticated
  with check (auth.uid() = user_id);
