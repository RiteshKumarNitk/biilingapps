
-- Add 'type' column to quotations to differentiate between Estimate and Proforma
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('estimate', 'proforma')) DEFAULT 'estimate';

-- Update RLS if needed (already covers all)
