import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin2FA } from "@/lib/auth/admin-2fa.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge_id, otp } = body;

    if (!challenge_id || !otp) {
      return NextResponse.json(
        { success: false, error: "Challenge ID and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const result = await verifyAdmin2FA(challenge_id, otp);

    if (!result.success || !result.sessionToken || !result.adminData) {
      return NextResponse.json(
        { success: false, error: result.error || "2FA verification failed." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        session_token: result.sessionToken,
        expires_at: result.adminData.expires_at,
        platform_admin_id: result.adminData.platform_admin_id,
        profile_id: result.adminData.profile_id,
        user_id: result.adminData.user_id,
        must_change_password: false,
      },
    });

    // Set secure HTTP-only cookie for middleware access gate
    response.cookies.set("photoos_ops_session", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error) {
    console.error("[api/ops/verify-2fa] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal 2FA verification error." },
      { status: 500 }
    );
  }
}

