-- ============================================================
-- IT Solutions Store - Complete Supabase Setup
-- Safe Version
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Categories Table
-- ============================================================

create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    icon text default '📦',
    sort_order integer default 0,
    created_at timestamptz default now()
);

-- ============================================================
-- Products Table
-- ============================================================

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    description text,

    price numeric(12,2) not null,

    old_price numeric(12,2),

    category text,

    image_url text,

    stock integer default 0,

    featured boolean default false,

    created_at timestamptz default now()
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;

-- ============================================================
-- Remove Old Policies (Safe Re-run)
-- ============================================================

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Auth manage categories" on public.categories;

drop policy if exists "Public read products" on public.products;
drop policy if exists "Auth manage products" on public.products;

-- ============================================================
-- Categories Policies
-- ============================================================

create policy "Public read categories"
on public.categories
for select
using (true);

create policy "Auth manage categories"
on public.categories
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- ============================================================
-- Products Policies
-- ============================================================

create policy "Public read products"
on public.products
for select
using (true);

create policy "Auth manage products"
on public.products
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- ============================================================
-- Default Categories
-- ============================================================

insert into public.categories
(name,icon,sort_order)

values

('كاميرات مراقبة','📷',1),

('أنظمة أمنية','🛡️',2),

('كمبيوتر ولابتوبات','💻',3),

('طابعات','🖨️',4),

('شبكات','🌐',5),

('UPS وحلول الطاقة','🔋',6),

('حلول IT متكاملة','🖥️',7)

on conflict (name) do nothing;

-- ============================================================
-- Storage Policies
-- ============================================================

drop policy if exists "Public read product images" on storage.objects;

drop policy if exists "Auth upload product images" on storage.objects;

drop policy if exists "Auth update product images" on storage.objects;

drop policy if exists "Auth delete product images" on storage.objects;

create policy "Public read product images"
on storage.objects
for select
using (bucket_id='products');

create policy "Auth upload product images"
on storage.objects
for insert
with check (
bucket_id='products'
and auth.role()='authenticated'
);

create policy "Auth update product images"
on storage.objects
for update
using (
bucket_id='products'
and auth.role()='authenticated'
);

create policy "Auth delete product images"
on storage.objects
for delete
using (
bucket_id='products'
and auth.role()='authenticated'
);

-- ============================================================
-- Finished Successfully
-- ============================================================