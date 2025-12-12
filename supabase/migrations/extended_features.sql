
-- --------------------------------------------------------------------------------
-- 11. SALE RETURNS (CREDIT NOTES)
-- --------------------------------------------------------------------------------

create table if not exists public.credit_notes (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  cn_number text not null,
  date date default CURRENT_DATE not null,
  party_id uuid references public.parties on delete set null,
  party_name text,
  original_invoice_id uuid references public.invoices on delete set null,
  
  subtotal numeric(12, 2) default 0,
  total_gst numeric(12, 2) default 0,
  grand_total numeric(12, 2) default 0,
  
  notes text,
  unique(tenant_id, cn_number)
);

create table if not exists public.credit_note_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  credit_note_id uuid references public.credit_notes on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) not null,
  gst_rate numeric(5, 2) default 0,
  tax_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null
);

-- --------------------------------------------------------------------------------
-- 12. DELIVERY CHALLANS
-- --------------------------------------------------------------------------------

create table if not exists public.delivery_challans (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  challan_number text not null,
  date date default CURRENT_DATE not null,
  party_id uuid references public.parties on delete set null,
  party_name text,
  
  status text check (status in ('open', 'converted', 'closed')) default 'open',
  notes text,
  unique(tenant_id, challan_number)
);

create table if not exists public.challan_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  challan_id uuid references public.delivery_challans on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) default 0 -- Optional on DC
);

-- --------------------------------------------------------------------------------
-- 13. PURCHASE ORDERS
-- --------------------------------------------------------------------------------

create table if not exists public.purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  po_number text not null,
  date date default CURRENT_DATE not null,
  party_id uuid references public.parties on delete set null, -- Supplier
  party_name text,
  status text check (status in ('pending', 'received', 'cancelled')) default 'pending',
  
  expected_delivery_date date,
  grand_total numeric(12, 2) default 0,
  
  notes text,
  unique(tenant_id, po_number)
);

create table if not exists public.po_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  po_id uuid references public.purchase_orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) not null,
  total_amount numeric(10, 2) not null
);

-- --------------------------------------------------------------------------------
-- 14. BANK ACCOUNTS
-- --------------------------------------------------------------------------------

create table if not exists public.bank_accounts (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  account_name text not null, -- e.g. "HDFC Current"
  account_number text,
  ifsc_code text,
  bank_name text,
  opening_balance numeric(12, 2) default 0,
  current_balance numeric(12, 2) default 0,
  is_default boolean default false
);


-- --------------------------------------------------------------------------------
-- POLICIES
-- --------------------------------------------------------------------------------

-- Helper to enable RLS and create policies
alter table public.credit_notes enable row level security;
alter table public.credit_note_items enable row level security;
alter table public.delivery_challans enable row level security;
alter table public.challan_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.po_items enable row level security;
alter table public.bank_accounts enable row level security;

-- Policies (Simplified Loop: Users viewing own tenant)

create policy "Tenant isolation for credit_notes" on public.credit_notes for all using (tenant_id = get_my_tenant_id());
create policy "Tenant isolation for credit_note_items" on public.credit_note_items for all using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for delivery_challans" on public.delivery_challans for all using (tenant_id = get_my_tenant_id());
create policy "Tenant isolation for challan_items" on public.challan_items for all using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for purchase_orders" on public.purchase_orders for all using (tenant_id = get_my_tenant_id());
create policy "Tenant isolation for po_items" on public.po_items for all using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for bank_accounts" on public.bank_accounts for all using (tenant_id = get_my_tenant_id());
