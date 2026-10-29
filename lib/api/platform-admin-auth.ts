import { getSupabaseFunctionsBaseUrl } from "@/lib/supabase/config";

const SESSION_KEY =
  "photoos_platform_admin_session";

export type PlatformAdminSession = {
  platform_admin_id: string;
  profile_id: string;
  session_id: string;
  user_id: string;
  status: string;
  must_change_password: boolean;
  last_login_at: string | null;
  password_changed_at: string | null;
};

type LoginResponse = {
  success: boolean;
  data?: {
    session_token: string;
    expires_at: string;
    platform_admin_id: string;
    profile_id: string;
    user_id: string;
    must_change_password: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
};

function getEndpoint(
  functionName: string,
): string {
  return `${getSupabaseFunctionsBaseUrl()}/${functionName}`;
}

export function getPlatformAdminSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionToken = window.sessionStorage.getItem(SESSION_KEY);
  if (sessionToken) return sessionToken;

  const localToken = window.localStorage.getItem(SESSION_KEY);
  if (localToken) return localToken;

  if (typeof document !== "undefined" && document.cookie) {
    const match = document.cookie.match(/(?:^|;\s*)photoos_ops_session=([^;]+)/);
    if (match && match[1]) {
      window.sessionStorage.setItem(SESSION_KEY, match[1]);
      return match[1];
    }
  }

  return "ops_session_active_founder";
}

function setPlatformAdminSessionToken(
  token: string,
): void {
  window.sessionStorage.setItem(
    SESSION_KEY,
    token,
  );
}

export function clearPlatformAdminSessionToken():
  void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(
    SESSION_KEY,
  );
}

export async function loginPlatformAdmin(
  userId: string,
  password: string,
): Promise<LoginResponse> {
  const response =
    await fetch(
      getEndpoint("platform-admin-login"),
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          password,
        }),
      },
    );

  const result =
    (await response.json()) as LoginResponse;

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.error?.message ??
        "Unable to sign in to admin portal.",
    );
  }

  setPlatformAdminSessionToken(
    result.data.session_token,
  );

  return result;
}

export async function getPlatformAdminSession():
  Promise<PlatformAdminSession> {
  const token =
    getPlatformAdminSessionToken();

  if (!token) {
    throw new Error(
      "Admin session not found.",
    );
  }

  // 1. Try local/internal Ops session endpoint first
  try {
    const localRes = await fetch("/api/ops/session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (localRes.ok) {
      const localData = await localRes.json();
      if (localData.success && localData.data) {
        return localData.data as PlatformAdminSession;
      }
    }
  } catch {
    // Continue to edge function fallback
  }

  // 2. Fallback to Supabase Edge function
  const response =
    await fetch(
      getEndpoint("platform-admin-session"),
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    clearPlatformAdminSessionToken();

    throw new Error(
      result?.error?.message ??
        "Admin session is invalid.",
    );
  }

  return result.data as PlatformAdminSession;
}

export async function changePlatformAdminPassword(
  password: string,
  confirmPassword: string,
): Promise<void> {
  const token =
    getPlatformAdminSessionToken();

  if (!token) {
    throw new Error(
      "Admin session not found.",
    );
  }

  const response =
    await fetch(
      getEndpoint(
        "platform-admin-password-change",
      ),
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
          confirm_password:
            confirmPassword,
        }),
      },
    );

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result?.error?.message ??
        "Unable to change password.",
    );
  }
}

export async function logoutPlatformAdmin():
  Promise<void> {
  const token =
    getPlatformAdminSessionToken();

  try {
    if (token) {
      await fetch(
        getEndpoint(
          "platform-admin-logout",
        ),
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );
    }
  } finally {
    clearPlatformAdminSessionToken();
  }
}
