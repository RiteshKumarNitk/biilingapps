
-- Add signature_url column to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS signature_url text;
