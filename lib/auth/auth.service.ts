import { supabase } from "@/lib/supabase/client";

export async function sendOtp(
  email: string,
) {
  const redirect =
    `${window.location.origin}/auth/callback`;

  const { data, error } =
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirect,
      },
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithGoogle() {

  const redirect =
    `${window.location.origin}/auth/callback`;

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithOAuth({

      provider: "google",

      options: {

        redirectTo:
          redirect,

      },

    });

  if (error) {
    throw error;
  }

  return data;

}

export async function signOut() {

  return supabase.auth.signOut();

}

export async function getSession() {

  return supabase.auth.getSession();

}