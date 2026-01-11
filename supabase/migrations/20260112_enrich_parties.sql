
-- Add additional fields to parties table
alter table public.parties add column if not exists shipping_address text;
alter table public.parties add column if not exists city text;
alter table public.parties add column if not exists state text;
alter table public.parties add column if not exists pincode text;
alter table public.parties add column if not exists bank_details text;
alter table public.parties add column if not exists pan_number text;
alter table public.parties add column if not exists terms text;
