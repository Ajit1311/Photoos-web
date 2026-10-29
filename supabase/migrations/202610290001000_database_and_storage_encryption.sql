BEGIN;

-- =============================================================================
-- PHOTOOS ENTERPRISE: DATABASE & STORAGE ENCRYPTION HARDENING
-- Migration: 202610290001000_database_and_storage_encryption.sql
-- =============================================================================

-- 1. Enable Cryptographic Extension (pgcrypto) for AES-256 encryption at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Database Column Encryption Function (AES-256 Symmetric Encryption)
CREATE OR REPLACE FUNCTION public.encrypt_aes256(p_plaintext TEXT, p_key TEXT)
RETURNS BYTEA
LANGUAGE sql
IMMUTABLE
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_plaintext IS NULL OR p_plaintext = '' THEN NULL
    ELSE pgp_sym_encrypt(p_plaintext, p_key, 'cipher-algo=aes256, compress-algo=1')
  END;
$$;

-- 3. Database Column Decryption Function (AES-256)
CREATE OR REPLACE FUNCTION public.decrypt_aes256(p_ciphertext BYTEA, p_key TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_ciphertext IS NULL THEN NULL
    ELSE pgp_sym_decrypt(p_ciphertext, p_key)
  END;
$$;

-- 4. Storage Bucket Encryption & Privacy Hardening
-- Enforce that all production storage buckets are private (public = false)
-- This ensures raw assets are never readable via public CDN URLs without expiring signed URLs
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'buckets') THEN
    UPDATE storage.buckets
    SET public = FALSE
    WHERE id IN ('assets', 'galleries', 'watermarks', 'exports', 'avatars', 'contracts');
  END IF;
END $$;

-- 5. Storage Row Level Security: Enforce Studio Tenant Isolation on storage.objects
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Authenticated studio members can only access objects within their studio directory
    DROP POLICY IF EXISTS "tenant_storage_access_policy" ON storage.objects;
    CREATE POLICY "tenant_storage_access_policy" ON storage.objects
      FOR ALL TO authenticated
      USING (
        bucket_id = 'assets'
        AND (
          EXISTS (
            SELECT 1 FROM public.studio_members sm
            WHERE sm.profile_id = public.get_auth_uid()
              AND sm.status = 'active'
              AND storage.objects.name LIKE 'studios/' || sm.studio_id::text || '/%'
          )
        )
      )
      WITH CHECK (
        bucket_id = 'assets'
        AND (
          EXISTS (
            SELECT 1 FROM public.studio_members sm
            WHERE sm.profile_id = public.get_auth_uid()
              AND sm.status = 'active'
              AND storage.objects.name LIKE 'studios/' || sm.studio_id::text || '/%'
          )
        )
      );

    -- Deny all anonymous direct reads to storage objects (signed URLs required)
    DROP POLICY IF EXISTS "deny_anon_direct_storage_reads" ON storage.objects;
    CREATE POLICY "deny_anon_direct_storage_reads" ON storage.objects
      FOR SELECT TO anon
      USING (FALSE);
  END IF;
END $$;

-- 6. Security & Data Protection Audit Log
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(64) NOT NULL, -- 'unauthorized_access', 'ssrf_attempt', 'export_leak_blocked', 'sensitive_data_decrypt'
  severity VARCHAR(16) NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
  user_id UUID,
  studio_id UUID,
  ip_address VARCHAR(45),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_admin_only" ON public.security_audit_logs;
CREATE POLICY "audit_logs_admin_only" ON public.security_audit_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studio_members sm
      LEFT JOIN public.roles r ON r.id = sm.role_id
      WHERE sm.profile_id = public.get_auth_uid()
        AND (r.code IN ('owner', 'admin') OR sm.role_id IS NULL)
    )
  );

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_studio_created
  ON public.security_audit_logs (studio_id, created_at DESC);

COMMIT;

