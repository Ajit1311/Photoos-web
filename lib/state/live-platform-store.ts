import { sendEmailWithResend } from "@/lib/email/resend";

export interface QrLead {
  id: string;
  name: string;
  phone: string;
  studio_id?: string | null;
  event_id?: string | null;
  role: string;
  source: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  read_at: string | null;
  created_at: string;
}

export interface AdminEmployeeItem {
  platform_admin_id: string;
  profile_id: string;
  display_name: string;
  email: string;
  employee_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
  user_id: string;
  must_change_password: boolean;
  last_login_at: string | null;
  password_changed_at: string | null;
  roles: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    status: string;
  }>;
}

// Global in-memory storage persisted during server runtime
class PlatformLiveStore {
  public singleStudio = {
    studio_id: "std_gmark_photoos_01",
    studio_code: "STD-GMARK-01",
    studio_name: "G Mark Software Studio",
    legal_name: "G Mark Software Private Limited",
    brand_name: "PhotoOS Studio Pune",
    studio_email: "adskartmedia11@gmail.com",
    studio_phone: "+91 96896 89142",
    logo_url: "/logo.png",
    studio_status: "active",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    currency: "INR",
    timezone: "Asia/Kolkata",
    owner_profile_id: "usr_parashram_naik",
    owner_name: "Parashram S Naik",
    owner_email: "adskartmedia11@gmail.com",
    owner_employee_code: "EMP-001",
    owner_status: "active",
    member_count: 2,
    subscription_id: "sub_trial_gmark_01",
    subscription_status: "trial",
    plan_code: "pro_trial",
    plan_name: "Pro Studio (7-Day Free Trial)",
    plan_price: 0,
    plan_currency: "INR",
    billing_cycle: "trial",
    trial_days: 7,
    trial_start_at: "2026-10-25T00:00:00.000Z",
    trial_end_at: "2026-11-01T23:59:59.000Z",
    subscription_start_at: "2026-10-25T00:00:00.000Z",
    subscription_end_at: "2026-11-01T23:59:59.000Z",
  };

  public users = [
    {
      profile_id: "usr_parashram_naik",
      full_name: "Parashram S Naik",
      first_name: "Parashram",
      last_name: "Naik",
      avatar_url: null,
      profile_status: "active",
      user_created_at: "2026-10-25T00:00:00.000Z",
      last_seen_at: new Date().toISOString(),
      studio_id: "std_gmark_photoos_01",
      studio_code: "STD-GMARK-01",
      studio_name: "G Mark Software Studio",
      legal_name: "G Mark Software Private Limited",
      brand_name: "PhotoOS Studio Pune",
      studio_email: "adskartmedia11@gmail.com",
      studio_phone: "+91 96896 89142",
      studio_status: "active",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      membership_status: "active",
      employee_code: "EMP-001",
      last_active_at: new Date().toISOString(),
      role_code: "studio_owner",
      role_name: "Studio Owner & Admin",
      subscription_id: "sub_trial_gmark_01",
      subscription_status: "trial",
      plan_code: "pro_trial",
      plan_name: "Pro Studio (7-Day Free Trial)",
      plan_price: 0,
      plan_currency: "INR",
      billing_cycle: "trial",
      trial_days: 7,
      trial_start_at: "2026-10-25T00:00:00.000Z",
      trial_end_at: "2026-11-01T23:59:59.000Z",
      subscription_start_at: "2026-10-25T00:00:00.000Z",
      subscription_end_at: "2026-11-01T23:59:59.000Z",
      next_billing_at: "2026-11-01T23:59:59.000Z",
      auto_renew: true,
    },
    {
      profile_id: "usr_ajit_naik",
      full_name: "Ajit Naik",
      first_name: "Ajit",
      last_name: "Naik",
      avatar_url: null,
      profile_status: "active",
      user_created_at: "2026-10-26T12:00:00.000Z",
      last_seen_at: new Date().toISOString(),
      studio_id: "std_gmark_photoos_01",
      studio_code: "STD-GMARK-01",
      studio_name: "G Mark Software Studio",
      legal_name: "G Mark Software Private Limited",
      brand_name: "PhotoOS Studio Pune",
      studio_email: "ajitnaik595@gmail.com",
      studio_phone: "+91 96896 89142",
      studio_status: "active",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      membership_status: "active",
      employee_code: "EMP-002",
      last_active_at: new Date().toISOString(),
      role_code: "lead_photographer",
      role_name: "Lead Photographer",
      subscription_id: "sub_trial_gmark_01",
      subscription_status: "trial",
      plan_code: "pro_trial",
      plan_name: "Pro Studio (7-Day Free Trial)",
      plan_price: 0,
      plan_currency: "INR",
      billing_cycle: "trial",
      trial_days: 7,
      trial_start_at: "2026-10-25T00:00:00.000Z",
      trial_end_at: "2026-11-01T23:59:59.000Z",
      subscription_start_at: "2026-10-25T00:00:00.000Z",
      subscription_end_at: "2026-11-01T23:59:59.000Z",
      next_billing_at: "2026-11-01T23:59:59.000Z",
      auto_renew: true,
    },
  ];

