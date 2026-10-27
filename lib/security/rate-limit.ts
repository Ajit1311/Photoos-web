import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token bucket / sliding window cache
const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 60 seconds
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (record.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 60_000);

  // Allow process to exit cleanly
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
  /** Identifier prefix (e.g. 'auth-login', 'api-leads') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Extracts a client IP address securely from standard HTTP proxy headers.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const clientIp = xForwardedFor.split(",")[0].trim();
    if (clientIp) return clientIp;
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

/**
 * Checks and increments rate limit for an identifier (e.g. IP or userId).
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const prefix = options.prefix ?? "rl";
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;

  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    // New window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Creates a standard 429 Too Many Requests response with rate limit headers.
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customMessage = "Too many requests. Please try again later.",
): NextResponse {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000),
  );

  return NextResponse.json(
    {
      success: false,
      error: customMessage,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

/**
 * Attaches standard rate-limit headers to a response.
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  return response;
}

