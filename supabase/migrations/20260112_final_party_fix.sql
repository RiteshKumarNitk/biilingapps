
-- Combined script to ensure all Party columns exist
alter table public.parties add column if not exists shipping_address text;
alter table public.parties add column if not exists city text;
alter table public.parties add column if not exists state text;
alter table public.parties add column if not exists pincode text;
alter table public.parties add column if not exists bank_details text;
alter table public.parties add column if not exists pan_number text;
alter table public.parties add column if not exists terms text;
alter table public.parties add column if not exists description text;

-- Force refresh the schema cache
NOTIFY pgrst, 'reload schema';
