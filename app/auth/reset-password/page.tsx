"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        const {
          data,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!data.session) {
          throw new Error(
            "Password reset session is invalid or has expired.",
          );
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "[PasswordReset] Session validation failed:",
          err,
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Password reset session is invalid or has expired.",
          );
          setLoading(false);
        }
      }
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setSaving(true);

    try {
      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Password updated successfully. Redirecting...",
      );

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err) {
      console.error(
        "[PasswordReset] Password update failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Verifying password reset...
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new PhotoOS password below.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-md border p-3 text-sm">
            {message}
          </div>
        )}

        {!error && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                New password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                className="w-full rounded-md border px-3 py-2"
                disabled={saving}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md border px-4 py-2 font-medium"
            >
              {saving
                ? "Updating..."
                : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
