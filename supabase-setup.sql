-- ====================================================================
-- شغّل هذا الملف كامل مرة واحدة في: Supabase Dashboard > SQL Editor > New query
-- ====================================================================

-- 1) جدول الأقسام
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  icon text default '📦',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2) جدول المنتجات
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  old_price numeric,
  category text,
  image_url text,
  stock int default 0,
  featured boolean default false,
  created_at timestamptz default now()
);

-- 3) تفعيل حماية الصفوف (Row Level Security)
alter table categories enable row level security;
alter table products enable row level security;

-- 4) سياسات القراءة: أي زائر للموقع يقدر يشوف المنتجات والأقسام
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);

-- 5) سياسات الكتابة: فقط المستخدم المسجل دخوله (الأدمن) يقدر يضيف/يعدل/يحذف
create policy "Auth manage categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth manage products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 6) إدخال أقسام مبدئية (تقدر تعدلها/تضيف عليها من لوحة التحكم بعدين)
insert into categories (name, icon, sort_order) values
  ('كاميرات مراقبة', '📷', 1),
  ('أنظمة أمنية', '🛡️', 2),
  ('كمبيوتر ولابتوبات', '💻', 3),
  ('طابعات', '🖨️', 4),
  ('شبكات', '🌐', 5),
  ('UPS وحلول الطاقة', '🔋', 6),
  ('حلول IT متكاملة', '🖥️', 7)
on conflict (name) do nothing;

-- ====================================================================
-- 7) إعداد مكان تخزين صور المنتجات (Storage)
-- لازم تعمل الخطوات دي يدويًا من الواجهة (مش SQL):
--   أ) روح Storage (من القائمة الجانبية) > Create a new bucket
--   ب) اسم الـ bucket: products
--   ج) فعّل خيار "Public bucket"
-- بعدين ارجع هنا وشغّل الأسطر اللي تحت عشان تظبط الصلاحيات:
-- ====================================================================

create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'products');

create policy "Auth upload product images" on storage.objects
  for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Auth update product images" on storage.objects
  for update using (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Auth delete product images" on storage.objects
  for delete using (bucket_id = 'products' and auth.role() = 'authenticated');
