
-- 1. Fix missing 'type' column in payments
alter table public.payments add column if not exists type text check (type in ('in', 'out'));

-- 2. Ensure RLS is enabled for all tables (Double check)
alter table public.tenants enable row level security;
alter table public.products enable row level security;
alter table public.parties enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.po_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_movements enable row level security;

-- 3. Consolidated Multi-Tenant Isolation Policies
-- This ensures that even if a user knows an ID, they can't access it if it's not their tenant.

DO $$ 
BEGIN
    -- Drop existing to re-apply clean
    DROP POLICY IF EXISTS "Tenant isolation for purchase_orders" ON public.purchase_orders;
    DROP POLICY IF EXISTS "Tenant isolation for po_items" ON public.po_items;
    DROP POLICY IF EXISTS "Tenant isolation for invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Tenant isolation for invoice_items" ON public.invoice_items;
    DROP POLICY IF EXISTS "Tenant isolation for payments" ON public.payments;
    DROP POLICY IF EXISTS "Tenant isolation for parties" ON public.parties;
    DROP POLICY IF EXISTS "Tenant isolation for products" ON public.products;
    DROP POLICY IF EXISTS "Tenant isolation for stock_movements" ON public.stock_movements;
END $$;

-- Apply Select/Insert/Update/Delete isolation
CREATE POLICY "Tenant isolation for purchase_orders" ON public.purchase_orders FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for po_items" ON public.po_items FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for invoices" ON public.invoices FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for invoice_items" ON public.invoice_items FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for payments" ON public.payments FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for parties" ON public.parties FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for products" ON public.products FOR ALL USING (tenant_id = get_my_tenant_id());
CREATE POLICY "Tenant isolation for stock_movements" ON public.stock_movements FOR ALL USING (tenant_id = get_my_tenant_id());

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
