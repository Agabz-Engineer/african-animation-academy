-- Add term length tracking for subscriptions and payments

alter table public.subscriptions
  add column if not exists term_months integer not null default 1;

alter table public.subscriptions
  drop constraint if exists subscriptions_term_months_check;

alter table public.subscriptions
  add constraint subscriptions_term_months_check
  check (term_months in (1, 3, 4, 9));

alter table public.payments
  add column if not exists term_months integer;
