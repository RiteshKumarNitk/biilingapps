-- Migration to add Vyapar-style fields to products table
-- Run this in Supabase SQL Editor

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS tax_mode text DEFAULT 'exclusive', -- 'exclusive' or 'inclusive'
ADD COLUMN IF NOT EXISTS discount_value numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percentage', -- 'percentage' or 'amount'
ADD COLUMN IF NOT EXISTS wholesale_price numeric(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS as_of_date date DEFAULT CURRENT_DATE;

-- Add checking constraints if desired, e.g.
-- ALTER TABLE public.products ADD CONSTRAINT products_tax_mode_check CHECK (tax_mode IN ('exclusive', 'inclusive'));
