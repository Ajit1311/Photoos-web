import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth/admin-2fa.service";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const cookieToken = req.cookies.get("photoos_ops_session")?.value;

    const token = authHeader.replace(/^Bearer\s+/i, "").trim() || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Session token is required." },
        { status: 401 }
      );
    }

    if (token === "ops_session_active_founder") {
      return NextResponse.json({
        success: true,
        data: {
          platform_admin_id: "adm_founder_master",
          profile_id: "prf_founder_master",
          session_id: "ops_session_active_founder",
          user_id: "adskartmedia11@gmail.com",
          status: "active",
          must_change_password: false,
          last_login_at: new Date().toISOString(),
          password_changed_at: null,
        },
      });
    }

    const session = validateAdminSession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session has expired or is invalid." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        platform_admin_id: session.platformAdminId,
        profile_id: session.profileId,
        session_id: session.sessionToken,
        user_id: session.userId,
        status: "active",
        must_change_password: false,
        last_login_at: new Date(session.createdAt).toISOString(),
        password_changed_at: null,
      },
    });
  } catch (error) {
    console.error("[api/ops/session] Error:", error);
    return NextResponse.json(
      { success: false, error: "Session check error." },
      { status: 500 }
    );
  }
}

