"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { sendOtp } from "@/lib/auth/auth.service";

export function LoginForm() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [sentEmail, setSentEmail] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await sendOtp(email);

      setSentEmail(email);

      setSuccess(true);

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send sign in link.",
      );

    } finally {

      setLoading(false);

    }
  }

  async function resendLink() {

    try {

      setLoading(true);

      setError("");

      await sendOtp(sentEmail);

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend sign in link.",
      );

    } finally {

      setLoading(false);

    }

  }

  if (success) {

    return (

      <div className="space-y-8">

        <div className="flex flex-col items-center text-center">

          <CheckCircle2
            className="h-14 w-14 text-green-600"
          />

          <h2 className="mt-5 text-3xl font-bold">
            Check your email
          </h2>

          <p className="mt-3 text-sm text-muted-foreground">
            We've sent a secure sign in link to
          </p>

          <p className="mt-2 break-all font-semibold">
            {sentEmail}
          </p>

        </div>

        <div className="rounded-xl border bg-muted/40 p-5 text-center text-sm leading-6 text-muted-foreground">

          Open your inbox and click the secure
          sign in link to continue to PhotoOS.

        </div>

        {error && (

          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">

            {error}

          </div>

        )}

        <button
          type="button"
          disabled={loading}
          onClick={resendLink}
          className="flex h-11 w-full items-center justify-center rounded-md bg-black text-white transition hover:opacity-90 disabled:opacity-60"
        >

          {loading ? (

            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>

          ) : (

            "Resend Link"

          )}

        </button>

        <button
          type="button"
          onClick={() => {

            setSuccess(false);

            setEmail("");

            setSentEmail("");

            setError("");

          }}
          className="h-11 w-full rounded-md border border-border bg-background transition hover:bg-muted"
        >

          Use another email

        </button>

      </div>

    );

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      <div className="space-y-2">

        <h2 className="text-center text-3xl font-bold">
          Welcome Back
        </h2>

        <p className="text-center text-sm text-muted-foreground">
          Sign in using your email address.
          We'll send you a secure magic link.
        </p>

      </div>

      <div className="space-y-2">

        <Label htmlFor="email">
          Email Address
        </Label>

        <div className="relative">

          <Mail
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            placeholder="name@example.com"
            className="pl-10"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

        </div>

      </div>

      {error && (

        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">

          {error}

        </div>

      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-md bg-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {loading ? (

          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>

        ) : (

          "Continue"

        )}

      </button>

      <p className="text-center text-xs leading-6 text-muted-foreground">

        By continuing you agree to our{" "}

        <span className="font-medium">
          Terms of Service
        </span>

        {" "}and{" "}

        <span className="font-medium">
          Privacy Policy
        </span>

        .

      </p>

    </form>

  );

}