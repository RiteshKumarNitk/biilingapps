ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS party_address text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS party_phone text,
ADD COLUMN IF NOT EXISTS party_email text;

ALTER TABLE public.invoice_items
ADD COLUMN IF NOT EXISTS discount numeric(10, 2) default 0;
