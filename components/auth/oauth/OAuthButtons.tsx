"use client";

import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

import {
  signInWithGoogle,
} from "@/lib/auth/auth.service";

export function OAuthButtons() {

  async function handleGoogle() {

    try {

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
        className="flex h-11 w-full items-center justify-center gap-3 rounded-md border bg-background transition hover:bg-muted"
      >

        <FcGoogle className="text-lg" />

        Continue with Google

      </button>

      <button
        type="button"
        disabled
        className="flex h-11 w-full items-center justify-center gap-3 rounded-md border bg-background opacity-60"
      >

        <FaApple className="text-lg" />

        Continue with Apple

        <span className="ml-2 text-xs">
          Coming Soon
        </span>

      </button>

    </div>

  );

}