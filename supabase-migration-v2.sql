-- ============================================================
-- IT Solutions Store - Migration v2
-- شغّل هذا الملف بعد ما شغلت الملف الأساسي supabase-setup.sql
-- بيضيف: صور متعددة للمنتج، الكوبونات، الطلبات والإحصائيات
-- ============================================================

-- 1) دعم أكتر من صورة للمنتج الواحد
alter table public.products add column if not exists images jsonb default '[]'::jsonb;

-- ============================================================
-- 2) جدول الكوبونات
-- ============================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent', -- 'percent' or 'fixed'
  discount_value numeric(12,2) not null,
  min_order numeric(12,2) default 0,
  usage_limit int,
  used_count int default 0,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.coupons enable row level security;

drop policy if exists "Public read coupons" on public.coupons;
drop policy if exists "Auth manage coupons" on public.coupons;

create policy "Public read coupons"
on public.coupons
for select
using (true);

create policy "Auth manage coupons"
on public.coupons
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- ============================================================
-- 3) جدول الطلبات (لتفعيل الإحصائيات ولوحة المبيعات)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) default 0,
  total numeric(12,2) not null default 0,
  coupon_code text,
  payment_method text default 'whatsapp_cod', -- 'whatsapp_cod' | 'bank_transfer'
  status text default 'pending', -- pending | pending_payment | confirmed | shipped | completed | cancelled
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "Public can create orders" on public.orders;
drop policy if exists "Auth read orders" on public.orders;
drop policy if exists "Auth manage orders" on public.orders;

-- أي زائر (حتى من غير تسجيل دخول) يقدر ينشئ طلب - ده اللي بيحصل لما العميل يضغط "إتمام الطلب"
create policy "Public can create orders"
on public.orders
for insert
with check (true);

-- بس الأدمن (المسجل دخوله) يقدر يشوف/يعدل/يحذف الطلبات
create policy "Auth read orders"
on public.orders
for select
using (auth.role() = 'authenticated');

create policy "Auth manage orders"
on public.orders
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth delete orders"
on public.orders
for delete
using (auth.role() = 'authenticated');

-- ============================================================
-- تم بنجاح - الآن ارفع ملفات index.html / admin.html / config.js الجديدة
-- ============================================================
