-- Migration to add fields to parties table matching Vyapar UI
-- Run this in Supabase SQL Editor

ALTER TABLE public.parties 
ADD COLUMN IF NOT EXISTS gst_type text DEFAULT 'Unregistered/Consumer',
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS opening_balance numeric(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS as_of_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS credit_limit numeric(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS description text;

-- Optional: Enable RLS on specific columns if needed, but table RLS handles rows.
