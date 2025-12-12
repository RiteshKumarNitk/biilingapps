
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------------------------------
-- 1. TENANTS & USERS
-- --------------------------------------------------------------------------------

-- Tenants table: Stores business details
create table if not exists public.tenants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text unique not null,
  address text,
  gstin text,
  phone text,
  email text,
  logo_url text,
  settings jsonb default '{}'::jsonb
);

-- Users Profile table: Links Auth Users to Tenants
create table if not exists public.users_profile (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  role text check (role in ('owner', 'accountant', 'sales')),
  tenant_id uuid references public.tenants on delete cascade not null
);

-- --------------------------------------------------------------------------------
-- 2. INVENTORY & PRODUCTS
-- --------------------------------------------------------------------------------

create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  sku text,
  hsn_code text, -- For GST
  price numeric(10, 2) not null default 0,
  cost_price numeric(10, 2) default 0,
  gst_rate numeric(5, 2) default 0, -- e.g., 5, 12, 18, 28
  stock_quantity numeric(10, 2) default 0,
  low_stock_threshold numeric(10, 2) default 5,
  unit text default 'pcs', -- pcs, kg, ltr
  barcode text,
  image_url text,
  
  unique(tenant_id, sku),
  unique(tenant_id, barcode)
);

create index if not exists idx_products_tenant on public.products(tenant_id);

-- Stock Movements (Audit Trail for Inventory)
create table if not exists public.stock_movements (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products on delete cascade not null,
  type text check (type in ('in', 'out', 'adjustment', 'invoice_sent', 'purchase_received')),
  quantity numeric(10, 2) not null,
  reference_id uuid, -- Link to Invoice or PO
  notes text
);

create index if not exists idx_stock_tenant on public.stock_movements(tenant_id);

-- --------------------------------------------------------------------------------
-- 3. CUSTOMERS & SUPPLIERS (PARTIES)
-- --------------------------------------------------------------------------------

create table if not exists public.parties (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('customer', 'supplier')),
  name text not null,
  gstin text,
  phone text,
  email text,
  address text,
  opening_balance numeric(10, 2) default 0, -- Positive = Receivable, Negative = Payable
  current_balance numeric(10, 2) default 0
);

create index if not exists idx_parties_tenant on public.parties(tenant_id);

-- --------------------------------------------------------------------------------
-- 4. INVOICING
-- --------------------------------------------------------------------------------

create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  invoice_number text not null,
  date date default CURRENT_DATE not null,
  due_date date,
  party_id uuid references public.parties on delete set null,
  party_name text, -- Cache name in case party is deleted
  status text check (status in ('draft', 'generated', 'paid', 'overdue', 'cancelled')) default 'draft',
  
  subtotal numeric(12, 2) default 0,
  total_gst numeric(12, 2) default 0,
  discount_amount numeric(12, 2) default 0,
  grand_total numeric(12, 2) default 0,
  paid_amount numeric(12, 2) default 0,
  
  payment_status text check (payment_status in ('unpaid', 'partial', 'paid')) default 'unpaid',
  pdf_url text, -- Link to storage
  notes text,
  share_token uuid default uuid_generate_v4(), -- Public sharing token
  
  unique(tenant_id, invoice_number)
);

-- RPC for Public Invoice Access
create or replace function get_invoice_by_token(token uuid)
returns jsonb
language plpgsql
security definer -- Bypass RLS
as $$
declare
  invoice_data jsonb;
begin
  select jsonb_build_object(
    'invoice', i,
    'items', (select jsonb_agg(ii) from public.invoice_items ii where ii.invoice_id = i.id),
    'tenant', (select to_jsonb(t) from public.tenants t where t.id = i.tenant_id)
  )
  into invoice_data
  from public.invoices i
  where i.share_token = token
  limit 1;
  
  return invoice_data;
end;
$$;

create index if not exists idx_invoices_tenant on public.invoices(tenant_id);

create table if not exists public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  invoice_id uuid references public.invoices on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) not null,
  gst_rate numeric(5, 2) default 0,
  tax_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null
);

create index if not exists idx_invoice_items_tenant on public.invoice_items(tenant_id);

-- --------------------------------------------------------------------------------
-- 5. PAYMENTS & LEDGER
-- --------------------------------------------------------------------------------

create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  invoice_id uuid references public.invoices on delete set null,
  party_id uuid references public.parties on delete set null,
  
  amount numeric(12, 2) not null,
  mode text check (mode in ('cash', 'upi', 'bank_transfer', 'cheque', 'online')),
  transaction_ref text, -- UPI Ref / Cheque No
  notes text
);

create index if not exists idx_payments_tenant on public.payments(tenant_id);

-- Ledger Entries (Double Entry Accounting Book)
create table if not exists public.ledger_entries (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default CURRENT_DATE,
  description text,
  
  account_type text, -- 'cash', 'bank', 'sales', 'receivable_customer', etc.
  debit numeric(12, 2) default 0,
  credit numeric(12, 2) default 0,
  reference_id uuid, -- Points to Invoice ID or Payment ID
  reference_type text -- 'invoice' or 'payment'
);

create index if not exists idx_ledger_tenant on public.ledger_entries(tenant_id);

-- --------------------------------------------------------------------------------
-- 6. EXPENSES
-- --------------------------------------------------------------------------------

create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category text, -- 'Rent', 'Electricity', 'Salary'
  amount numeric(12, 2) not null,
  date date default CURRENT_DATE,
  notes text,
  receipt_url text
);

-- --------------------------------------------------------------------------------
-- 7. ONLINE STORE & ORDERS
-- --------------------------------------------------------------------------------

create table if not exists public.online_orders (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  status text check (status in ('new', 'processing', 'completed', 'cancelled')) default 'new',
  total_amount numeric(12, 2) not null,
  items jsonb not null -- Store snapshot of items ordered
);

