function cleanSupabaseUrl(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/^['"]+|['"]+$/g, "");
  try {
    const parsed = new URL(cleaned);
    if (parsed.hostname === "supabase.com" && parsed.pathname.includes("/project/")) {
      const match = parsed.pathname.match(/\/project\/([a-z0-9_-]+)/i);
      if (match) return `https://${match[1]}.supabase.co`;
    }
    // Return only the origin (e.g. https://xyz.supabase.co) with NO trailing subpaths
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return cleaned.replace(/\/+$/, "");
  }
}

function cleanKey(raw: string): string {
  if (!raw) return "";
  return raw.trim().replace(/^['"]+|['"]+$/g, "");
}

function getFirstNonEmpty(...vals: (string | undefined)[]): string {
  for (const v of vals) {
    if (v && typeof v === "string" && v.trim().length > 0 && !v.includes("dummy_static_prerender")) {
      return v.trim();
    }
  }
  return "";
}

export const supabaseUrl: string = cleanSupabaseUrl(
  getFirstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    process.env.SUPABASE_URL,
  ) || "https://placeholder-project.supabase.co"
);

export const publishableKey: string = cleanKey(
  getFirstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.SUPABASE_KEY,
  ) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy_static_prerender_key"
);

export const appUrl: string =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Returns the base URL for Supabase Edge Functions.
 * Never hardcodes localhost/127.0.0.1 in production.
 * In browser environments, routes safely through internal Next.js server proxy.
 */
export function getSupabaseFunctionsBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/platform-admin";
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  return `${base.replace(/\/+$/, "")}/functions/v1`;
}

/**
 * Returns the full URL for a specific Supabase Edge Function.
 */
export function getSupabaseFunctionUrl(functionName: string): string {
  const cleanFn = functionName.replace(/^\/+/, "");
  if (typeof window !== "undefined") {
    return `/api/platform-admin/${cleanFn}`;
  }
  return `${getSupabaseFunctionsBaseUrl()}/${cleanFn}`;
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

    // Allow client app on GitHub Pages and PhotoOS domains
    if (
      originUrl.hostname === "ajit1311.github.io" ||
      originUrl.hostname.endsWith(".github.io") ||
      originUrl.hostname === "photoos.in" ||
      originUrl.hostname.endsWith(".photoos.in") ||
      originUrl.hostname === "photoos.app" ||
      originUrl.hostname.endsWith(".photoos.app")
    ) {
      return true;
    }

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
