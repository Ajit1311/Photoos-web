const FUNCTION_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/platform-admin-settings`;

function getSessionToken(): string {
  if (typeof window === "undefined") {
    throw new Error("Admin session is unavailable.");
  }

  const token = sessionStorage.getItem(
    "photoos_platform_admin_session",
  );

  if (!token) {
    throw new Error("Admin session required.");
  }

  return token;
}

async function request(
  method: "GET" | "POST",
  body?: Record<string, unknown>,
) {
  const token = getSessionToken();

  const response = await fetch(
    `${FUNCTION_URL}?section=branding`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Unable to process branding settings.",
    );
  }

  return result.data;
}

export async function getBrandingSettings() {
  return request("GET");
}

export async function saveBrandingSettings(
  value: Record<string, unknown>,
) {
  return request("POST", { value });
}
