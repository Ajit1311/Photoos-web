
BEGIN;


-- ============================================================
-- MARKETPLACE VERIFIED ADD-ON
-- ============================================================
--
-- This migration keeps marketplace_verified as a separate
-- subscription/add-on record.
--
-- It does not replace or modify the studio's base subscription.
--
-- Active badge condition:
--
-- status = active
-- AND subscription_start_at <= NOW()
-- AND
-- (
--   subscription_end_at IS NULL
--   OR subscription_end_at > NOW()
-- )
--
-- ============================================================


CREATE OR REPLACE FUNCTION
public.get_marketplace_verified_addon(
  p_studio_id UUID
)
RETURNS TABLE (
  is_active BOOLEAN,
  subscription_id UUID,
  status public.subscription_status,
  subscription_start_at TIMESTAMPTZ,
  subscription_end_at TIMESTAMPTZ,
  effective_access_end_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS
$$

  SELECT

    EXISTS (
      SELECT
        1
      FROM
        public.subscriptions s
      INNER JOIN
        public.subscription_plans sp
      ON
        sp.id = s.plan_id
      WHERE
        s.studio_id = p_studio_id
        AND sp.plan_code = 'marketplace_verified'
        AND s.status = 'active'
        AND
        (
          s.subscription_start_at IS NULL
          OR s.subscription_start_at <= NOW()
        )
        AND
        (
          s.subscription_end_at IS NULL
          OR s.subscription_end_at > NOW()
        )
    )
    AS is_active,


    (
      SELECT
        s.id
      FROM
        public.subscriptions s
      INNER JOIN
        public.subscription_plans sp
      ON
        sp.id = s.plan_id
      WHERE
        s.studio_id = p_studio_id
        AND sp.plan_code = 'marketplace_verified'
      ORDER BY
        s.subscription_end_at DESC NULLS LAST,
        s.created_at DESC
      LIMIT 1
    )
    AS subscription_id,


    (
      SELECT
        s.status
      FROM
        public.subscriptions s
      INNER JOIN
        public.subscription_plans sp
      ON
        sp.id = s.plan_id
      WHERE
        s.studio_id = p_studio_id
        AND sp.plan_code = 'marketplace_verified'
      ORDER BY
        s.subscription_end_at DESC NULLS LAST,
        s.created_at DESC
      LIMIT 1
    )
    AS status,


    (
      SELECT
        s.subscription_start_at
      FROM
        public.subscriptions s
      INNER JOIN
        public.subscription_plans sp
      ON
        sp.id = s.plan_id
      WHERE
        s.studio_id = p_studio_id
        AND sp.plan_code = 'marketplace_verified'
      ORDER BY
        s.subscription_end_at DESC NULLS LAST,
        s.created_at DESC
      LIMIT 1
    )
    AS subscription_start_at,


    (
      SELECT
        s.subscription_end_at
      FROM
        public.subscriptions s
      INNER JOIN
        public.subscription_plans sp
      ON
        sp.id = s.plan_id
      WHERE
        s.studio_id = p_studio_id
        AND sp.plan_code = 'marketplace_verified'
      ORDER BY
        s.subscription_end_at DESC NULLS LAST,
        s.created_at DESC
      LIMIT 1
    )
    AS subscription_end_at,


    (
      SELECT
        s.subscription_end_at
      FROM
        public.subscriptions s
      INNER JOIN
        public.subscription_plans sp
      ON
        sp.id = s.plan_id
      WHERE
        s.studio_id = p_studio_id
        AND sp.plan_code = 'marketplace_verified'
        AND s.status = 'active'
        AND
        (
          s.subscription_end_at IS NULL
          OR s.subscription_end_at > NOW()
        )
      ORDER BY
        s.subscription_end_at DESC NULLS LAST,
        s.created_at DESC
      LIMIT 1
    )
    AS effective_access_end_at;

$$;


REVOKE ALL
ON FUNCTION
public.get_marketplace_verified_addon(UUID)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION
public.get_marketplace_verified_addon(UUID)
TO authenticated;


-- ============================================================
-- TEST / LOCAL ACTIVATION RPC
-- ============================================================
--
-- Temporary helper for local development.
--
-- Later payment success flow can call the same activation logic.
--
-- ============================================================


CREATE OR REPLACE FUNCTION
public.activate_marketplace_verified_addon(
  p_studio_id UUID,
  p_valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
)
RETURNS public.subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS
$$

DECLARE

  v_plan_id UUID;

  v_existing_subscription
    public.subscriptions;

  v_result
    public.subscriptions;

BEGIN


  SELECT
    id
  INTO
    v_plan_id
  FROM
    public.subscription_plans
  WHERE
    plan_code = 'marketplace_verified'
    AND is_active = TRUE
  LIMIT 1;


  IF v_plan_id IS NULL THEN

    RAISE EXCEPTION
      'Marketplace verified add-on plan not found';

  END IF;


  SELECT
    *
  INTO
    v_existing_subscription
  FROM
    public.subscriptions
  WHERE
    studio_id = p_studio_id
    AND plan_id = v_plan_id
  ORDER BY
    created_at DESC
  LIMIT 1;


  IF FOUND THEN

    UPDATE
      public.subscriptions
    SET

      status = 'active',

      subscription_start_at = NOW(),

      subscription_end_at = p_valid_until,

      next_billing_at = NULL,

      updated_at = NOW()

    WHERE
      id = v_existing_subscription.id

    RETURNING
      *
    INTO
      v_result;


  ELSE

    INSERT INTO
      public.subscriptions
    (
      studio_id,
      plan_id,
      status,
      subscription_start_at,
      subscription_end_at,
      auto_renew,
      metadata
    )
    VALUES
    (
      p_studio_id,
      v_plan_id,
      'active',
      NOW(),
      p_valid_until,
      FALSE,
      jsonb_build_object(
        'subscription_type',
        'addon',
        'addon_code',
        'marketplace_verified'
      )
    )

    RETURNING
      *
    INTO
      v_result;

  END IF;


  RETURN
    v_result;


END;

$$;


REVOKE ALL
ON FUNCTION
public.activate_marketplace_verified_addon(
  UUID,
  TIMESTAMPTZ
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION
public.activate_marketplace_verified_addon(
  UUID,
  TIMESTAMPTZ
)
TO authenticated;


COMMIT;

