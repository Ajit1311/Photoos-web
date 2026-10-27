import { supabase } from "@/lib/supabase/client";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (process.env.NODE_ENV === "development") {
    const session = data.session;

    console.debug("[Auth] Session timing:", {
      authenticated: !!session,
      userId: session?.user?.id ?? null,
      issuedAt: session?.user?.created_at ?? null,
      expiresAt: session?.expires_at
        ? new Date(
            session.expires_at * 1000,
          ).toISOString()
        : null,
      browserNow: new Date().toISOString(),
      browserNowMs: Date.now(),
    });
  }

  return data.session ?? null;
}

export async function getAccessToken(): Promise<string |null> {
  const session = await getSession();

  return session?.access_token ?? null;
}

export async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("User is not authenticated.");
  }

  return token;
}

export async function getRefreshToken(): Promise<string | null> {
  const session = await getSession();

  return session?.refresh_token ?? null;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();

  return session !== null;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}