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
    `${FUNCTION_URL}?section=company`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body
        ? JSON.stringify(body)
        : undefined,
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Unable to process company settings.",
    );
  }

  return result.data;
}

export async function getCompanySettings() {
  return request("GET");
}

export async function saveCompanySettings(
  value: Record<string, unknown>,
) {
  return request("POST", { value });
}
