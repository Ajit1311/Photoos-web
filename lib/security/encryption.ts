/**
 * =============================================================================
 * PhotoOS Enterprise Security: AES-256-GCM Database & Storage Encryption
 * =============================================================================
 * Provides field-level encryption for sensitive client and financial data,
 * and standard server-side AES-256 encryption metadata for object storage.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const DEFAULT_SALT = "photoos-enterprise-storage-encryption-salt-2026";

/**
 * Resolves the 32-byte Master Encryption Key from environment variables.
 * Falls back to derived key from SUPABASE_SERVICE_ROLE_KEY or a secure seed.
 */
function getMasterKey(customSecret?: string): Buffer {
  const secret =
    customSecret ||
    process.env.PHOTOOS_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "photoos-fallback-dev-master-encryption-key-32b";

  return crypto.scryptSync(secret, DEFAULT_SALT, 32);
}

/**
 * Encrypts a string using AES-256-GCM.
 * Output format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */
export function encryptData(plaintext: string, customSecret?: string): string {
  if (!plaintext || typeof plaintext !== "string") {
    return "";
  }

  const key = getMasterKey(customSecret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM ciphertext created by `encryptData`.
 * Verifies authenticity with authentication tag (protects against tampering).
 */
export function decryptData(encryptedString: string, customSecret?: string): string {
  if (!encryptedString || typeof encryptedString !== "string") {
    return "";
  }

  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    // String is not in encrypted format (e.g. legacy plain text)
    return encryptedString;
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  try {
    const key = getMasterKey(customSecret);
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    if (iv.length !== IV_LENGTH || authTag.length !== TAG_LENGTH) {
      return encryptedString;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.warn("[Encryption] Decryption verification failed, returning original string:", err);
    return encryptedString;
  }
}

/**
 * Generates a deterministic SHA-256 HMAC hash for indexed search on encrypted fields
 * without exposing the raw data in database queries.
 */
export function hashSearchToken(value: string, customSecret?: string): string {
  if (!value) return "";
  const key = getMasterKey(customSecret);
  return crypto.createHmac("sha256", key).update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Masks sensitive identifiers (e.g. phone numbers, email addresses) for UI display.
 */
export function maskSensitiveData(value: string, visibleChars = 4): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length <= visibleChars) return trimmed;

  const visiblePart = trimmed.slice(-visibleChars);
  const maskedPart = "*".repeat(Math.max(trimmed.length - visibleChars, 4));
  return `${maskedPart}${visiblePart}`;
}

/**
 * Standard Storage Encryption Configuration for S3 / Cloudflare R2 / Supabase Storage.
 * Enforces AES-256 Server-Side Encryption (SSE-S3 / SSE-AES256) on every uploaded object.
 */
export const STORAGE_ENCRYPTION_CONFIG = {
  ServerSideEncryption: "AES256" as const,
  MetadataDirective: "COPY" as const,
};
