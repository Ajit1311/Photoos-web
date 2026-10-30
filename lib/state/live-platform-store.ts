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
  password?: string;
  temporary_password?: string;
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
  public companySettings = {
    legal_name: "PhotoOS SaaS Technologies Private Limited",
    display_name: "PhotoOS Platform",
    brand_name: "PhotoOS Studio & Cloud",
    email: "support@photoos.in",
    phone: "+91 96995 99142",
    website: "https://photoos.in",
    logo_url: "/logo.png",
    country: "India",
    state: "Maharashtra",
    city: "Gadhinglaj",
    address: "Gadhinglaj, Kolhapur, Maharashtra 416502, India",
    postal_code: "416502",
    tax_id: "27AABCP1234F1Z8",
    timezone: "Asia/Kolkata",
    currency: "INR",
  };

  public updateCompanySettings(updates: Partial<typeof this.companySettings>) {
    this.companySettings = {
      ...this.companySettings,
      ...updates,
    };
    return this.companySettings;
  }

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
    {
      platform_admin_id: "adm_parashuram_naik_1311",
      profile_id: "usr_parashuram_naik_1311",
      display_name: "Parashuram Naik",
      email: "parashuramnaik1311@gmail.com",
      employee_code: "ADM-101",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      user_id: "parashuramnaik1311@gmail.com",
      temporary_password: "PhotoOS#665186",
      must_change_password: false,
      last_login_at: new Date().toISOString(),
      password_changed_at: null,
      roles: [
        {
          id: "role_admin",
          code: "admin",
          name: "Administrator (Operations)",
          description: "Operations Console Administrator",
          status: "active",
        },
      ],
    },
  ];

  public qrLeads: QrLead[] = [];

  public notifications: AdminNotificationItem[] = [];

  public supportTickets: Array<{
    id: string;
    studio_id: string;
    created_by: string;
    assigned_to: string;
    ticket_type: string;
    category: string;
    priority: string;
    status: string;
    subject: string;
    description: string;
    subscription_id: string | null;
    payment_id: string | null;
    refund_status: string;
    refund_amount: number | null;
    refund_currency: string | null;
    refund_transaction_id: string | null;
    refund_processed_at: string | null;
    admin_notes: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }> = [];

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
   * Dispatches an automated onboarding greeting email from team@photoos.in
   * with the Ops Console admin link, User ID, and temporary password.
   */
  public async sendWelcomeCredentialsEmail(
    emp: { display_name: string; email: string; roles?: Array<{ name: string }> },
    tempPassword: string
  ) {
    const cleanEmail = emp.email.trim().toLowerCase();
    const displayName = emp.display_name.trim();
    const roleName = emp.roles?.[0]?.name || "Platform Staff";

    try {
      return await sendEmailWithResend({
        department: "team",
        to: cleanEmail,
        subject: `Welcome to PhotoOS Team - Operations Console Credentials (${displayName})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 28px;">
              <div style="display: inline-block; background-color: #0A3F61; color: #ffffff; padding: 10px 22px; border-radius: 12px; font-weight: 700; font-size: 18px; letter-spacing: -0.5px;">
                PhotoOS Admin Console
              </div>
              <h1 style="color: #0f172a; margin: 18px 0 6px 0; font-size: 22px; font-weight: 700;">Welcome to PhotoOS, ${displayName}! 👋</h1>
              <p style="color: #64748b; font-size: 14px; margin: 0;">You have been invited as <strong>${roleName}</strong></p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
              Hello <strong>${displayName}</strong>,<br /><br />
              Welcome to the <strong>PhotoOS Platform Operations Team</strong>! Your employee admin credentials have been configured. You can now log in to the Operations Console to manage studios, customer support, marketing leads, and platform activities.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #0A3F61; text-transform: uppercase; letter-spacing: 0.5px;">Your Admin Access Details</h3>
              
              <div style="margin-bottom: 12px;">
                <span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">OPERATIONS CONSOLE URL</span>
                <a href="https://app.photoos.in/ops-console/login" style="color: #0A3F61; font-weight: 600; font-size: 14px; text-decoration: none; word-break: break-all;">
                  https://app.photoos.in/ops-console/login
                </a>
              </div>

              <div style="margin-bottom: 12px;">
                <span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">USER ID / LOGIN EMAIL</span>
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 15px; font-weight: 700; color: #0f172a;">${cleanEmail}</span>
              </div>

              <div>
                <span style="font-size: 12px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">TEMPORARY PASSWORD</span>
                <code style="background-color: #e2e8f0; padding: 6px 12px; border-radius: 8px; font-size: 16px; font-weight: 700; color: #0A3F61; display: inline-block;">${tempPassword}</code>
              </div>
            </div>

            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                🔒 <strong>First-Time Login Security Requirement:</strong><br />
                Upon your first login with this temporary password, the system will automatically require you to <strong>Set a New Permanent Password</strong> before granting access to the Operations Console.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://app.photoos.in/ops-console/login" style="background-color: #0A3F61; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(10, 63, 97, 0.25);">
                Log In to Operations Console &rarr;
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.5;">
              This email was sent by <strong>PhotoOS Team</strong> (<a href="mailto:team@photoos.in" style="color: #64748b;">team@photoos.in</a>)<br />
              PhotoOS SaaS Technologies Private Limited &bull; Gadhinglaj, Kolhapur, Maharashtra 416502
            </p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("[PlatformLiveStore] Resend credentials mail notice:", mailErr);
      return { success: false, error: String(mailErr) };
    }
  }

  /**
   * Adds a new employee, creates credentials, dispatches an automated Resend welcome email from team@photoos.in.
   */
  public async createEmployee(displayName: string, email: string, roleCode: string) {
    const cleanEmail = email.trim().toLowerCase();
    const tempPassword = `PhotoOS#${Date.now().toString().slice(-6)}`;

    const roleNameMap: Record<string, string> = {
      admin: "Administrator (Operations)",
      software_developer: "Software Developer (Engineering)",
      developer: "Software Developer (Engineering)",
      hr: "Human Resources (HR)",
      marketing: "Marketing Specialist",
      accountant: "Accountant (Finance & Billing)",
      billing: "Accountant (Finance & Billing)",
      qa_tester: "QA Tester (Quality Assurance)",
      qa: "QA Tester (Quality Assurance)",
      sales: "Sales (Studio Acquisition)",
      support: "Customer Support Specialist",
    };
    const roleName = roleNameMap[roleCode] || "Platform Staff";

    const newEmp: AdminEmployeeItem = {
      platform_admin_id: `adm_${Date.now()}`,
      profile_id: `usr_${Date.now()}`,
      display_name: displayName.trim(),
      email: cleanEmail,
      employee_code: `ADM-${Date.now().toString().slice(-4)}`,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: null,
      user_id: cleanEmail,
      temporary_password: tempPassword,
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

    const existingIdx = this.employees.findIndex(
      (e) => e.email.toLowerCase() === cleanEmail || e.user_id.toLowerCase() === cleanEmail
    );
    if (existingIdx !== -1) {
      this.employees[existingIdx] = {
        ...this.employees[existingIdx],
        ...newEmp,
        temporary_password: tempPassword,
      };
    } else {
      this.employees.push(newEmp);
    }

    // Automated Resend Invitation & Greeting Email from team@photoos.in
    await this.sendWelcomeCredentialsEmail(newEmp, tempPassword);

    return {
      employee: newEmp,
      temporaryPassword: tempPassword,
    };
  }

  /**
   * Resets temporary password status upon first login
   */
  public updatePassword(userIdOrEmail: string, newPassword?: string) {
    const clean = userIdOrEmail.trim().toLowerCase();
    const emp = this.employees.find(
      (e) =>
        e.user_id.toLowerCase() === clean ||
        e.email.toLowerCase() === clean ||
        e.platform_admin_id === userIdOrEmail
    );
    if (emp) {
      emp.must_change_password = false;
      emp.password_changed_at = new Date().toISOString();
      if (newPassword) {
        emp.password = newPassword;
      }
      delete emp.temporary_password;
      return true;
    }
    return false;
  }
}

// Global singleton
export const platformLiveStore = new PlatformLiveStore();

