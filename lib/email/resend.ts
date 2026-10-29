/**
 * PhotoOS Resend Email Service
 * 
 * Supports all official photoos.in senders:
 * - billing@photoos.in   (Invoices, payment receipts, balance reminders)
 * - noreply@photoos.in   (OTPs, system alerts, security notifications)
 * - founder@photoos.in   (Onboarding welcome, VIP studio outreach)
 * - team@photoos.in      (Team invites, role assignments, event alerts)
 * - marketing@photoos.in (Guest welcome, promotion, studio highlights)
 * - legal@photoos.in     (DPDP consent confirmations, privacy updates)
 * - support@photoos.in   (Customer service, help tickets)
 */

export type EmailDepartment =
  | "billing"
  | "noreply"
  | "founder"
  | "team"
  | "marketing"
  | "legal"
  | "support";

export const PHOTOOS_SENDERS: Record<EmailDepartment, string> = {
  billing: "PhotoOS Billing <billing@photoos.in>",
  noreply: "PhotoOS Notifications <noreply@photoos.in>",
  founder: "PhotoOS Founder <founder@photoos.in>",
  team: "PhotoOS Team <team@photoos.in>",
  marketing: "PhotoOS Marketing <marketing@photoos.in>",
  legal: "PhotoOS Legal & Compliance <legal@photoos.in>",
  support: "PhotoOS Support <support@photoos.in>",
};

