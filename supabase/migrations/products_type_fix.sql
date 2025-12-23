-- Migration to add 'type' and 'wholesale_prices' to products table
-- Run this in Supabase SQL Editor

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS type text DEFAULT 'product' CHECK (type IN ('product', 'service')),
ADD COLUMN IF NOT EXISTS wholesale_prices jsonb DEFAULT '[]'::jsonb;

-- Optional: Index on type if filtering is common
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
