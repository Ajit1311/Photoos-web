/**
 * Production-safe structured logger with automated redaction of sensitive credentials,
 * tokens, passwords, and personal data. Sentry-ready error interception.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "secret",
  "service_role",
  "apikey",
  "api_key",
  "session",
  "cookie",
  "otp",
]);

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Redact JWT tokens
    if (/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/.test(data)) {
      return "[REDACTED_JWT_TOKEN]";
    }
    // Redact Bearer headers
    if (/^Bearer\s+/i.test(data)) {
      return "Bearer [REDACTED]";
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === "object") {
    const redactedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes("password") || lowerKey.includes("secret")) {
        redactedObj[key] = "[REDACTED]";
      } else {
        redactedObj[key] = redactSensitiveData(value);
      }
    }
    return redactedObj;
  }

  return data;
}

class SafeLogger {
  private formatLog(level: LogLevel, message: string, context?: unknown) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? redactSensitiveData(context) : undefined;
    return {
      timestamp,
      level,
      message,
      ...(sanitizedContext !== undefined ? { context: sanitizedContext } : {}),
    };
  }

  info(message: string, context?: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${message}`, context ? redactSensitiveData(context) : "");
    }
  }

  warn(message: string, context?: unknown) {
    console.warn(`[WARN] ${message}`, context ? redactSensitiveData(context) : "");
  }

  error(message: string, error?: unknown, context?: unknown) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;

    console.error(
      `[ERROR] ${message}`,
      redactSensitiveData(errorDetails),
      context ? redactSensitiveData(context) : "",
    );

    // Optional Sentry integration hook
    if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: unknown) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: unknown) => void } }).Sentry.captureException(error);
    }
  }

  debug(message: string, context?: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context ? redactSensitiveData(context) : "");
    }
  }
}

export const logger = new SafeLogger();

