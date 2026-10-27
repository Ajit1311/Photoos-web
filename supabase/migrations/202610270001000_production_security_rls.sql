BEGIN;

-- =============================================================================
-- PHOTOOS PRODUCTION SECURITY & TENANT ROW LEVEL SECURITY (RLS)
-- Migration: 202610270001000_production_security_rls.sql
-- =============================================================================

-- 1. Helper function: Get current authenticated user ID safely
CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.uid(),
    NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
  );
$$;

-- 2. Helper function: Check if current authenticated user belongs to studio
CREATE OR REPLACE FUNCTION public.is_studio_member(p_studio_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.studio_members sm
    WHERE sm.studio_id = p_studio_id
      AND sm.profile_id = public.get_auth_uid()
      AND sm.status = 'active'
  );
$$;

-- 3. Helper function: Check if user is studio admin or owner
CREATE OR REPLACE FUNCTION public.is_studio_admin_or_owner(p_studio_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.studio_members sm
    LEFT JOIN public.roles r ON r.id = sm.role_id
    WHERE sm.studio_id = p_studio_id
      AND sm.profile_id = public.get_auth_uid()
      AND sm.status = 'active'
      AND (r.code IN ('owner', 'studio_owner', 'admin', 'studio_admin') OR sm.role_id IS NULL)
  );
$$;

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "profiles_select_own_or_studio" ON public.profiles;
    CREATE POLICY "profiles_select_own_or_studio" ON public.profiles
      FOR SELECT TO authenticated
      USING (
        id = public.get_auth_uid()
        OR EXISTS (
          SELECT 1 FROM public.studio_members sm1
          JOIN public.studio_members sm2 ON sm1.studio_id = sm2.studio_id
          WHERE sm1.profile_id = public.get_auth_uid()
            AND sm2.profile_id = public.profiles.id
            AND sm1.status = 'active'
        )
      );

    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    CREATE POLICY "profiles_update_own" ON public.profiles
      FOR UPDATE TO authenticated
      USING (id = public.get_auth_uid())
      WITH CHECK (id = public.get_auth_uid());

    DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
    CREATE POLICY "profiles_insert_own" ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (id = public.get_auth_uid());
  END IF;
END $$;

-- =============================================================================
-- STUDIOS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'studios') THEN
    ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "studios_select_member" ON public.studios;
    CREATE POLICY "studios_select_member" ON public.studios
      FOR SELECT TO authenticated
      USING (public.is_studio_member(id));

    DROP POLICY IF EXISTS "studios_update_admin" ON public.studios;
    CREATE POLICY "studios_update_admin" ON public.studios
      FOR UPDATE TO authenticated
      USING (public.is_studio_admin_or_owner(id))
      WITH CHECK (public.is_studio_admin_or_owner(id));

    DROP POLICY IF EXISTS "studios_insert_authenticated" ON public.studios;
    CREATE POLICY "studios_insert_authenticated" ON public.studios
      FOR INSERT TO authenticated
      WITH CHECK (public.get_auth_uid() IS NOT NULL);
  END IF;
END $$;

-- =============================================================================
-- STUDIO_MEMBERS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'studio_members') THEN
    ALTER TABLE public.studio_members ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "studio_members_select" ON public.studio_members;
    CREATE POLICY "studio_members_select" ON public.studio_members
      FOR SELECT TO authenticated
      USING (
        profile_id = public.get_auth_uid()
        OR public.is_studio_member(studio_id)
      );

    DROP POLICY IF EXISTS "studio_members_modify_admin" ON public.studio_members;
    CREATE POLICY "studio_members_modify_admin" ON public.studio_members
      FOR ALL TO authenticated
      USING (public.is_studio_admin_or_owner(studio_id))
      WITH CHECK (public.is_studio_admin_or_owner(studio_id));
  END IF;
END $$;

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "events_tenant_select" ON public.events;
    CREATE POLICY "events_tenant_select" ON public.events
      FOR SELECT TO authenticated
      USING (public.is_studio_member(studio_id));

    DROP POLICY IF EXISTS "events_tenant_modify" ON public.events;
    CREATE POLICY "events_tenant_modify" ON public.events
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));

    -- Public guest access strictly scoped to published public galleries
    DROP POLICY IF EXISTS "events_public_gallery_read" ON public.events;
    CREATE POLICY "events_public_gallery_read" ON public.events
      FOR SELECT TO anon
      USING (
        is_published = TRUE
        OR is_public = TRUE
      );
  END IF;
END $$;

