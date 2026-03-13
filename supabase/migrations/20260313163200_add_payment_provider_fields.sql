-- Add provider tracking fields for Paystack (or other payment gateways).

alter table public.subscriptions
  add column if not exists provider text,
  add column if not exists provider_subscription_id text,
  add column if not exists provider_customer_id text,
  add column if not exists provider_reference text;

alter table public.payments
  add column if not exists provider text,
  add column if not exists provider_payment_id text,
  add column if not exists provider_customer_id text,
  add column if not exists provider_reference text;
