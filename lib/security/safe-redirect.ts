/**
 * Safe redirect validator to prevent Open Redirect attacks.
 * Disallows arbitrary external destinations, javascript: schemes, or protocol-relative URLs.
 */

export function getSafeRedirectUrl(
  target: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!target) {
    return fallback;
  }

  const trimmed = target.trim();

  // Reject empty or whitespace
  if (!trimmed) {
    return fallback;
  }

  // Reject dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return fallback;
  }

  // Check if it is a relative path
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    // Valid relative path
    return trimmed;
  }

  // If it's an absolute URL, check against allowed production domain
  try {
    const url = new URL(trimmed);
    const configuredAppUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    if (url.origin === configuredAppUrl.origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    const allowedDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
    if (allowedDomain && (url.hostname === allowedDomain || url.hostname.endsWith(`.${allowedDomain}`))) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    // In local development allow localhost
    if (process.env.NODE_ENV === "development" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

