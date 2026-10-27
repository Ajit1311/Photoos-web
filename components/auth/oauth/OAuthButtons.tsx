"use client";

import { FcGoogle } from "react-icons/fc";

import {
  signInWithGoogle,
} from "@/lib/auth/auth.service";
import { publishableKey } from "@/lib/supabase/config";

export function OAuthButtons() {

  async function handleGoogle() {

    try {
      if (!publishableKey || publishableKey.includes("dummy_static_prerender")) {
        alert("Supabase API key is missing. Please check NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
        return;
      }

      await signInWithGoogle();

    } catch (err) {

      console.error(err);

      alert("Google login failed.");

    }

  }

  return (

    <div className="space-y-3">

      <button
        type="button"
        onClick={handleGoogle}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card shadow-sm transition hover:border-ring/50 hover:bg-muted"
      >

        <FcGoogle className="text-lg" />

        Continue with Google

      </button>

    </div>

  );

}