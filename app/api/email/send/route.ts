import { NextRequest, NextResponse } from "next/server";
import {
  sendEmailWithResend,
  EmailTemplates,
  type EmailDepartment,
} from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      department = "noreply",
      to,
      subject,
      html,
      template,
      templateData,
    } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Recipient 'to' email is required" },
        { status: 400 }
      );
    }

    let finalHtml = html;

    if (template === "payment_receipt" && templateData) {
      finalHtml = EmailTemplates.paymentReceipt(templateData);
    } else if (template === "payment_reminder" && templateData) {
      finalHtml = EmailTemplates.paymentReminder(templateData);
    }

    if (!finalHtml) {
      return NextResponse.json(
        { success: false, error: "Email body 'html' or valid 'template' is required" },
        { status: 400 }
      );
    }

    const result = await sendEmailWithResend({
      department: department as EmailDepartment,
      to,
      subject: subject || "Notification from PhotoOS",
      html: finalHtml,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/email/send] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

