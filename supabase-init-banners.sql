-- supabase-init-banners.sql
-- SQL helper for setting up the `banners` table and basic policies.
-- NOTE: Supabase Storage buckets (for storing files) are created in the Supabase dashboard
-- or via the Supabase CLI / Admin API. They are NOT created via plain Postgres SQL.
-- See the "Bucket creation" section near the bottom of this file for instructions.

-- 1) Create table
CREATE TABLE IF NOT EXISTS public.banners (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gambar_url text,
  judul text,
  aktif boolean NOT NULL DEFAULT true,
  urutan integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------
-- Important: ensure the existing `mobil` table has a `banner_url` column
-- Many parts of the admin UI expect `mobil.banner_url` to exist. If your
-- `mobil` table does not have that column you'll see errors like:
--   "column mobil.banner_url does not exist"
-- The following ALTER will add the column if it's missing.
-- Run this in the same Supabase project where your `mobil` table lives.
-- -----------------------------------------------------------------
ALTER TABLE public.mobil
  ADD COLUMN IF NOT EXISTS banner_url text;

-- 2) Index for ordering
CREATE INDEX IF NOT EXISTS idx_banners_urutan ON public.banners (urutan);

-- 3) Enable Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 4) Policies
-- 4.a Public SELECT: allow unauthenticated users to SELECT only active banners
-- Drop policy if exists, then create (Postgres CREATE POLICY doesn't support IF NOT EXISTS)
DROP POLICY IF EXISTS public_select_active_banners ON public.banners;
CREATE POLICY public_select_active_banners
  ON public.banners
  FOR SELECT
  TO public
  USING (aktif = true);

-- Drop and recreate management policy (no IF NOT EXISTS support)
DROP POLICY IF EXISTS authenticated_manage_banners ON public.banners;
CREATE POLICY authenticated_manage_banners
  ON public.banners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Alternative: limit modifications to service_role (safer when using client-side keys)
-- You can run inserts/updates/deletes from server code using the service_role key
-- and avoid allowing client-side authenticated users to modify data.

-- 5) Example seed row (optional)
INSERT INTO public.banners (gambar_url, judul, aktif, urutan)
VALUES
  ('https://example.com/placeholder-banner.jpg', 'Contoh Banner', true, 1)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------
-- Bucket creation (Supabase Storage)
-- ------------------------------------------------------
-- Supabase Storage buckets are managed by the Storage API / Dashboard. You cannot
-- create a Storage bucket using plain Postgres SQL inside the Supabase SQL editor.
-- Two easy options to create the `banners` bucket:
-- 1) Supabase Dashboard (recommended):
--    - Open your Supabase project → Storage → Buckets → New bucket
--    - Name: banners
--    - Public: choose "Public" if you want files to be accessible via public URLs
--      (supabase.storage.from('banners').getPublicUrl(path) will return a public URL).
--      If you choose "Private", you'll need to use signed URLs for public access.
--    - Create bucket.
--
-- 2) Supabase CLI (if installed):
--    - Use the CLI to manage storage (check `supabase --help storage` for exact commands).
--    - Example (pseudo): `supabase storage bucket create banners --public`.
--      (CLI syntax may change; refer to supabase CLI docs.)
--
-- After creating the bucket:
-- - Ensure your frontend/backend uses the correct bucket name "banners".
-- - If you set the bucket to public, client-side uploads and `getPublicUrl` will work as
--   implemented in your admin code. If the bucket is private, use signed URLs or
--   perform uploads and URL generation from a trusted server using the service_role key.

-- ------------------------------------------------------
-- Security notes / next steps
-- ------------------------------------------------------
-- - Review the RLS policies above. The provided policy grants broad management rights
--   to any authenticated user which may not be suitable for production.
-- - Safer approaches:
--   * Add a `created_by uuid` column and set it to auth.uid() on insert; restrict
--     updates/deletes to rows where created_by = auth.uid() OR to a specific admin role.
--   * Perform banner create/update/delete operations on server-side using the
--     service_role key (keeps RLS strict for clients).
-- - Example owner column migration (optional):
-- ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS created_by uuid;
-- Then update the policy accordingly to check created_by = auth.uid() for updates/deletes.

-- End of file
