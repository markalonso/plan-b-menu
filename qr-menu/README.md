# qr-menu

Vite + React + TypeScript + Tailwind starter for a mobile-first QR restaurant menu.

## Supabase backend setup (menu data + admin + storage)

### 1) Paste SQL (database + RLS + storage policies)

- Open your Supabase project → **SQL Editor**.
- Copy and run the full SQL file:
  - `supabase/schema.sql`

This creates:
- `categories`
- `items`
- `settings` (single row, default `id=1`)
- `admins`
- RLS policies for public reads and admin writes
- storage bucket and policies for `menu-images`

### 2) Add an admin manually

- Create/sign in a user under **Authentication → Users**.
- Copy that user `id`.
- Insert admin row:

```sql
insert into public.admins (user_id, email)
values ('YOUR_AUTH_USER_UUID', 'you@example.com')
on conflict (user_id) do nothing;
```

Only users listed in `admins` can insert/update/delete categories, items, settings, and storage objects.

### 3) Create storage bucket (if not already created by SQL)

Bucket name:
- `menu-images`

Expected path structure for uploads:
- `menu-images/{categorySlug}/{itemId}-{timestamp}.jpg`

Public read is allowed; uploads/updates/deletes are admin-only via RLS policy.

### 4) Add environment keys

Create `qr-menu/.env.local`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

You can copy from template:

```bash
cp .env.example .env.local
```

## Wiring files

- Supabase client: `src/lib/supabase.ts`
- Menu API helpers: `src/lib/api/menu.ts`
- Auth helpers: `src/lib/auth.ts`

## Local development

```bash
cd qr-menu
npm install
npm run dev
```
