import { supabase } from "@/lib/supabase/client";
import { getSafeRedirectUrl } from "@/lib/security/safe-redirect";

const AUTH_CALLBACK_PATH =
  "/auth/callback";

function getBaseOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getRedirectUrl(
  next?: string,
): string {

  const callbackUrl =
    new URL(
      AUTH_CALLBACK_PATH,
      getBaseOrigin(),
    );

  if (next) {
    const safeNext = getSafeRedirectUrl(next, "/dashboard");
    callbackUrl.searchParams.set(
      "next",
      safeNext,
    );
  }

  return callbackUrl.toString();

}

export async function sendOtp(
  email: string,
  next?: string,
) {

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithOtp({

      email,

      options: {

        shouldCreateUser: true,

        emailRedirectTo:
          getRedirectUrl(next),

      },

    });

  if (error) {
    throw error;
  }

  return data;

}

export async function signUp(
  email: string,
  password: string,
  fullName?: string,
) {
  const {
    data,
    error,
  } =
    await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          ...(fullName?.trim()
            ? {
                full_name:
                  fullName.trim(),
              }
            : {}),
        },
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithPassword(
  email: string,
  password: string,
) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function sendPasswordResetEmail(
  email: string,
): Promise<void> {
  const redirectTo =
    new URL(
      "/auth/reset-password",
      getBaseOrigin(),
    ).toString();

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo,
      },
    );

  if (error) {
    throw error;
  }
}

export async function signInWithGoogle(
  next?: string,
) {

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithOAuth({

      provider: "google",

      options: {

        redirectTo:
          getRedirectUrl(next),

      },

    });

  if (error) {
    throw error;
  }

  return data;

}

export async function signOut(): Promise<void> {

  const {
    error,
  } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }

}

export async function getSession() {

  const {
    data,
    error,
  } =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session ?? null;

}

export async function getCurrentUser() {

  const {
    data,
    error,
  } =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user ?? null;

}

export async function refreshSession() {

  const {
    data,
    error,
  } =
    await supabase.auth.refreshSession();

  if (error) {
    throw error;
  }

  return data.session ?? null;

}

export async function isAuthenticated(): Promise<boolean> {

  const session =
    await getSession();

  return session !== null;

}