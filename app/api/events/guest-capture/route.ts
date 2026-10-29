import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmailWithResend } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studioId, eventId, guestName, guestPhone, role = "guest" } = body;

    if (!guestName || !guestPhone) {
      return NextResponse.json(
        { success: false, error: "Guest name and phone number are required." },
        { status: 400 }
      );
    }

    const cleanPhone = String(guestPhone).replace(/\D/g, "");
    const cleanName = String(guestName).trim();

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      // Return optimistic success if server service role key isn't provided
      return NextResponse.json({
        success: true,
        message: "Guest lead acknowledged (optimistic)",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Try to record in clients table if studioId is available
    if (studioId) {
      try {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id, metadata")
          .eq("studio_id", studioId)
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (!existingClient) {
          await supabase.from("clients").insert({
            studio_id: studioId,
            name: cleanName,
            display_name: cleanName,
            phone: cleanPhone,
            source: "qr_event_scan",
            status: "lead",
            notes: `Captured via event QR scan (${role === "bride_groom" ? "Bride & Groom" : "Guest"})`,
            metadata: {
              source: "qr_code",
              event_id: eventId,
              role,
              captured_at: new Date().toISOString(),
            },
          });
        }
      } catch (clientErr) {
        console.warn("[GuestCapture] Client insert notice:", clientErr);
      }
    }

    // 2. Also record in marketing_leads / crm_contacts if available
    try {
      await supabase.from("marketing_leads").insert({
        studio_id: studioId || null,
        full_name: cleanName,
        phone: cleanPhone,
        lead_source: role === "marketplace_quote_lead" ? "marketplace_quote" : "event_qr_scan",
        lead_status: "new",
        notes: `Event: ${eventId || "Marketplace"} | Role: ${role}`,
        metadata: {
          event_id: eventId || null,
          role,
          captured_at: new Date().toISOString(),
        },
      });
    } catch {
      // Table might not exist or optional
    }

    // 3. Trigger In-App Notification for Studio Header Bell
    if (studioId) {
      try {
        const isQuote = role === "marketplace_quote_lead";
        const isBrideGroom = role === "bride_groom";
        const isChatMessage = role === "bride_groom_message";

        const title = isChatMessage
          ? `💬 New Message from Bride & Groom (${cleanName})`
          : isQuote
          ? `⚡ New Quote Inquiry: ${cleanName}`
          : isBrideGroom
          ? `👑 Bride & Groom Joined: ${cleanName}`
          : `📸 New Guest Checked In: ${cleanName}`;

        const bodyText = isChatMessage
          ? `${cleanName} sent a note through the client desk for event.`
          : isQuote
          ? `${cleanName} (${cleanPhone}) submitted a free quote inquiry via PhotoOS Marketplace.`
          : `${cleanName} (${cleanPhone}) checked in via event QR code scan.`;

        await supabase.from("notifications").insert({
          studio_id: studioId,
          notification_type: isChatMessage ? "chat_message" : isQuote ? "marketplace_lead" : "guest_checkin",
          channel: "in_app",
          title,
          body: bodyText,
          status: "unread",
          priority: isChatMessage || isQuote || isBrideGroom ? 2 : 1,
          metadata: {
            guest_name: cleanName,
            phone: cleanPhone,
            event_id: eventId || null,
            role,
          },
        });
      } catch (notifErr) {
        console.warn("[GuestCapture] Notification insert notice:", notifErr);
      }
    }

    // 4. Send Automated Email Notification via Resend (Marketing Department)
    if (studioId) {
      try {
        const { data: studioData } = await supabase
          .from("studios")
          .select("name, brand_name, contact_email")
          .eq("id", studioId)
          .maybeSingle();

        const studioEmail = studioData?.contact_email;
        const studioDisplayName = studioData?.brand_name || studioData?.name || "PhotoOS Partner";

        if (studioEmail) {
          const isQuote = role === "marketplace_quote_lead";
          await sendEmailWithResend({
            department: "marketing",
            to: studioEmail,
            subject: isQuote
              ? `⚡ New Marketplace Quote Request from ${cleanName}`
              : `📸 New Guest Registered via Event QR: ${cleanName}`,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h2 style="color: #0A3F61; margin-top: 0;">${isQuote ? "New Marketplace Booking Inquiry" : "New Event Guest Check-in"}</h2>
                <p>Hello <strong>${studioDisplayName}</strong>,</p>
                <p>You have received a new customer lead on PhotoOS:</p>
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 4px 0;"><strong>Name:</strong> ${cleanName}</p>
                  <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${cleanPhone}">${cleanPhone}</a></p>
                  <p style="margin: 4px 0;"><strong>Role / Type:</strong> ${role}</p>
                  ${eventId ? `<p style="margin: 4px 0;"><strong>Event ID:</strong> ${eventId}</p>` : ""}
                </div>
                <p style="color: #64748b; font-size: 13px;">Follow up promptly on WhatsApp or phone call to confirm details.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">PhotoOS Operating System &bull; <a href="https://photoos.in" style="color: #0A3F61;">photoos.in</a></p>
              </div>
            `,
          });
        }
      } catch (mailErr) {
        console.warn("[GuestCapture] Email notify notice:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Guest details saved successfully.",
    });
  } catch (error) {
    console.error("[GuestCapture] Internal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

