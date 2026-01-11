
-- Drop existing policies to avoid conflicts
drop policy if exists "Tenant isolation for purchase_orders" on public.purchase_orders;
drop policy if exists "Tenant isolation for po_items" on public.po_items;

-- Re-enable RLS just in case
alter table public.purchase_orders enable row level security;
alter table public.po_items enable row level security;

-- Create policies covering ALL operations (Select, Insert, Update, Delete)
create policy "Tenant isolation for purchase_orders" 
on public.purchase_orders 
for all 
using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for po_items" 
on public.po_items 
for all 
using (tenant_id = get_my_tenant_id());

-- Grant permissions to authenticated users
grant all on public.purchase_orders to authenticated;
grant all on public.po_items to authenticated;
grant all on public.purchase_orders to service_role;
grant all on public.po_items to service_role;