-- --------------------------------------------------------------------------------
-- 8. RLS POLICIES (MULTI-TENANCY REINFORCEMENT)
-- --------------------------------------------------------------------------------

-- Helper function to get current user's tenant_id
create or replace function get_my_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from public.users_profile where id = auth.uid() limit 1;
$$;

-- Enable RLS on all tables
alter table public.tenants enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.parties enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.expenses enable row level security;
alter table public.online_orders enable row level security;

-- Policies (DROP first to be idempotent, avoiding duplication errors)

do $$ begin
  drop policy if exists "Users can view their own tenant" on public.tenants;
  drop policy if exists "Tenant isolation for products" on public.products;
  drop policy if exists "Tenant isolation for stock_movements" on public.stock_movements;
  drop policy if exists "Tenant isolation for parties" on public.parties;
  drop policy if exists "Tenant isolation for invoices" on public.invoices;
  drop policy if exists "Tenant isolation for invoice_items" on public.invoice_items;
  drop policy if exists "Tenant isolation for payments" on public.payments;
  drop policy if exists "Tenant isolation for ledger_entries" on public.ledger_entries;
  drop policy if exists "Tenant isolation for expenses" on public.expenses;
  drop policy if exists "Public can create orders" on public.online_orders;
  drop policy if exists "Tenant can view orders" on public.online_orders;
end $$;

-- Policies

-- Tenants: Users can only see their own tenant
create policy "Users can view their own tenant" on public.tenants
  for select using (id = get_my_tenant_id());

-- Products
create policy "Tenant isolation for products" on public.products
  for all using (tenant_id = get_my_tenant_id());

-- Stock Movements
create policy "Tenant isolation for stock_movements" on public.stock_movements
  for all using (tenant_id = get_my_tenant_id());

-- Parties
create policy "Tenant isolation for parties" on public.parties
  for all using (tenant_id = get_my_tenant_id());

-- Invoices
create policy "Tenant isolation for invoices" on public.invoices
  for all using (tenant_id = get_my_tenant_id());

-- Invoice Items
create policy "Tenant isolation for invoice_items" on public.invoice_items
  for all using (tenant_id = get_my_tenant_id());

-- Payments
create policy "Tenant isolation for payments" on public.payments
  for all using (tenant_id = get_my_tenant_id());

-- Ledger
create policy "Tenant isolation for ledger_entries" on public.ledger_entries
  for all using (tenant_id = get_my_tenant_id());

-- Expenses
create policy "Tenant isolation for expenses" on public.expenses
  for all using (tenant_id = get_my_tenant_id());

-- Online Orders
create policy "Public can create orders" on public.online_orders
  for insert with check (true); 

create policy "Tenant can view orders" on public.online_orders
  for select using (tenant_id = get_my_tenant_id());

-- --------------------------------------------------------------------------------
-- 9. TRIGGERS & FUNCTIONS
-- --------------------------------------------------------------------------------

-- Auto-create User Profile on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  insert into public.tenants (name, slug, email)
  values (
    coalesce(new.raw_user_meta_data->>'business_name', 'My Business'),
    coalesce(new.raw_user_meta_data->>'slug', lower(random()::text)), 
    new.email
  )
  returning id into new_tenant_id;

  insert into public.users_profile (id, full_name, role, tenant_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'owner',
    new_tenant_id
  );

  return new;
end;
$$;

-- Trigger for new auth user (Drop if exists to avoid error)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update stock on stock_movement
create or replace function update_product_stock()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    if (NEW.type = 'in' or NEW.type = 'purchase_received') then
      update public.products set stock_quantity = stock_quantity + NEW.quantity where id = NEW.product_id;
    elsif (NEW.type = 'out' or NEW.type = 'invoice_sent') then
      update public.products set stock_quantity = stock_quantity - NEW.quantity where id = NEW.product_id;
    elsif (NEW.type = 'adjustment') then
      update public.products set stock_quantity = stock_quantity + NEW.quantity where id = NEW.product_id;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists tr_update_stock on public.stock_movements;
create trigger tr_update_stock
after insert on public.stock_movements
for each row execute procedure update_product_stock();

-- --------------------------------------------------------------------------------
-- 10. QUOTATIONS / ESTIMATES
-- --------------------------------------------------------------------------------

create table if not exists public.quotations (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  quotation_number text not null,
  date date default CURRENT_DATE not null,
  valid_until date,
  party_id uuid references public.parties on delete set null,
  party_name text,
  status text check (status in ('draft', 'sent', 'accepted', 'rejected', 'converted')) default 'draft',
  
  subtotal numeric(12, 2) default 0,
  total_gst numeric(12, 2) default 0,
  discount_amount numeric(12, 2) default 0,
  grand_total numeric(12, 2) default 0,
  
  notes text,
  unique(tenant_id, quotation_number)
);

create index if not exists idx_quotations_tenant on public.quotations(tenant_id);

create table if not exists public.quotation_items (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  quotation_id uuid references public.quotations on delete cascade not null,
  product_id uuid references public.products on delete set null,
  
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(10, 2) not null,
  gst_rate numeric(5, 2) default 0,
  tax_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null
);

create index if not exists idx_quotation_items_tenant on public.quotation_items(tenant_id);

-- RLS Policies
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

do $$ begin
  drop policy if exists "Tenant isolation for quotations" on public.quotations;
  drop policy if exists "Tenant isolation for quotation_items" on public.quotation_items;
end $$;

create policy "Tenant isolation for quotations" on public.quotations
  for all using (tenant_id = get_my_tenant_id());

create policy "Tenant isolation for quotation_items" on public.quotation_items
  for all using (tenant_id = get_my_tenant_id());


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
