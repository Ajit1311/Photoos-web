import { supabase } from "@/lib/supabase/client";

export async function getAccessToken() {
  

  const {
    data,
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return (
    data.session?.access_token ??
    null
  );
}

export async function getCurrentUser() {
  const {
    data,
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user ?? null;
}