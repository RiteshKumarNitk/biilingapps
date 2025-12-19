-- Migration to add wholesale_prices JSONB column
-- Run this in Supabase SQL Editor

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS wholesale_prices jsonb DEFAULT '[]'::jsonb;