export interface SendEmailPayload {
  department: EmailDepartment;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Dispatch an email via Resend API
 */
export async function sendEmailWithResend(payload: SendEmailPayload): Promise<EmailResponse> {
  const apiKey =
    process.env.RESEND_API_KEY ||
    process.env.NEXT_PUBLIC_RESEND_API_KEY ||
    "";

  const sender = PHOTOOS_SENDERS[payload.department] || PHOTOOS_SENDERS.noreply;

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not configured in environment. Simulating dispatch:", {
      from: sender,
      to: payload.to,
      subject: payload.subject,
    });
    return {
      success: true,
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
        cc: payload.cc ? (Array.isArray(payload.cc) ? payload.cc : [payload.cc]) : undefined,
        bcc: payload.bcc ? (Array.isArray(payload.bcc) ? payload.bcc : [payload.bcc]) : undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Resend] API Error:", data);
      return {
        success: false,
        error: data.message || `Resend HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (err) {
    console.error("[Resend] Network/Exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch email",
    };
  }
}

/**
 * Reusable HTML Email Templates
 */
export const EmailTemplates = {
  paymentReceipt(data: {
    clientName: string;
    studioName: string;
    eventName: string;
    invoiceNumber: string;
    amountPaid: number;
    advancePaid: number;
    pendingBalance: number;
    paymentMethod: string;
    transactionId?: string;
    date: string;
  }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0A3F61; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .header p { margin: 8px 0 0; opacity: 0.85; font-size: 14px; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background: #ecfdf5; color: #047857; font-weight: 600; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .summary-box { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .row.highlight { font-weight: 700; font-size: 16px; color: #0A3F61; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.studioName}</h1>
            <p>Payment Receipt &bull; Powered by PhotoOS</p>
          </div>
          <div class="content">
            <div class="badge">Payment Confirmed</div>
            <p>Dear <strong>${data.clientName}</strong>,</p>
            <p>Thank you! We have received your payment for <strong>${data.eventName}</strong>.</p>
            
            <div class="summary-box">
              <div class="row"><span>Invoice No:</span><span><strong>${data.invoiceNumber}</strong></span></div>
              <div class="row"><span>Amount Paid Now:</span><span><strong>₹${data.amountPaid.toLocaleString("en-IN")}</strong></span></div>
              <div class="row"><span>Total Advance Paid:</span><span>₹${data.advancePaid.toLocaleString("en-IN")}</span></div>
              <div class="row highlight"><span>Pending Balance:</span><span>₹${data.pendingBalance.toLocaleString("en-IN")}</span></div>
              <div class="row"><span>Payment Mode:</span><span style="text-transform: capitalize;">${data.paymentMethod}</span></div>
              ${data.transactionId ? `<div class="row"><span>Transaction ID:</span><span>${data.transactionId}</span></div>` : ""}
              <div class="row"><span>Date:</span><span>${data.date}</span></div>
            </div>
            
            <p style="font-size: 13px; color: #475569;">If you have any questions regarding this receipt or your event coverage, please reach out directly to ${data.studioName}.</p>
          </div>
          <div class="footer">
            <p>Verified transaction processed via PhotoOS Operating System &bull; <a href="https://photoos.in" style="color: #0A3F61; text-decoration: none;">www.photoos.in</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  paymentReminder(data: {
    clientName: string;
    studioName: string;
    eventName: string;
    balanceAmount: number;
    dueDate: string;
    studioPhone?: string;
  }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0A3F61; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .amount-due { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .amount-due .label { font-size: 13px; font-weight: 600; color: #e11d48; text-transform: uppercase; }
          .amount-due .val { font-size: 32px; font-weight: 800; color: #be123c; margin-top: 6px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.studioName}</h1>
            <p>Friendly Payment Reminder</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.clientName}</strong>,</p>
            <p>This is a friendly reminder regarding the remaining balance for your event <strong>${data.eventName}</strong>.</p>
            
            <div class="amount-due">
              <div class="label">Outstanding Balance</div>
              <div class="val">₹${data.balanceAmount.toLocaleString("en-IN")}</div>
              <p style="margin: 8px 0 0; font-size: 13px; color: #475569;">Due Date: <strong>${data.dueDate}</strong></p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6;">Kindly arrange to complete the settlement at your earliest convenience. For UPI or Bank Transfer details, please contact <strong>${data.studioName}</strong>${data.studioPhone ? ` at <strong>${data.studioPhone}</strong>` : ""}.</p>
          </div>
          <div class="footer">
            <p>PhotoOS Automated Reminder System &bull; <a href="https://photoos.in" style="color: #0A3F61; text-decoration: none;">photoos.in</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  otpVerification(data: { otp: string; purpose?: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; text-align: center; }
          .header { background: #0A3F61; color: #ffffff; padding: 28px; }
          .content { padding: 32px 24px; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #0A3F61; background: #f0fdf4; border: 1px dashed #22c55e; padding: 16px 24px; border-radius: 12px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 16px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 22px;">PhotoOS Verification</h1>
          </div>
          <div class="content">
            <p style="font-size: 15px; color: #475569;">Use the one-time code below to verify your identity for ${data.purpose || "secure access"}:</p>
            <div class="otp-code">${data.otp}</div>
            <p style="font-size: 13px; color: #64748b;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
          </div>
          <div class="footer">
            Securely dispatched from noreply@photoos.in
          </div>
        </div>
      </body>
      </html>
    `;
  },

  newLeadAlert(data: { studioName: string; clientName: string; phone: string; eventType: string; eventDate?: string; notes?: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #0A3F61; color: #ffffff; padding: 24px; }
          .content { padding: 24px; }
          .card { background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;">🎉 New Lead Received!</h2>
            <p style="margin:4px 0 0; opacity:0.9; font-size: 14px;">PhotoOS Marketplace Lead for ${data.studioName}</p>
          </div>
          <div class="content">
            <p>You have a new booking inquiry from a potential client:</p>
            <div class="card">
              <div class="row"><span><strong>Client Name:</strong></span><span>${data.clientName}</span></div>
              <div class="row"><span><strong>Phone:</strong></span><span><a href="tel:${data.phone}">${data.phone}</a></span></div>
              <div class="row"><span><strong>Event Type:</strong></span><span>${data.eventType}</span></div>
              ${data.eventDate ? `<div class="row"><span><strong>Event Date:</strong></span><span>${data.eventDate}</span></div>` : ""}
              ${data.notes ? `<div class="row"><span><strong>Notes:</strong></span><span>${data.notes}</span></div>` : ""}
            </div>
            <p style="font-size: 13px; color: #64748b;">Respond promptly to increase your conversion rate!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};