-- =============================================================================
-- EVENT_PHOTOS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_photos') THEN
    ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "event_photos_tenant_select" ON public.event_photos;
    CREATE POLICY "event_photos_tenant_select" ON public.event_photos
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = public.event_photos.event_id
            AND public.is_studio_member(e.studio_id)
        )
      );

    DROP POLICY IF EXISTS "event_photos_tenant_modify" ON public.event_photos;
    CREATE POLICY "event_photos_tenant_modify" ON public.event_photos
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = public.event_photos.event_id
            AND public.is_studio_member(e.studio_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = public.event_photos.event_id
            AND public.is_studio_member(e.studio_id)
        )
      );

    -- Anonymous guest access strictly to published event photos
    DROP POLICY IF EXISTS "event_photos_public_gallery_read" ON public.event_photos;
    CREATE POLICY "event_photos_public_gallery_read" ON public.event_photos
      FOR SELECT TO anon
      USING (
        EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = public.event_photos.event_id
            AND (e.is_published = TRUE OR e.is_public = TRUE)
        )
      );
  END IF;
END $$;

-- =============================================================================
-- ASSETS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets') THEN
    ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "assets_tenant_isolation" ON public.assets;
    CREATE POLICY "assets_tenant_isolation" ON public.assets
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;
END $$;

-- =============================================================================
-- CRM: LEADS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "leads_tenant_isolation" ON public.leads;
    CREATE POLICY "leads_tenant_isolation" ON public.leads
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;
END $$;

-- =============================================================================
-- CRM: FOLLOW_UPS TABLE
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follow_ups') THEN
    ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "follow_ups_tenant_isolation" ON public.follow_ups;
    CREATE POLICY "follow_ups_tenant_isolation" ON public.follow_ups
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;
END $$;

-- =============================================================================
-- MARKETING CAMPAIGNS
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketing_campaigns') THEN
    ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "marketing_campaigns_tenant_isolation" ON public.marketing_campaigns;
    CREATE POLICY "marketing_campaigns_tenant_isolation" ON public.marketing_campaigns
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;
END $$;

-- =============================================================================
-- AI JOBS & PIPELINE RUNS
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_jobs') THEN
    ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ai_jobs_tenant_isolation" ON public.ai_jobs;
    CREATE POLICY "ai_jobs_tenant_isolation" ON public.ai_jobs
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_processing_jobs') THEN
    ALTER TABLE public.ai_processing_jobs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ai_proc_jobs_tenant_isolation" ON public.ai_processing_jobs;
    CREATE POLICY "ai_proc_jobs_tenant_isolation" ON public.ai_processing_jobs
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_pipeline_runs') THEN
    ALTER TABLE public.ai_pipeline_runs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ai_pipeline_runs_tenant_isolation" ON public.ai_pipeline_runs;
    CREATE POLICY "ai_pipeline_runs_tenant_isolation" ON public.ai_pipeline_runs
      FOR ALL TO authenticated
      USING (public.is_studio_member(studio_id))
      WITH CHECK (public.is_studio_member(studio_id));
  END IF;
END $$;

-- =============================================================================
-- DPDP ACT 2023: USER CONSENT LOG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  consent_type VARCHAR(64) NOT NULL, -- 'facial_biometrics', 'marketing_communication', 'data_processing'
  status VARCHAR(32) NOT NULL DEFAULT 'granted', -- 'granted', 'withdrawn'
  ip_address VARCHAR(45),
  user_agent TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_privacy_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_privacy_consents_user_access" ON public.user_privacy_consents;
CREATE POLICY "user_privacy_consents_user_access" ON public.user_privacy_consents
  FOR ALL TO authenticated
  USING (profile_id = public.get_auth_uid())
  WITH CHECK (profile_id = public.get_auth_uid());

-- =============================================================================
-- PERFORMANCE INDEXES (FOR EFFICIENT RLS FILTERING)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_studio_members_profile_studio
  ON public.studio_members (profile_id, studio_id, status);

CREATE INDEX IF NOT EXISTS idx_events_studio_id
  ON public.events (studio_id);

CREATE INDEX IF NOT EXISTS idx_event_photos_event_id
  ON public.event_photos (event_id);

CREATE INDEX IF NOT EXISTS idx_leads_studio_assigned
  ON public.leads (studio_id, assigned_to);

CREATE INDEX IF NOT EXISTS idx_follow_ups_studio_assigned
  ON public.follow_ups (studio_id, assigned_to);

CREATE INDEX IF NOT EXISTS idx_user_privacy_consents_profile
  ON public.user_privacy_consents (profile_id, consent_type);

COMMIT;

