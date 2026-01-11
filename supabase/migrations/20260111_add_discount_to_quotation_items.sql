ALTER TABLE public.quotation_items 
ADD COLUMN IF NOT EXISTS discount numeric(10, 2) default 0;
