
-- Update po_items with missing columns to match invoice_items
alter table public.po_items add column if not exists gst_rate numeric(5, 2) default 0;
alter table public.po_items add column if not exists tax_amount numeric(10, 2) default 0;
alter table public.po_items add column if not exists discount numeric(10, 2) default 0;
alter table public.po_items add column if not exists unit text;
alter table public.po_items add column if not exists hsn_code text;
