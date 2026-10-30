-- ============================================================
-- PhotoOS Studio Marketplace Availability Migration
-- File: supabase/migrations/202610300001000_studio_marketplace_availability.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.studio_marketplace_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  availability_date DATE NOT NULL,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'half_day', 'unavailable')),
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  reason TEXT,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('default', 'manual', 'booking')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_studio_availability_date UNIQUE (studio_id, availability_date)
);

-- Indexes for efficient calendar querying
CREATE INDEX IF NOT EXISTS idx_studio_availability_studio_date 
  ON public.studio_marketplace_availability (studio_id, availability_date);

-- Enable RLS
ALTER TABLE public.studio_marketplace_availability ENABLE ROW LEVEL SECURITY;

-- 1. Anyone authenticated can read marketplace availability (public calendar view for clients & marketplace)
DROP POLICY IF EXISTS "Public can view studio marketplace availability" ON public.studio_marketplace_availability;
CREATE POLICY "Public can view studio marketplace availability"
  ON public.studio_marketplace_availability
  FOR SELECT
  TO public
  USING (true);

-- 2. Studio members and owners can manage their own studio's availability
DROP POLICY IF EXISTS "Studio members can manage availability" ON public.studio_marketplace_availability;
CREATE POLICY "Studio members can manage availability"
  ON public.studio_marketplace_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studio_members sm
      WHERE sm.studio_id = studio_marketplace_availability.studio_id
        AND sm.profile_id = auth.uid()
        AND sm.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.studios s
      WHERE s.id = studio_marketplace_availability.studio_id
        AND s.owner_profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.studio_members sm
      WHERE sm.studio_id = studio_marketplace_availability.studio_id
        AND sm.profile_id = auth.uid()
        AND sm.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.studios s
      WHERE s.id = studio_marketplace_availability.studio_id
        AND s.owner_profile_id = auth.uid()
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role has full access to studio availability" ON public.studio_marketplace_availability;
CREATE POLICY "Service role has full access to studio availability"
  ON public.studio_marketplace_availability
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

