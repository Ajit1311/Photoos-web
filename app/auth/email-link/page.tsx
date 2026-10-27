"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import {
  completeFirebaseEmailLink,
  isFirebaseEmailLink,
} from "@/lib/auth/firebase-auth.service";

export default function EmailLinkPage() {
  const [error, setError] =
    useState("");

  useEffect(() => {
    async function completeLogin() {
      const url = window.location.href;

      if (!isFirebaseEmailLink(url)) {
        setError(
          "This sign-in link is invalid or has expired.",
        );
        return;
      }

      const storedEmail =
        window.localStorage.getItem(
          "photoos_email_for_signin",
        );

      if (!storedEmail) {
        setError(
          "Please return to the PhotoOS login page and enter your email again.",
        );
        return;
      }

      try {
        await completeFirebaseEmailLink(
          storedEmail,
          url,
        );

        window.location.href =
          "/auth/loading";
      } catch (err) {
        console.error(
          "[FirebaseEmailLinkComplete]",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to complete sign in.",
        );
      }
    }

    void completeLogin();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xl">
        {error ? (
          <>
            <h1 className="text-xl font-black text-slate-950">
              Sign-in failed
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <a
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-bold text-white"
            >
              Return to login
            </a>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0A3F61]" />

            <h1 className="mt-5 text-xl font-black text-slate-950">
              Signing you in...
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we securely verify your login link.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
