import { NextRequest, NextResponse } from "next/server";
import { initiateAdminLogin } from "@/lib/auth/admin-2fa.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, password } = body;

    if (!user_id || !password) {
      return NextResponse.json(
        { success: false, error: "Admin User ID and Password are required." },
        { status: 400 }
      );
    }

    const result = await initiateAdminLogin(user_id, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Authentication failed." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      requires_2fa: true,
      challenge_id: result.challengeId,
      masked_email: result.maskedEmail,
    });
  } catch (error) {
    console.error("[api/ops/login] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal authentication error." },
      { status: 500 }
    );
  }
}
