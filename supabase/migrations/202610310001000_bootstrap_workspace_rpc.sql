-- =============================================================================
-- Migration: 202610310001000_bootstrap_workspace_rpc.sql
-- Description: RPC functions for secure workspace bootstrap and studio profile updates.
-- =============================================================================

-- 1. bootstrap_workspace RPC
CREATE OR REPLACE FUNCTION public.bootstrap_workspace(
  p_profile_id UUID,
  p_studio_name TEXT DEFAULT 'My Studio',
  p_contact_phone TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_uid UUID;
  v_studio_id UUID;
  v_studio_name TEXT;
  v_member_id UUID;
  v_role_id UUID;
  v_created BOOLEAN := false;
  v_user_email TEXT;
BEGIN
  -- Authenticate caller: Must match auth.uid() or be service_role
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NOT NULL AND v_auth_uid <> p_profile_id THEN
    RAISE EXCEPTION 'Access denied. You can only bootstrap your own workspace.';
  END IF;

  v_studio_name := COALESCE(NULLIF(TRIM(p_studio_name), ''), 'My Studio');

  -- Ensure profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_profile_id) THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = p_profile_id;
    INSERT INTO public.profiles (id, email, full_name, status, created_at)
    VALUES (
      p_profile_id,
      v_user_email,
      'Studio Owner',
      'active',
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 1. Check existing active membership
  SELECT sm.studio_id, sm.id, sm.role_id
  INTO v_studio_id, v_member_id, v_role_id
  FROM public.studio_members sm
  WHERE sm.profile_id = p_profile_id
    AND sm.status = 'active'
  LIMIT 1;

  IF v_studio_id IS NOT NULL THEN
    SELECT name INTO v_studio_name FROM public.studios WHERE id = v_studio_id;
    RETURN jsonb_build_object(
      'success', true,
      'created', false,
      'studio_id', v_studio_id,
      'membership_id', v_member_id,
      'organization_id', '',
      'studio', jsonb_build_object('id', v_studio_id, 'name', COALESCE(v_studio_name, 'My Studio')),
      'membership', jsonb_build_object('id', v_member_id, 'studio_id', v_studio_id, 'role_id', v_role_id)
    );
  END IF;

  -- 2. Check if studio already owned by this user
  SELECT id, name
  INTO v_studio_id, v_studio_name
  FROM public.studios
  WHERE owner_profile_id = p_profile_id
  LIMIT 1;

  -- 3. If no studio exists, create new one
  IF v_studio_id IS NULL THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = p_profile_id;

    INSERT INTO public.studios (
      name,
      brand_name,
      owner_profile_id,
      contact_email,
      contact_phone,
      city,
      address,
      status,
      created_at,
      updated_at
    )
    VALUES (
      v_studio_name,
      v_studio_name,
      p_profile_id,
      v_user_email,
      p_contact_phone,
      COALESCE(p_city, 'Pune'),
      CASE WHEN p_city IS NOT NULL THEN p_city || ', Maharashtra' ELSE NULL END,
      'active',
      now(),
      now()
    )
    RETURNING id, name INTO v_studio_id, v_studio_name;

    v_created := true;
  END IF;

  -- 4. Find role_id for owner
  SELECT id INTO v_role_id
  FROM public.roles
  WHERE code IN ('studio_owner', 'owner', 'admin')
  ORDER BY created_at ASC
  LIMIT 1;

  -- 5. Insert studio_members link
  INSERT INTO public.studio_members (
    studio_id,
    profile_id,
    role_id,
    status,
    created_at
  )
  VALUES (
    v_studio_id,
    p_profile_id,
    v_role_id,
    'active',
    now()
  )
  ON CONFLICT (studio_id, profile_id)
  DO UPDATE SET status = 'active'
  RETURNING id INTO v_member_id;

  -- 6. Ensure default 7-day free trial subscription
  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE studio_id = v_studio_id) THEN
    INSERT INTO public.subscriptions (
      studio_id,
      plan_id,
      status,
      trial_start_at,
      trial_end_at,
      subscription_start_at,
      subscription_end_at,
      created_by
    )
    VALUES (
      v_studio_id,
      'photoos_free_trial_7_day',
      'trial',
      now(),
      now() + INTERVAL '7 days',
      now(),
      now() + INTERVAL '7 days',
      p_profile_id
    )
    ON CONFLICT (studio_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'created', v_created,
    'studio_id', v_studio_id,
    'membership_id', v_member_id,
    'organization_id', '',
    'studio', jsonb_build_object('id', v_studio_id, 'name', v_studio_name),
    'membership', jsonb_build_object('id', v_member_id, 'studio_id', v_studio_id, 'role_id', v_role_id)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_workspace(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 2. update_studio_profile RPC
CREATE OR REPLACE FUNCTION public.update_studio_profile(
  p_studio_id UUID,
  p_name TEXT DEFAULT NULL,
  p_owner_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_instagram_url TEXT DEFAULT NULL,
  p_facebook_url TEXT DEFAULT NULL,
  p_youtube_url TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_uid UUID;
  v_updated RECORD;
BEGIN
  v_auth_uid := auth.uid();

  -- Verify permissions: User must be studio member/owner or service_role
  IF v_auth_uid IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.studio_members sm
      WHERE sm.studio_id = p_studio_id
        AND sm.profile_id = v_auth_uid
        AND sm.status = 'active'
    ) AND NOT EXISTS (
      SELECT 1 FROM public.studios s
      WHERE s.id = p_studio_id
        AND s.owner_profile_id = v_auth_uid
    ) THEN
      RAISE EXCEPTION 'Access denied. You do not have permission to update this studio.';
    END IF;
  END IF;

  -- Update studios table
  UPDATE public.studios
  SET
    name = COALESCE(NULLIF(TRIM(p_name), ''), name),
    brand_name = COALESCE(NULLIF(TRIM(p_name), ''), brand_name, name),
    description = COALESCE(p_description, description),
    contact_email = COALESCE(p_contact_email, contact_email),
    contact_phone = COALESCE(p_contact_phone, contact_phone),
    address = COALESCE(p_address, address),
    city = COALESCE(p_city, city),
    state = COALESCE(p_state, state),
    country = COALESCE(p_country, country),
    postal_code = COALESCE(p_postal_code, postal_code),
    website = COALESCE(p_website, website),
    instagram_url = COALESCE(p_instagram_url, instagram_url),
    facebook_url = COALESCE(p_facebook_url, facebook_url),
    youtube_url = COALESCE(p_youtube_url, youtube_url),
    logo_url = COALESCE(p_logo_url, logo_url),
    updated_at = now()
  WHERE id = p_studio_id
  RETURNING * INTO v_updated;

  -- Update owner name in profile if provided
  IF v_auth_uid IS NOT NULL AND p_owner_name IS NOT NULL AND TRIM(p_owner_name) <> '' THEN
    UPDATE public.profiles
    SET full_name = TRIM(p_owner_name),
        updated_at = now()
    WHERE id = v_auth_uid;
  END IF;

  RETURN jsonb_build_object(
    'id', v_updated.id,
    'name', v_updated.name,
    'owner_name', p_owner_name,
    'description', v_updated.description,
    'contact_email', v_updated.contact_email,
    'contact_phone', v_updated.contact_phone,
    'address', v_updated.address,
    'city', v_updated.city,
    'state', v_updated.state,
    'country', v_updated.country,
    'postal_code', v_updated.postal_code,
    'website', v_updated.website,
    'instagram_url', v_updated.instagram_url,
    'facebook_url', v_updated.facebook_url,
    'youtube_url', v_updated.youtube_url,
    'logo_url', v_updated.logo_url
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_studio_profile(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated, service_role;

-- 3. RLS Policy Enhancements for Self-Service Studio Owners
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'studios') THEN
    -- Allow owners to always view and modify their own studio
    DROP POLICY IF EXISTS "studios_owner_manage" ON public.studios;
    CREATE POLICY "studios_owner_manage" ON public.studios
      FOR ALL TO authenticated
      USING (owner_profile_id = public.get_auth_uid())
      WITH CHECK (owner_profile_id = public.get_auth_uid());
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'studio_members') THEN
    -- Allow studio owners to insert their own membership linking to a studio they own
    DROP POLICY IF EXISTS "studio_members_owner_insert" ON public.studio_members;
    CREATE POLICY "studio_members_owner_insert" ON public.studio_members
      FOR INSERT TO authenticated
      WITH CHECK (
        profile_id = public.get_auth_uid()
        OR EXISTS (
          SELECT 1 FROM public.studios s
          WHERE s.id = studio_id AND s.owner_profile_id = public.get_auth_uid()
        )
      );
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
    -- Allow studio members and owners to insert subscriptions for their own studio
    DROP POLICY IF EXISTS "subscriptions_owner_insert" ON public.subscriptions;
    CREATE POLICY "subscriptions_owner_insert" ON public.subscriptions
      FOR INSERT TO authenticated
      WITH CHECK (
        created_by = public.get_auth_uid()
        OR EXISTS (
          SELECT 1 FROM public.studios s
          WHERE s.id = studio_id AND s.owner_profile_id = public.get_auth_uid()
        )
      );
  END IF;
END $$;


