export const supabaseUrl: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

export const publishableKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const appUrl: string =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Returns the base URL for Supabase Edge Functions.
 * Never hardcodes localhost/127.0.0.1 in production.
 */
export function getSupabaseFunctionsBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  return `${base.replace(/\/+$/, "")}/functions/v1`;
}

/**
 * Returns the full URL for a specific Supabase Edge Function.
 */
export function getSupabaseFunctionUrl(functionName: string): string {
  return `${getSupabaseFunctionsBaseUrl()}/${functionName.replace(/^\/+/, "")}`;
}

/**
 * Validates whether an incoming request Origin matches the configured production subdomain.
 */
export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const configuredAppUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    // Allow configured app origin
    if (originUrl.origin === configuredAppUrl.origin) return true;

    // Allow local development origin only in development
    if (process.env.NODE_ENV === "development") {
      if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
        return true;
      }
    }

    // Check against allowed subdomain environment variable if present
    const allowedDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
    if (allowedDomain && (originUrl.hostname === allowedDomain || originUrl.hostname.endsWith(`.${allowedDomain}`))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
