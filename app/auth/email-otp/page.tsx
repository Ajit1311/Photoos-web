"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getAccessToken,
  signOut,
} from "@/lib/auth/session";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const OTP_LENGTH = 6;

export default function EmailOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [nextPath, setNextPath] = useState(
    "/onboarding/studio",
  );

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] =
    useState(false);
  const [resending, setResending] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPage = useCallback(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const emailParam =
      params.get("email")?.trim() ?? "";

    const nextParam =
      params.get("next")?.trim() ?? "";

    setEmail(emailParam);

    if (
      nextParam &&
      nextParam.startsWith("/") &&
      !nextParam.startsWith("//")
    ) {
      setNextPath(nextParam);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const callOtp = async (
    action: "send" | "verify",
    code?: string,
  ) => {
    if (!SUPABASE_URL) {
      throw new Error(
        "Supabase URL is not configured.",
      );
    }

    const user =
      await getCurrentUser();

    if (!user) {
      throw new Error(
        "Your Supabase session has expired. Please sign in again.",
      );
    }

    const accessToken =
      await getAccessToken();

    if (!accessToken) {
      throw new Error(
        "Unable to establish Supabase authentication.",
      );
    }

    const response =
      await fetch(
        `${SUPABASE_URL}/functions/v1/email-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action,
            email:
              user.email ??
              email.trim(),
            ...(action === "verify"
              ? { otp: code }
              : {}),
          }),
        },
      );

    const data =
      await response.json().catch(
        () => null,
      );

    if (
      !response.ok ||
      !data?.success
    ) {
      throw new Error(
        (typeof data?.error === "string"
          ? data.error
          : data?.error?.message) ??
          "Unable to process email OTP.",
      );
    }

    return data;
  };

  const handleVerify = async () => {
    setError("");
    setMessage("");

    const normalizedOtp =
      otp.replace(/\D/g, "");

    if (
      normalizedOtp.length !==
      OTP_LENGTH
    ) {
      setError(
        "Enter the 6-digit OTP.",
      );
      return;
    }

    setVerifying(true);

    try {
      const user =
        await getCurrentUser();

      if (!user) {
        throw new Error(
          "Your Supabase session has expired. Please sign in again.",
        );
      }

      const data =
        await callOtp(
          "verify",
          normalizedOtp,
        );

      if (
        data?.verified !== true
      ) {
        throw new Error(
          "Email OTP verification failed.",
        );
      }

      const accessToken =
        await getAccessToken();

      if (!accessToken) {
        throw new Error(
          "Unable to refresh Supabase authentication.",
        );
      }

      /*
       * Existing PhotoOS provisioning endpoint is retained
       * for compatibility. Only the authentication token
       * has moved from Firebase to Supabase.
       */
      const provisionResponse =
        await fetch(
          `${SUPABASE_URL}/functions/v1/provision-firebase-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              email:
                user.email ??
                email.trim(),
            }),
          },
        );

      const provisionData =
        await provisionResponse.json().catch(
          () => null,
        );

      if (
        !provisionResponse.ok ||
        !provisionData?.success
      ) {
        throw new Error(
          (typeof provisionData?.error === "string"
            ? provisionData.error
            : provisionData?.error?.message) ??
            "Unable to provision your PhotoOS account.",
        );
      }

      /*
       * Existing PhotoOS users already have their canonical
       * identity and workspace. Never send them through the
       * new-user onboarding flow again.
       *
       * New users continue through the original requested route.
       */
      const isExistingPhotoOSUser =
        provisionData?.already_provisioned === true ||
        provisionData?.existing_photoos_user === true;

      const destination =
        isExistingPhotoOSUser &&
        nextPath === "/onboarding/studio"
          ? "/dashboard"
          : nextPath;

      window.location.href =
        destination;
    } catch (err) {
      console.error(
        "[EmailOTP] verify",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify OTP.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await callOtp("send");

      setMessage(
        "A new OTP has been sent to your email.",
      );
    } catch (err) {
      console.error(
        "[EmailOTP] resend",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend OTP.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error(
        "[EmailOTP] signOut",
        err,
      );
    }

    window.location.href =
      "/login";
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </main>
    );
  }

  if (!email) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            Email verification
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your email verification session is
            missing or invalid.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.href =
                "/login"
            }
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            We sent a 6-digit verification code
            to
          </p>

          <p className="mt-1 break-all text-sm font-medium">
            {email}
          </p>
        </div>

        <div className="mt-8">
          <label
            htmlFor="email-otp"
            className="block text-sm font-medium"
          >
            Verification code
          </label>

          <input
            id="email-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={(event) => {
              setOtp(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(
                    0,
                    OTP_LENGTH,
                  ),
              );
              setError("");
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                void handleVerify();
              }
            }}
            placeholder="000000"
            className="mt-2 w-full rounded-lg border bg-background px-4 py-3 text-center text-xl tracking-[0.35em] outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            void handleVerify()
          }
          disabled={
            verifying ||
            otp.length !== OTP_LENGTH
          }
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying
            ? "Verifying..."
            : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={() =>
            void handleResend()
          }
          disabled={
            resending ||
            verifying
          }
          className="mt-3 w-full rounded-lg border px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : "Resend OTP"}
        </button>

        <button
          type="button"
          onClick={() =>
            void handleBackToLogin()
          }
          disabled={
            verifying ||
            resending
          }
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Login
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          The verification code expires after
          10 minutes.
        </p>
      </div>
    </main>
  );
}
