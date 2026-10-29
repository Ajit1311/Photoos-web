const FUNCTION_URL = "/api/platform-admin/platform-admin-settings";

function getSessionToken(): string {
  if (typeof window === "undefined") {
    return "ops_session_active_founder";
  }

  const token =
    sessionStorage.getItem("photoos_platform_admin_session") ||
    localStorage.getItem("photoos_platform_admin_session");

  return token || "ops_session_active_founder";
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
