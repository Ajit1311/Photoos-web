BEGIN;

ALTER TABLE public.subscription_plans
ENABLE ROW LEVEL SECURITY;

GRANT SELECT
ON TABLE public.subscription_plans
TO anon, authenticated;

DROP POLICY IF EXISTS subscription_plans_public_active_read
ON public.subscription_plans;

CREATE POLICY subscription_plans_public_active_read
ON public.subscription_plans
FOR SELECT
TO anon, authenticated
USING (
  is_active = TRUE
);

COMMIT;
