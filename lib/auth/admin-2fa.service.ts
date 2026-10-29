import crypto from "node:crypto";
import { sendEmailWithResend, EmailTemplates } from "@/lib/email/resend";

export interface AdminChallenge {
  challengeId: string;
  userId: string;
  email: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
}

export interface AdminSessionRecord {
  sessionToken: string;
  userId: string;
  platformAdminId: string;
  profileId: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

// In-memory active challenges and sessions
const activeChallenges = new Map<string, AdminChallenge>();
const activeSessions = new Map<string, AdminSessionRecord>();

// Cleanup expired entries periodically
function cleanupExpired() {
  const now = Date.now();
  for (const [id, challenge] of activeChallenges.entries()) {
    if (challenge.expiresAt < now) {
      activeChallenges.delete(id);
    }
  }
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}

function hashString(val: string): string {
  return crypto.createHash("sha256").update(val).digest("hex");
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Validates Master Founder / Platform Admin credentials
 */
export async function validateAdminCredentials(
  userIdInput: string,
  passwordInput: string
): Promise<{ valid: boolean; email: string }> {
  const envUserId = (process.env.ADMIN_USER_ID || "ADMIN_FOUNDER").trim().toUpperCase();
  const envPassword = process.env.ADMIN_PASSWORD || "PhotoOS@Founder2026!";
  const targetEmail = process.env.ADMIN_2FA_EMAIL || "adskartmedia11@gmail.com";

  const cleanUser = userIdInput.trim().toUpperCase();

  // Accept ADMIN_FOUNDER, FOUNDER_OPS, or founder email as user ID
  const isMatchUser =
    cleanUser === envUserId ||
    cleanUser === "FOUNDER" ||
    cleanUser === "FOUNDER_OPS" ||
    cleanUser === "AJIT_ADMIN" ||
    cleanUser.toLowerCase() === targetEmail.toLowerCase() ||
    cleanUser === "FOUNDER@PHOTOOS.IN";

  if (isMatchUser && passwordInput === envPassword) {
    return { valid: true, email: targetEmail };
  }

  return { valid: false, email: "" };
}

/**
 * Step 1: Initiate Admin Login and dispatch 6-digit OTP via Resend
 */
export async function initiateAdminLogin(
  userIdInput: string,
  passwordInput: string
): Promise<{ success: boolean; challengeId?: string; maskedEmail?: string; error?: string }> {
  cleanupExpired();

  const { valid, email } = await validateAdminCredentials(userIdInput, passwordInput);

  if (!valid) {
    return {
      success: false,
      error: "Invalid Admin User ID or Password.",
    };
  }

  // Generate 6-digit OTP (e.g. 749204)
  const otpNumber = Math.floor(100000 + Math.random() * 900000);
  const otpString = String(otpNumber);
  const challengeId = `chl_${crypto.randomBytes(16).toString("hex")}`;

  const challenge: AdminChallenge = {
    challengeId,
    userId: userIdInput.trim().toUpperCase(),
    email,
    otpHash: hashString(otpString),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  };

  activeChallenges.set(challengeId, challenge);

  // Send 2FA Code via Resend (noreply@photoos.in)
  try {
    await sendEmailWithResend({
      department: "noreply",
      to: email,
      subject: `🔐 Your PhotoOS Operations Console 2FA Code: ${otpString}`,
      html: EmailTemplates.otpVerification({
        otp: otpString,
        purpose: "PhotoOS Operations Console Admin Sign-In",
      }),
    });
  } catch (emailErr) {
    console.error("[Admin2FA] Failed to dispatch OTP email via Resend:", emailErr);
  }

  return {
    success: true,
    challengeId,
    maskedEmail: maskEmail(email),
  };
}

/**
 * Step 2: Verify 6-digit OTP and issue Platform Admin Session Token
 */
export async function verifyAdmin2FA(
  challengeId: string,
  otpInput: string
): Promise<{
  success: boolean;
  sessionToken?: string;
  adminData?: {
    platform_admin_id: string;
    profile_id: string;
    session_id: string;
    user_id: string;
    status: string;
    must_change_password: boolean;
    last_login_at: string;
    password_changed_at: null;
    expires_at: string;
  };
  error?: string;
}> {
  cleanupExpired();

  const challenge = activeChallenges.get(challengeId);

  if (!challenge) {
    return {
      success: false,
      error: "Authentication session expired or not found. Please restart login.",
    };
  }

  if (challenge.expiresAt < Date.now()) {
    activeChallenges.delete(challengeId);
    return {
      success: false,
      error: "OTP code has expired. Please request a new code.",
    };
  }

  challenge.attempts += 1;

  if (challenge.attempts > 3) {
    activeChallenges.delete(challengeId);
    return {
      success: false,
      error: "Maximum verification attempts exceeded. Please restart login.",
    };
  }

  const cleanOtp = otpInput.trim();
  const inputHash = hashString(cleanOtp);

  if (inputHash !== challenge.otpHash) {
    return {
      success: false,
      error: `Invalid verification code. ${3 - challenge.attempts} attempts remaining.`,
    };
  }

  // OTP verified! Remove challenge
  activeChallenges.delete(challengeId);

  // Generate 12-hour session token
  const sessionToken = `ops_${crypto.randomBytes(32).toString("hex")}`;
  const platformAdminId = "00000000-0000-0000-0000-000000000001";
  const profileId = "00000000-0000-0000-0000-000000000001";
  const expiresAtMs = Date.now() + 12 * 60 * 60 * 1000;

  const sessionRecord: AdminSessionRecord = {
    sessionToken,
    userId: challenge.userId,
    platformAdminId,
    profileId,
    email: challenge.email,
    expiresAt: expiresAtMs,
    createdAt: Date.now(),
  };

  activeSessions.set(sessionToken, sessionRecord);

  return {
    success: true,
    sessionToken,
    adminData: {
      platform_admin_id: platformAdminId,
      profile_id: profileId,
      session_id: sessionToken,
      user_id: challenge.userId,
      status: "active",
      must_change_password: false,
      last_login_at: new Date().toISOString(),
      password_changed_at: null,
      expires_at: new Date(expiresAtMs).toISOString(),
    },
  };
}

/**
 * Validate an active admin session token
 */
export function validateAdminSession(sessionToken: string): AdminSessionRecord | null {
  cleanupExpired();
  if (!sessionToken) return null;
  const session = activeSessions.get(sessionToken);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    activeSessions.delete(sessionToken);
    return null;
  }
  return session;
}
