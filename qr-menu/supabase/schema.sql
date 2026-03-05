-- Enable UUID generation helper
create extension if not exists pgcrypto;

-- =========================
-- TABLES
-- =========================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug text unique not null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamp default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  desc_ar text default '',
  desc_en text default '',
  price numeric not null,
  price_text text default null,
  image_url text default '',
  tags jsonb default '[]'::jsonb,
  sort_order int default 0,
  is_available boolean default true,
  created_at timestamp default now()
);

create table if not exists public.settings (
  id int primary key default 1,
  restaurant_name_ar text default 'Plan B',
  restaurant_name_en text default 'Plan B',
  currency text default 'EGP',
  tax_percent numeric default 14,
  vat_note_ar text default 'ضريبة %14 يضاف',
  vat_note_en text default 'All Prices are subjected to 14% VAT Tax',
  mains_note_ar text default '',
  mains_note_en text default '',
  constraint settings_single_row check (id = 1)
);

insert into public.settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.admins (
  user_id uuid primary key,
  email text unique not null,
  created_at timestamp default now()
);

-- =========================
-- RLS
-- =========================

alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.settings enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = uid
  );
$$;

-- clear older policies if rerun
 drop policy if exists "Public read active categories" on public.categories;
 drop policy if exists "Public read available items" on public.items;
 drop policy if exists "Public read settings" on public.settings;
 drop policy if exists "Admin insert categories" on public.categories;
 drop policy if exists "Admin update categories" on public.categories;
 drop policy if exists "Admin delete categories" on public.categories;
 drop policy if exists "Admin insert items" on public.items;
 drop policy if exists "Admin update items" on public.items;
 drop policy if exists "Admin delete items" on public.items;
 drop policy if exists "Admin insert settings" on public.settings;
 drop policy if exists "Admin update settings" on public.settings;
 drop policy if exists "Admin delete settings" on public.settings;
 drop policy if exists "Only admins manage admin rows" on public.admins;
 drop policy if exists "Users can read own admin record" on public.admins;

-- PUBLIC (QR users): read only active/available rows
create policy "Public read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Public read available items"
on public.items
for select
to anon, authenticated
using (is_available = true);

create policy "Public read settings"
on public.settings
for select
to anon, authenticated
using (id = 1);

-- ADMIN: write only if auth.uid() exists in admins table
create policy "Admin insert categories"
on public.categories
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admin update categories"
on public.categories
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete categories"
on public.categories
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admin insert items"
on public.items
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admin update items"
on public.items
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete items"
on public.items
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admin insert settings"
on public.settings
for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admin update settings"
on public.settings
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete settings"
on public.settings
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "Only admins manage admin rows"
on public.admins
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- =========================
-- STORAGE
-- =========================

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read menu images" on storage.objects;
drop policy if exists "Admin upload menu images" on storage.objects;
drop policy if exists "Admin update menu images" on storage.objects;
drop policy if exists "Admin delete menu images" on storage.objects;

create policy "Public read menu images"
on storage.objects
for select
to public
using (bucket_id = 'menu-images');

create policy "Admin upload menu images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'menu-images'
  and public.is_admin(auth.uid())
);

create policy "Admin update menu images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'menu-images'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'menu-images'
  and public.is_admin(auth.uid())
);

create policy "Admin delete menu images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'menu-images'
  and public.is_admin(auth.uid())
);

-- File path convention in app code:
-- menu-images/{categorySlug}/{itemId}-{timestamp}.jpg