  public employees: AdminEmployeeItem[] = [
    {
      platform_admin_id: "adm_parashram",
      profile_id: "usr_parashram_naik",
      display_name: "Parashram S Naik",
      email: "adskartmedia11@gmail.com",
      employee_code: "ADM-001",
      status: "active",
      created_at: "2026-09-01T10:00:00.000Z",
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      user_id: "adskartmedia11@gmail.com",
      must_change_password: false,
      last_login_at: new Date().toISOString(),
      password_changed_at: "2026-10-01T10:00:00.000Z",
      roles: [
        {
          id: "role_super_admin",
          code: "super_admin",
          name: "Super Administrator (Founder)",
          description: "Full master access across platform",
          status: "active",
        },
      ],
    },
  ];

  public qrLeads: QrLead[] = [
    {
      id: "qr_lead_01",
      name: "Sandeep More",
      phone: "9822014890",
      studio_id: "std_gmark_photoos_01",
      event_id: "evt_pune_wedding_01",
      role: "guest",
      source: "Event QR Scan (Guest Capture)",
      status: "new",
      notes: "Scanned event QR code at wedding entry for photo facial recognition match.",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "qr_lead_02",
      name: "Pooja Kulkarni",
      phone: "9764512399",
      studio_id: "std_gmark_photoos_01",
      event_id: "evt_pune_wedding_01",
      role: "guest",
      source: "Event QR Scan (Guest Capture)",
      status: "new",
      notes: "Scanned event QR code and registered selfie for AI face matching.",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];

  public notifications: AdminNotificationItem[] = [
    {
      id: "notif_qr_01",
      title: "📸 New QR Scan Lead: Sandeep More",
      message: "Sandeep More (9822014890) registered through event QR scan for AI Photo Matching.",
      category: "LEAD",
      read_at: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "notif_qr_02",
      title: "📸 New QR Scan Lead: Pooja Kulkarni",
      message: "Pooja Kulkarni (9764512399) scanned the event QR code.",
      category: "LEAD",
      read_at: null,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "notif_sys_01",
      title: "⚡ Free Trial Active: G Mark Software Studio",
      message: "Studio is enjoying 7-day Pro Studio Free Trial (active trial).",
      category: "SUBSCRIPTION",
      read_at: null,
      created_at: "2026-10-25T00:00:00.000Z",
    },
  ];

  public supportTickets = [
    {
      id: "tkt_live_01",
      studio_id: "std_gmark_photoos_01",
      created_by: "usr_parashram_naik",
      assigned_to: "Super Admin",
      ticket_type: "support",
      category: "system",
      priority: "normal",
      status: "open",
      subject: "Resend Email & Cloudflare Routing Activation",
      description: "Cloudflare email routing and Resend API connected successfully for domain photoos.in.",
      subscription_id: "sub_trial_gmark_01",
      payment_id: null,
      refund_status: "not_applicable",
      refund_amount: null,
      refund_currency: null,
      refund_transaction_id: null,
      refund_processed_at: null,
      admin_notes: "Live Resend key and domain routing verified.",
      metadata: { domain: "photoos.in", destination: "adskartmedia11@gmail.com" },
      created_at: "2026-10-29T10:00:00.000Z",
      updated_at: new Date().toISOString(),
    },
  ];

  /**
   * Registers a newly captured QR Scan lead, triggers an Admin Notification,
   * and sends an instant email notification to the studio founder.
   */
  public async recordQrCapture(lead: {
    guestName: string;
    guestPhone: string;
    studioId?: string | null;
    eventId?: string | null;
    role?: string;
  }) {
    const cleanPhone = String(lead.guestPhone).replace(/\D/g, "");
    const cleanName = String(lead.guestName).trim();

    const newLead: QrLead = {
      id: `qr_${Date.now()}`,
      name: cleanName,
      phone: cleanPhone,
      studio_id: lead.studioId || this.singleStudio.studio_id,
      event_id: lead.eventId || null,
      role: lead.role || "guest",
      source: "Event QR Scan (Guest Capture)",
      status: "new",
      notes: `Captured via event QR scan. Role: ${lead.role || "guest"}`,
      created_at: new Date().toISOString(),
    };

    this.qrLeads.unshift(newLead);

    // Create Notification
    const notif: AdminNotificationItem = {
      id: `notif_${Date.now()}`,
      title: `📸 New QR Scan Lead: ${cleanName}`,
      message: `${cleanName} (${cleanPhone}) checked in via event QR code scan.`,
      category: "LEAD",
      read_at: null,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(notif);

    // Send Real Email Notification via Resend
    try {
      await sendEmailWithResend({
        department: "marketing",
        to: "adskartmedia11@gmail.com",
        subject: `📸 New QR Scan Guest Lead: ${cleanName} (${cleanPhone})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
            <div style="background: #0A3F61; padding: 16px; border-radius: 10px; text-align: center; color: #ffffff; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px;">New Event QR Lead Captured</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">PhotoOS Guest Capture System</p>
            </div>
            
            <p style="font-size: 15px; color: #1e293b;">Hello <strong>Parashram Naik</strong>,</p>
            <p style="font-size: 14px; color: #475569;">
              A guest has just scanned the event QR standee and submitted their details:
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Guest Name:</strong> <span style="font-size: 16px; color: #0A3F61; font-weight: bold;">${cleanName}</span></p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Mobile Number:</strong> <a href="tel:${cleanPhone}" style="color: #0A3F61; font-weight: bold; font-size: 15px;">+91 ${cleanPhone}</a></p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Role / Type:</strong> ${lead.role || "guest"}</p>
              ${lead.eventId ? `<p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Event ID:</strong> ${lead.eventId}</p>` : ""}
            </div>

            <p style="font-size: 13px; color: #64748b;">
              This lead is now visible in your <strong>Admin Panel &rarr; Marketing Leads</strong> and <strong>Notifications</strong>.
            </p>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://photoos.in/admin/marketing/leads" style="background-color: #0A3F61; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.warn("[PlatformLiveStore] Resend notify notice:", e);
    }

    return newLead;
  }

  /**
   * Adds a new employee, creates credentials, dispatches an automated Resend welcome email.
   */
  public async createEmployee(displayName: string, email: string, roleCode: string) {
    const cleanEmail = email.trim().toLowerCase();
    const tempPassword = `PhotoOS#${Math.floor(100000 + Math.random() * 900000)}`;

    const roleNameMap: Record<string, string> = {
      support: "Support Specialist",
      marketing: "Marketing Specialist",
      billing: "Billing & Accounts Specialist",
      admin: "Administrator",
    };
    const roleName = roleNameMap[roleCode] || "Platform Staff";

    const newEmp: AdminEmployeeItem = {
      platform_admin_id: `adm_${Date.now()}`,
      profile_id: `usr_${Date.now()}`,
      display_name: displayName.trim(),
      email: cleanEmail,
      employee_code: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: null,
      user_id: cleanEmail,
      must_change_password: true,
      last_login_at: null,
      password_changed_at: null,
      roles: [
        {
          id: `role_${roleCode}`,
          code: roleCode,
          name: roleName,
          description: `Assigned ${roleName} duties`,
          status: "active",
        },
      ],
    };

    this.employees.push(newEmp);

    // Automated Resend Invitation & Greeting Email
    try {
      await sendEmailWithResend({
        department: "support",
        to: cleanEmail,
        subject: `Welcome to PhotoOS Admin Team - Your Login Credentials (${displayName})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background-color: #0A3F61; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 20px;">
                PhotoOS Admin Console
              </div>
              <h2 style="color: #0F172A; margin: 16px 0 4px 0; font-size: 22px;">Welcome to the Team, ${displayName}!</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">You have been invited as <strong>${roleName}</strong></p>
            </div>

            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Your administrator account has been created on the PhotoOS Platform. Below are your temporary credentials to sign in to the Operations Console:
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">
                <strong>Admin Console URL:</strong><br />
                <a href="https://photoos.in/ops-console/login" style="color: #0A3F61; font-weight: bold; text-decoration: none; word-break: break-all;">
                  https://photoos.in/ops-console/login
                </a>
              </p>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">
                <strong>User ID / Login Email:</strong><br />
                <span style="font-family: monospace; font-size: 15px; color: #0f172a; font-weight: bold;">${cleanEmail}</span>
              </p>
              <p style="margin: 0; font-size: 14px; color: #334155;">
                <strong>System Generated Temporary Password:</strong><br />
                <code style="background-color: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 16px; font-weight: bold; color: #0A3F61; display: inline-block; margin-top: 4px;">${tempPassword}</code>
              </p>
            </div>

            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                <strong>Important Security Requirement:</strong><br />
                When you sign in with this temporary password, the system will immediately require you to <strong>Set a New Permanent Password</strong> before granting access to the dashboard.
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="https://photoos.in/ops-console/login" style="background-color: #0A3F61; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block;">
                Log In to Admin Console
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
              PhotoOS Platform Operations &bull; G Mark Software Private Limited &bull; Pune, Maharashtra
            </p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("[PlatformLiveStore] Resend welcome mail notice:", mailErr);
    }

    return {
      employee: newEmp,
      temporaryPassword: tempPassword,
    };
  }

  /**
   * Resets temporary password status upon first login
   */
  public updatePassword(userIdOrEmail: string) {
    const emp = this.employees.find(
      (e) =>
        e.user_id === userIdOrEmail ||
        e.email === userIdOrEmail ||
        e.platform_admin_id === userIdOrEmail
    );
    if (emp) {
      emp.must_change_password = false;
      emp.password_changed_at = new Date().toISOString();
      return true;
    }
    return false;
  }
}

// Global singleton
export const platformLiveStore = new PlatformLiveStore();

