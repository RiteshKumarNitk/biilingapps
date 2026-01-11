ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS party_address text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS party_phone text,
ADD COLUMN IF NOT EXISTS party_email text;
