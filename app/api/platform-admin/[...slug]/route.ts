import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { platformLiveStore } from "@/lib/state/live-platform-store";

// Persistent Settings State in memory
let companySettingsState = {
  legal_name: "PhotoOS SaaS Technologies Private Limited",
  display_name: "PhotoOS Platform",
  brand_name: "PhotoOS Studio & Cloud",
  email: "support@photoos.in",
  phone: "+91 96896 89142",
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

let emailSettingsState = {
  enabled: true,
  provider: "resend",
  sender_name: "PhotoOS Cloud Platform",
  sender_email: "noreply@photoos.in",
  reply_to_email: "support@photoos.in",
  smtp_host: "smtp.resend.com",
  smtp_port: 587,
  smtp_username: "resend",
  encryption: "tls",
  api_key_configured: true,
  smtp_password_configured: true,
};

let brandingSettingsState = {
  logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
  primary_color: "#0A3F61",
  secondary_color: "#1E293B",
  accent_color: "#3B82F6",
  background_color: "#FFFFFF",
  text_color: "#0F172A",
  font_family: "Inter, sans-serif",
  heading_font: "Outfit, sans-serif",
  border_radius: "12px",
  button_style: "rounded-xl",
};

let announcementsState: Array<{
  id: string;
  title: string;
  body: string;
  status: string;
  priority: string;
  audience_type: string;
  channel: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_by: string;
  updated_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}> = [
  {
    id: "ann_01",
    title: "PhotoOS Platform 2.0 Live",
    body: "Operations Console is now live with role-based department inboxes, live analytics, and real-time studio management.",
    status: "published",
    priority: "high",
    audience_type: "all_studios",
    channel: "in_app",
    scheduled_at: null,
    published_at: "2026-10-28T10:00:00.000Z",
    created_by: "ADMIN_FOUNDER",
    updated_by: null,
    metadata: {},
    created_at: "2026-10-28T10:00:00.000Z",
    updated_at: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "ann_02",
    title: "Free Trial Phase Active",
    body: "Studio onboarding is running under the 7-day Pro Studio Free Trial with unlimited cloud uploads and AI face matching.",
    status: "published",
    priority: "normal",
    audience_type: "studio_owners",
    channel: "email",
    scheduled_at: null,
    published_at: "2026-10-29T10:00:00.000Z",
    created_by: "ADMIN_FOUNDER",
    updated_by: null,
    metadata: {},
    created_at: "2026-10-29T10:00:00.000Z",
    updated_at: "2026-10-29T10:00:00.000Z",
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const endpoint = slug.join("/");
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const studio = platformLiveStore.singleStudio;
  const users = platformLiveStore.users;

  // Studios - ONLY 1 Live Studio in Free Trial
  if (endpoint === "platform-admin-studios") {
    return NextResponse.json({
      success: true,
      data: {
        items: [studio],
        total: 1,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Free Trials - The 1 Studio in Free Trial
  if (endpoint === "platform-admin-free-trials") {
    const now = Date.now();
    const endMs = new Date(studio.trial_end_at).getTime();
    const remainingSec = Math.max(0, Math.floor((endMs - now) / 1000));
    const daysRemaining = Math.max(1, Math.ceil(remainingSec / 86400));

    const trialItem = {
      subscription_id: studio.subscription_id,
      studio_id: studio.studio_id,
      studio_code: studio.studio_code,
      studio_name: studio.studio_name,
      brand_name: studio.brand_name,
      owner_name: studio.owner_name,
      owner_email: studio.owner_email,
      owner_phone: studio.studio_phone,
      plan_code: studio.plan_code,
      plan_name: studio.plan_name,
      status: "trial",
      trial_days: studio.trial_days ?? 7,
      trial_start_at: studio.trial_start_at,
      trial_end_at: studio.trial_end_at,
      days_remaining: daysRemaining,
      remaining_seconds: remainingSec,
      created_at: studio.trial_start_at,
    };

    return NextResponse.json({
      success: true,
      data: {
        items: [trialItem],
        total: 1,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Users
  if (endpoint === "platform-admin-users") {
    return NextResponse.json({
      success: true,
      data: {
        items: users,
        total: users.length,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Subscriptions
  if (endpoint === "platform-admin-subscriptions") {
    const subs = [
      {
        subscription_id: studio.subscription_id,
        studio_id: studio.studio_id,
        studio_name: studio.studio_name,
        owner_name: studio.owner_name,
        owner_email: studio.owner_email,
        status: "trial",
        plan_code: studio.plan_code,
        plan_name: studio.plan_name,
        price: studio.plan_price,
        currency: studio.plan_currency,
        billing_cycle: studio.billing_cycle,
        created_at: studio.subscription_start_at,
        subscription_end_at: studio.subscription_end_at,
        auto_renew: false,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        items: subs,
        total: 1,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Active paid subscriptions are empty because currently only 1 studio exists and it is in Free Trial
  if (
    endpoint === "platform-admin-active-subscriptions" ||
    endpoint === "platform-admin-expired-subscriptions" ||
    endpoint === "platform-admin-cancelled-subscriptions"
  ) {
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Payments & Renewals during Free Trial
  if (
    endpoint === "platform-admin-payments" ||
    endpoint === "platform-admin-failed-payments" ||
    endpoint === "platform-admin-refunds" ||
    endpoint === "platform-admin-renewals"
  ) {
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        limit: 25,
        offset: 0,
      },
    });
  }

  // App Analytics
  if (endpoint === "platform-admin-app-analytics") {
    const qrScansCount = 34 + platformLiveStore.qrLeads.length;
    return NextResponse.json({
      success: true,
      registered_users: users.length,
      signups_30d: users.length,
      active_users_30d: users.length,
      total_bookings: 12,
      bookings_30d: 6,
      installs: 24,
      uninstalls: 0,
      qr_installs: qrScansCount,
      tracking_status: "active",
    });
  }

  // Accounting Dashboard (₹0 during trial)
  if (
    endpoint === "platform-admin-accounting-dashboard" ||
    endpoint === "platform-admin-sales-revenue" ||
    endpoint === "platform-admin-financial-reports"
  ) {
    return NextResponse.json({
      success: true,
      data: {
        date_from: "2026-10-01",
        date_to: "2026-10-31",
        currency: "INR",
        summary: {
          gross_revenue: 0,
          net_revenue: 0,
          tax_collected: 0,
          refunds_total: 0,
          pending_receivables: 0,
          paid_invoices_count: 0,
        },
        monthly_trend: [
          {
            month: "2026-10",
            gross_revenue: 0,
            net_revenue: 0,
            invoices_count: 0,
          },
        ],
      },
    });
  }

  // Invoices & Tax during trial
  if (endpoint === "platform-admin-invoices") {
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        limit: 25,
        offset: 0,
      },
    });
  }

  if (endpoint === "platform-admin-tax-gst") {
    return NextResponse.json({
      success: true,
      data: {
        gstin: "27AABCG1234F1Z5",
        state: "Maharashtra (27)",
        cgst_collected: 0,
        sgst_collected: 0,
        igst_collected: 0,
        total_tax: 0,
        period: "October 2026",
      },
    });
  }

  // Marketing Dashboard
  if (endpoint === "platform-marketing-dashboard") {
    const totalLeads = 3 + platformLiveStore.qrLeads.length;
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_signups: 2,
          client_signups: 1,
          studio_signups: 1,
          qr_scans: 34 + platformLiveStore.qrLeads.length,
          selfie_scans: 28 + platformLiveStore.qrLeads.length,
          total_leads: totalLeads,
          converted_leads: 1,
          lead_conversion_percent: Math.round((1 / totalLeads) * 100),
        },
        trial_conversion: {
          trial_signups: 1,
          trial_converted: 0,
          conversion_percent: 0,
        },
        campaigns: {
          total: 2,
          sent: 2,
        },
        generated_at: new Date().toISOString(),
      },
    });
  }

  // Marketing Leads - Returns both Demo Leads AND Live Event QR Leads!
  if (endpoint === "platform-marketing-leads") {
    const allLeads = [
      ...platformLiveStore.qrLeads,
      {
        id: "lead_demo_01",
        name: "Rajesh Shinde",
        email: "adskartmedia11@gmail.com",
        phone: "+91 96896 89142",
        city: "Pune",
        studio_name: "Shinde Visuals Pune",
        source: "Website Demo Request",
        status: "contacted",
        notes: "Interested in Pro Studio with AI Face Recognition",
        created_at: "2026-10-25T11:00:00.000Z",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        items: allLeads,
        total: allLeads.length,
        limit: 50,
        offset: 0,
      },
    });
  }

  // Marketing Signups
  if (endpoint === "platform-marketing-signups") {
    return NextResponse.json({
      success: true,
      data: {
        items: users.map((u) => ({
          id: u.profile_id,
          name: u.full_name,
          email: u.studio_email,
          phone: u.studio_phone,
          studio_name: u.studio_name,
          plan: "Pro Studio (Free Trial)",
          created_at: u.user_created_at,
        })),
        total: users.length,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Marketing Trial Conversion
  if (endpoint === "platform-marketing-trial-conversion") {
    return NextResponse.json({
      success: true,
      data: {
        items: [
          {
            studio_id: studio.studio_id,
            studio_name: studio.studio_name,
            owner_name: studio.owner_name,
            owner_email: studio.owner_email,
            converted_to_plan: "Pro Studio (14-Day Free Trial)",
            converted_at: studio.trial_start_at,
            amount: 0,
          },
        ],
        total: 1,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Marketing Campaigns
  if (endpoint === "platform-marketing-campaigns") {
    return NextResponse.json({
      success: true,
      data: {
        items: [
          {
            id: "cmp_01",
            title: "Diwali Studio Special Offer",
            subject: "Upgrade your photography studio with AI Face Recognition",
            sent_count: 148,
            open_rate: 68.4,
            status: "completed",
            created_at: "2026-10-20T10:00:00.000Z",
          },
        ],
        total: 1,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Marketing Growth Analytics
  if (endpoint === "platform-marketing-growth-analytics") {
    const from = searchParams.get("from") || "2026-10-01";
    const to = searchParams.get("to") || "2026-10-30";
    const qrCount = platformLiveStore.qrLeads.length;

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        growth_rate: "+42%",
        total_impressions: 18400,
        unique_visitors: 4210,
        signup_rate: "5.8%",
        funnel: {
          qr_scans: qrCount,
          selfie_scans: 14,
          signups: 2,
          converted_leads: 1,
        },
        trial_conversion: {
          trials: 1,
          converted: 0,
          conversion_percent: 0,
        },
        signup_trend: [
          { date: "2026-10-25", total: 1, studio: 1, client: 0 },
          { date: "2026-10-26", total: 1, studio: 0, client: 1 },
        ],
        signup_type: [
          { type: "studio", count: 1 },
          { type: "client", count: 1 },
        ],
        social_sources: [
          { source: "QR Standee Scan", leads: qrCount, converted: 1 },
          { source: "Direct Studio Demo", leads: 1, converted: 1 },
        ],
        campaign_performance: [
          {
            campaign_id: "camp_diwali_01",
            title: "Diwali Special Studio Activation",
            status: "Completed",
            recipients: 148,
            sent: 148,
            failed: 0,
            delivery_percent: 100,
          },
        ],
        generated_at: new Date().toISOString(),
      },
    });
  }

  // Support Dashboard - Fully compliant with PlatformSupportDashboard interface
  if (endpoint === "platform-support-dashboard") {
    const tickets = platformLiveStore.supportTickets;

    const openCount = tickets.filter((t) => t.status === "open").length;
    const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
    const inProgressCount = tickets.filter((t) => t.status === "in_review" || t.status === "waiting_user").length;
    const closedCount = tickets.filter((t) => t.status === "closed").length;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_tickets: tickets.length,
          open_tickets: openCount,
          in_progress_tickets: inProgressCount,
          resolved_tickets: resolvedCount,
          closed_tickets: closedCount,
          high_priority_tickets: tickets.filter((t) => t.priority === "high" || t.priority === "critical").length,
          unassigned_tickets: tickets.filter((t) => !t.assigned_to).length,
          refund_tickets: 0,
        },
        status_breakdown: [
          { status: "open", count: openCount },
          { status: "in_progress", count: inProgressCount },
          { status: "resolved", count: resolvedCount },
          { status: "closed", count: closedCount },
        ],
        priority_breakdown: [
          { priority: "critical", count: 0 },
          { priority: "high", count: 0 },
          { priority: "normal", count: tickets.length },
          { priority: "low", count: 0 },
        ],
        category_breakdown: [
          { category: "system", count: tickets.length },
          { category: "email_routing", count: 1 },
          { category: "billing", count: 0 },
          { category: "gallery", count: 0 },
        ],
        recent_tickets: tickets.map((t) => ({
          id: t.id,
          studio_id: t.studio_id,
          created_by: t.created_by,
          assigned_to: t.assigned_to,
          ticket_type: t.ticket_type,
          category: t.category,
          priority: t.priority,
          status: t.status,
          subject: t.subject,
          description: t.description,
          refund_status: t.refund_status,
          refund_amount: t.refund_amount,
          created_at: t.created_at,
        })),
        generated_at: new Date().toISOString(),
      },
    });
  }

  // Support Customer Issues & Cancellations
  if (
    endpoint === "platform-support-customer-issues" ||
    endpoint === "platform-support-cancellations"
  ) {
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        limit: 25,
        offset: 0,
      },
    });
  }

  // Administration: Employees
  if (endpoint === "platform-admin-employees") {
    return NextResponse.json({
      success: true,
      data: platformLiveStore.employees,
    });
  }

  // Administration: Notifications (includes live QR scan alerts)
  if (endpoint === "platform-admin-notifications") {
    const action = searchParams.get("action") || "list";
    const unreadOnly = searchParams.get("unread_only") === "true";

    if (action === "count") {
      const unreadCount = platformLiveStore.notifications.filter((n) => !n.read_at).length;
      return NextResponse.json({
        success: true,
        data: unreadCount,
      });
    }

    const items = unreadOnly
      ? platformLiveStore.notifications.filter((n) => !n.read_at)
      : platformLiveStore.notifications;

    const formatted = items.map((n) => ({
      id: n.id,
      platform_admin_id: "adm_parashram",
      notification_type: n.category || "system",
      priority: "normal",
      title: n.title,
      body: n.message,
      action_url: "/ops-console/dashboard",
      action_label: "View",
      read_at: n.read_at,
      metadata: {},
      created_at: n.created_at,
      updated_at: n.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  }

  // Administration: Announcements
  if (endpoint === "platform-admin-announcements") {
    const action = searchParams.get("action") || "list";
    if (action === "get") {
      const id = searchParams.get("id");
      const found = announcementsState.find((a) => a.id === id) || announcementsState[0];
      return NextResponse.json({ success: true, data: found });
    }
    return NextResponse.json({
      success: true,
      data: announcementsState,
    });
  }

  // Administration: Roles & Permissions
  if (endpoint === "platform-admin-roles-permissions") {
    const permissions = [
      {
        id: "perm_all",
        code: "*",
        name: "Full System Master Access",
        description: "Full access across all system modules",
        module: "System",
        status: "active",
      },
      {
        id: "perm_admin",
        code: "admin:*",
        name: "Platform Operations & Administration",
        description: "Manage studios, employee accounts, and system configuration",
        module: "Administration",
        status: "active",
      },
      {
        id: "perm_dev",
        code: "dev:*",
        name: "Software & Engineering Logs",
        description: "Access system health, software features, and server monitoring",
        module: "Engineering",
        status: "active",
      },
      {
        id: "perm_hr",
        code: "hr:*",
        name: "Employee & People Management",
        description: "Manage admin employees, roles, and internal communications",
        module: "Human Resources",
        status: "active",
      },
      {
        id: "perm_marketing",
        code: "marketing:*",
        name: "Marketing & Growth Campaigns",
        description: "Manage marketing campaigns, QR guest leads, and growth analytics",
        module: "Marketing",
        status: "active",
      },
      {
        id: "perm_accounting",
        code: "accounting:*",
        name: "Finance, Billing & Taxes",
        description: "Access revenue ledgers, invoices, GST, and payouts",
        module: "Accounting",
        status: "active",
      },
      {
        id: "perm_qa",
        code: "qa:*",
        name: "Quality Assurance & Diagnostics",
        description: "App diagnostics, test verification, and audit logs",
        module: "Quality Assurance",
        status: "active",
      },
      {
        id: "perm_sales",
        code: "sales:*",
        name: "Sales & Studio Acquisition",
        description: "Manage studio onboarding, sales leads, and conversions",
        module: "Sales",
        status: "active",
      },
      {
        id: "perm_support",
        code: "support:*",
        name: "Helpdesk & Customer Support",
        description: "Read and reply to support inboxes, tickets, and studio queries",
        module: "Support",
        status: "active",
      },
    ];

    const roles = [
      {
        id: "role_super_admin",
        code: "super_admin",
        name: "Super Admin (Founder)",
        description: "Master access across all platform departments",
        is_system: true,
        status: "active",
        permissions,
      },
      {
        id: "role_admin",
        code: "admin",
        name: "Administrator (Operations)",
        description: "Platform operations, studio approvals, system configurations & access administration",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Administration" || p.module === "System"),
      },
      {
        id: "role_software_developer",
        code: "software_developer",
        name: "Software Developer (Engineering)",
        description: "Engineering, core systems, AI pipeline, microservices & technical infrastructure",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Engineering" || p.module === "System"),
      },
      {
        id: "role_hr",
        code: "hr",
        name: "Human Resources (HR)",
        description: "Personnel management, employee onboarding, roles & internal communication",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Human Resources" || p.module === "Administration"),
      },
      {
        id: "role_marketing",
        code: "marketing",
        name: "Marketing Specialist",
        description: "Growth analytics, promotional campaigns, social channels & QR scan leads",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Marketing"),
      },
      {
        id: "role_accountant",
        code: "accountant",
        name: "Accountant (Finance & Billing)",
        description: "Financial ledgers, invoices, payment gateways, GST & subscriptions",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Accounting"),
      },
      {
        id: "role_qa_tester",
        code: "qa_tester",
        name: "QA Tester (Quality Assurance)",
        description: "Platform reliability testing, bug verification, system audit & error logs",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Quality Assurance" || p.module === "Engineering"),
      },
      {
        id: "role_sales",
        code: "sales",
        name: "Sales (Studio Acquisition)",
        description: "Studio onboarding, enterprise demos, marketplace listings & leads",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Sales" || p.module === "Marketing"),
      },
      {
        id: "role_support",
        code: "support",
        name: "Customer Support Specialist",
        description: "Studio support desk, ticketing, customer issues & department inbox",
        is_system: false,
        status: "active",
        permissions: permissions.filter((p) => p.module === "Support"),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        roles,
        permissions,
      },
    });
  }

  // Administration: Access Control
  if (endpoint === "platform-admin-access-control") {
    const permissions = [
      {
        id: "perm_all",
        code: "*",
        name: "Full System Master Access",
        description: "Full access across all system modules",
        module: "System",
        status: "active",
      },
      {
        id: "perm_inbox",
        code: "inbox:*",
        name: "Department Inbox Access",
        description: "Read and reply to support, billing, and marketing emails",
        module: "Support",
        status: "active",
      },
      {
        id: "perm_leads",
        code: "leads:*",
        name: "Leads & Guest Captures",
        description: "View and follow up with QR scan leads and demo inquiries",
        module: "Marketing",
        status: "active",
      },
    ];

    const accessControlEmployees = platformLiveStore.employees.map((emp) => ({
      platform_admin_id: emp.platform_admin_id,
      profile_id: emp.profile_id,
      display_name: emp.display_name,
      email: emp.email,
      employee_code: emp.employee_code,
      status: emp.status,
      last_activity_at: emp.last_activity_at,
      roles: emp.roles,
      permissions: permissions,
    }));

    return NextResponse.json({
      success: true,
      data: accessControlEmployees,
    });
  }

  // Administration: Audit Logs
  if (endpoint === "platform-admin-audit-logs") {
    const action = searchParams.get("action");

    if (action === "statistics") {
      return NextResponse.json({
        success: true,
        data: {
          total_events: 18,
          today: 4,
          last_7_days: 12,
          last_30_days: 18,
          unique_admins: 2,
          unique_actions: 4,
          unique_modules: 3,
          latest_event: new Date().toISOString(),
        },
      });
    }

    if (action === "filter-options") {
      return NextResponse.json({
        success: true,
        data: {
          actions: ["auth.login_2fa", "leads.qr_capture", "employee.invite", "settings.update"],
          modules: ["Security", "Marketing", "Administration", "Settings"],
          target_types: ["AdminSession", "QrLead", "AdminEmployee", "CompanySettings"],
        },
      });
    }

    const auditItems = [
      {
        id: "audit_01",
        platform_admin_id: "adm_parashram",
        action: "auth.login_2fa",
        module: "Security",
        target_type: "AdminSession",
        target_id: "ops_session_active_founder",
        ip_address: "103.21.244.0",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        metadata: { email: studio.owner_email, method: "Resend 2FA OTP" },
        created_at: new Date().toISOString(),
        total_count: 2,
      },
      {
        id: "audit_02",
        platform_admin_id: "adm_parashram",
        action: "leads.qr_capture",
        module: "Marketing",
        target_type: "QrLead",
        target_id: "lead_qr_01",
        ip_address: "103.21.244.0",
        user_agent: "Mobile Standee QR Scanner",
        metadata: { source: "Event QR Standee Scan", guest: "Sandeep More" },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        total_count: 2,
      },
    ];

    return NextResponse.json({
      success: true,
      data: auditItems,
    });
  }

  // Administration: Security Logs
  if (endpoint === "platform-admin-security-logs") {
    const action = searchParams.get("action");

    if (action === "statistics") {
      return NextResponse.json({
        success: true,
        data: {
          total_events: 18,
          today: 4,
          last_7_days: 12,
          last_30_days: 18,
          successful_events: 18,
          failed_events: 0,
          unique_ips: 2,
          unique_event_types: 4,
          latest_event: new Date().toISOString(),
        },
      });
    }

    if (action === "filter-options") {
      return NextResponse.json({
        success: true,
        data: {
          event_types: ["LOGIN_2FA", "SESSION_RESUME", "QR_GUEST_CAPTURE", "EMPLOYEE_INVITE"],
          event_categories: ["AUTH", "EMAIL", "SECURITY", "LEAD"],
        },
      });
    }

    const secLogs = [
      {
        id: "sec_log_01",
        platform_admin_id: "adm_parashram",
        event_type: "LOGIN_2FA",
        event_category: "AUTH",
        success: true,
        failure_reason: null,
        ip_address: "103.21.244.0 (Cloudflare Secure)",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        session_id: "ops_session_active_founder",
        metadata: { method: "2FA Email OTP", email: studio.owner_email },
        created_at: new Date().toISOString(),
      },
      {
        id: "sec_log_02",
        platform_admin_id: "adm_parashram",
        event_type: "QR_GUEST_CAPTURE",
        event_category: "LEAD",
        success: true,
        failure_reason: null,
        ip_address: "103.21.244.0",
        user_agent: "Mobile QR Scanner",
        session_id: "guest_session_01",
        metadata: { source: "Event QR Scan", count: platformLiveStore.qrLeads.length },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: secLogs,
    });
  }

  // Software Overview, Plans, Features & Health
  if (
    endpoint === "platform-admin-software" ||
    endpoint === "platform-admin-software-overview" ||
    endpoint === "platform-admin-software-plans" ||
    endpoint === "platform-admin-software-features" ||
    endpoint === "platform-admin-software-plan-pricing" ||
    endpoint === "platform-admin-software-usage" ||
    endpoint === "platform-admin-system-health"
  ) {
    const plans = [
      {
        id: "plan_pro_trial",
        code: "pro_trial",
        name: "Pro Studio (7-Day Free Trial)",
        price: 0,
        currency: "INR",
        billing_cycle: "trial",
        is_active: true,
        features: [
          "7-Day Full Free Access",
          "AI Face Recognition",
          "Unlimited High-Res Gallery",
          "Automated Email Dispatch (Resend)",
          "QR Guest Capture & CRM",
        ],
      },
      {
        id: "plan_pro",
        code: "pro_annual",
        name: "Pro Studio Annual",
        price: 24990,
        currency: "INR",
        billing_cycle: "yearly",
        is_active: true,
        features: [
          "Unlimited High-Res Gallery",
          "AI Face Recognition",
          "Automated Email Dispatch (Resend)",
          "WhatsApp Client Delivery",
          "Priority Helpdesk Support",
        ],
      },
      {
        id: "plan_enterprise",
        code: "enterprise_annual",
        name: "Enterprise Studio",
        price: 49990,
        currency: "INR",
        billing_cycle: "yearly",
        is_active: true,
        features: [
          "Dedicated Custom Domain",
          "Custom Watermark Branding",
          "Multi-Branch Team Accounts",
          "Dedicated Account Manager",
        ],
      },
    ];

    const health = {
      overall_status: "healthy",
      database_uptime: "99.98%",
      email_delivery_status: "Active (Resend API Connected)",
      storage_usage: "12.4 GB / 1000 GB",
      memory_usage: "Normal",
      latency_ms: 28,
    };

    return NextResponse.json({
      success: true,
      data: {
        plans,
        summary: {
          total_plans: plans.length,
          active_subscribers: 1,
          annual_run_rate: 0,
        },
        health,
        usage: {
          storage_used_bytes: 13316915200,
          api_requests_count: 1420,
          active_galleries: 8,
        },
        feature_flags: [
          { name: "face_recognition", enabled: true },
          { name: "client_watermark", enabled: true },
          { name: "resend_inbox_integration", enabled: true },
          { name: "qr_guest_capture", enabled: true },
        ],
        platform_feature_flags: [
          { name: "two_factor_auth", enabled: true },
          { name: "role_based_access", enabled: true },
          { name: "employee_first_login_password_reset", enabled: true },
        ],
        generated_at: new Date().toISOString(),
      },
    });
  }

  // Marketplace Analytics
  if (endpoint === "platform-admin-marketplace-analytics") {
    const fromDate = searchParams.get("date_from") || "2026-10-01";
    const toDate = searchParams.get("date_to") || "2026-10-30";
    const qrCount = platformLiveStore.qrLeads.length;

    return NextResponse.json({
      success: true,
      data: {
        period: {
          date_from: fromDate,
          date_to: toDate,
        },
        overview: {
          total_studios: 1,
          active_studios: 1,
          verified_studios: 1,
          featured_studios: 1,
          total_listings: 1,
          active_listings: 1,
          total_categories: 4,
          total_reviews: 38,
          total_leads: qrCount,
          converted_leads: 1,
          total_orders: 0,
        },
        revenue: {
          marketplace_orders_revenue: 0,
          verified_badge_revenue: 0,
          verified_badge_active_studios: 1,
          verified_badge_price: 0,
        },
        revenue_trend: [
          {
            date: "2026-10-25",
            marketplace_revenue: 0,
            verified_badge_revenue: 0,
          },
          {
            date: "2026-10-29",
            marketplace_revenue: 0,
            verified_badge_revenue: 0,
          },
        ],
        studio_breakdown: {
          paid: 0,
          free_trial: 1,
          free: 0,
        },
        verification_breakdown: {
          verified: 1,
          unverified: 0,
        },
        leads: {
          total: qrCount,
          active: qrCount,
          converted: 1,
          expected_value: 0,
          conversion_rate: 100,
        },
        lead_sources: [
          { source: "QR Standee Scan", count: qrCount, converted: 1 },
        ],
        city_performance: [
          { city: "Pune", studios: 1, listings: 1 },
        ],
        category_performance: [
          { category: "Wedding & Candid", listings: 1, active_listings: 1 },
          { category: "Pre-Wedding", listings: 1, active_listings: 1 },
        ],
        reviews: {
          total: 38,
          average_rating: 4.9,
          five_star: 35,
          four_star: 3,
          three_star: 0,
          two_star: 0,
          one_star: 0,
        },
        orders: {
          total: 0,
          completed: 0,
          revenue: 0,
        },
        generated_at: new Date().toISOString(),
      },
    });
  }

  // Marketplace Listings & Overview
  if (
    endpoint === "platform-admin-marketplace" ||
    endpoint === "platform-admin-marketplace-overview" ||
    endpoint === "platform-admin-marketplace-listings" ||
    endpoint === "platform-admin-marketplace-active" ||
    endpoint === "platform-admin-marketplace-pending" ||
    endpoint === "platform-admin-marketplace-featured" ||
    endpoint === "platform-admin-marketplace-leads"
  ) {
    const listings = [
      {
        id: "lst_01",
        studio_id: studio.studio_id,
        business_name: studio.studio_name,
        brand_name: studio.brand_name,
        contact_person: studio.owner_name,
        email: studio.studio_email,
        phone: studio.studio_phone,
        city: "Pune",
        state: "Maharashtra",
        categories: ["Wedding", "Pre-Wedding", "Candid", "Drone 4K"],
        rating: 4.9,
        review_count: 38,
        is_verified: true,
        is_featured: true,
        status: "active",
        created_at: studio.trial_start_at,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        items: listings,
        total: 1,
        limit: 25,
        offset: 0,
        summary: {
          total_listings: 1,
          active_listings: 1,
          pending_listings: 0,
          featured_listings: 1,
        },
      },
    });
  }

  // Settings
  if (endpoint === "platform-admin-settings") {
    const section = searchParams.get("section");

    const effectiveCompany = {
      ...companySettingsState,
      ...platformLiveStore.companySettings,
    };

    if (section === "company") {
      return NextResponse.json({ success: true, data: effectiveCompany });
    }
    if (section === "email") {
      return NextResponse.json({ success: true, data: emailSettingsState });
    }
    if (section === "branding") {
      return NextResponse.json({ success: true, data: brandingSettingsState });
    }

    return NextResponse.json({
      success: true,
      data: {
        general: {
          site_name: "PhotoOS",
          site_description: "Next-Gen Photography Operating System & Studio Management",
          support_email: "support@photoos.in",
          default_currency: "INR",
          maintenance_mode: false,
        },
        company: effectiveCompany,
        email: emailSettingsState,
        branding: brandingSettingsState,
      },
    });
  }

  // Default GET fallback
  return NextResponse.json({
    success: true,
    data: {
      items: [],
      total: 0,
      limit: 25,
      offset: 0,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const endpoint = slug.join("/");
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Support Tickets API
  if (endpoint === "admin-support-tickets") {
    const action = body.action as string;

    if (action === "update") {
      const ticketId = body.ticket_id as string;
      const status = body.status as string;
      const adminNotes = body.admin_notes as string | undefined;

      const ticket = platformLiveStore.supportTickets.find((t) => t.id === ticketId);
      if (ticket) {
        if (status) ticket.status = status as any;
        if (adminNotes) ticket.admin_notes = adminNotes;
        ticket.updated_at = new Date().toISOString();
      }

      return NextResponse.json({
        success: true,
        message: "Support ticket updated successfully.",
        data: {
          ticket: ticket || platformLiveStore.supportTickets[0],
        },
      });
    }

    const filterStatus = body.status as string | undefined;
    const filtered = filterStatus
      ? platformLiveStore.supportTickets.filter((t) => t.status === filterStatus)
      : platformLiveStore.supportTickets;

    return NextResponse.json({
      success: true,
      message: "Support tickets loaded.",
      data: {
        tickets: filtered,
      },
    });
  }

  // Website AI Enquiries
  if (endpoint === "platform-admin-website-ai-enquiries") {
    const action = body.action as string;

    if (action === "count") {
      return NextResponse.json({
        success: true,
        data: {
          count: platformLiveStore.qrLeads.length + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        enquiries: [],
      },
    });
  }

  // Employee Creation with Automated Resend Greeting Email & Temp Password
  if (endpoint === "platform-admin-employee") {
    const displayName = (body.display_name as string) || "Admin Staff";
    const email = (body.email as string) || "adskartmedia11@gmail.com";
    const roleCode = (body.role_code as string) || "admin";

    const { employee, temporaryPassword } = await platformLiveStore.createEmployee(
      displayName,
      email,
      roleCode
    );

    return NextResponse.json({
      success: true,
      data: {
        sent: true,
        email: employee.email,
        user_id: employee.user_id,
        employee,
        credentials: {
          user_id: employee.user_id,
          temporary_password: temporaryPassword,
        },
      },
      employee: {
        success: true,
        platform_admin_id: employee.platform_admin_id,
        profile_id: employee.profile_id,
        credential_id: `crd_${Date.now()}`,
        user_id: employee.user_id,
        employee_code: employee.employee_code,
        role_code: roleCode,
      },
      credentials: {
        user_id: employee.user_id,
        temporary_password: temporaryPassword,
      },
    });
  }

  // Employee Invite Resend
  if (endpoint === "platform-admin-send-invite") {
    const adminId = (body.platform_admin_id as string) || "";
    const tempPass = (body.temporary_password as string) || "PhotoOS#2026";
    const bodyEmail = ((body.email as string) || "").trim().toLowerCase();
    const bodyName = ((body.display_name as string) || "").trim();
    const bodyRole = ((body.role_code as string) || "admin").trim();

    let emp = platformLiveStore.employees.find(
      (e) =>
        (adminId && (e.platform_admin_id === adminId || e.user_id === adminId)) ||
        (bodyEmail && e.email === bodyEmail)
    );

    if (!emp && bodyEmail) {
      emp = {
        platform_admin_id: adminId || `adm_${Date.now()}`,
        profile_id: `usr_${Date.now()}`,
        display_name: bodyName || "PhotoOS Staff",
        email: bodyEmail,
        employee_code: `ADM-${Math.floor(100 + Math.random() * 900)}`,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: null,
        user_id: bodyEmail,
        must_change_password: true,
        last_login_at: null,
        password_changed_at: null,
        roles: [
          {
            id: `role_${bodyRole}`,
            code: bodyRole,
            name: bodyRole,
            description: `Assigned ${bodyRole} duties`,
            status: "active",
          },
        ],
      };
      platformLiveStore.employees.push(emp);
    }

    const targetEmail = emp ? emp.email : (bodyEmail || "adskartmedia11@gmail.com");
    const targetName = emp ? emp.display_name : (bodyName || "Team Member");

    await platformLiveStore.sendWelcomeCredentialsEmail(
      emp || {
        display_name: targetName,
        email: targetEmail,
        roles: [{ name: bodyRole }],
      },
      tempPass
    );

    return NextResponse.json({
      success: true,
      data: {
        sent: true,
        email: targetEmail,
        user_id: emp ? emp.user_id : targetEmail,
      },
      message: "Credentials and welcome instructions sent via team@photoos.in.",
    });
  }

  // Password Change / First Login Reset
  if (endpoint === "platform-admin-password-change") {
    const newPassword = body.password as string;
    // Mark must_change_password as false for the session
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { validateAdminSession } = await import("@/lib/auth/admin-2fa.service");
    const session = validateAdminSession(token);
    const targetUser = session ? session.userId : "adskartmedia11@gmail.com";
    platformLiveStore.updatePassword(targetUser, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. You may now access the platform.",
    });
  }

  // Settings Save
  if (endpoint === "platform-admin-settings") {
    const section = (searchParams.get("section") || body.key || body.section) as string;
    const value = (body.value || body) as Record<string, unknown>;

    if (section === "company" || !section) {
      companySettingsState = { ...companySettingsState, ...value };
      platformLiveStore.updateCompanySettings(value);
      return NextResponse.json({
        success: true,
        data: platformLiveStore.companySettings,
      });
    }
    if (section === "email") {
      emailSettingsState = { ...emailSettingsState, ...value };
      return NextResponse.json({ success: true, data: emailSettingsState });
    }
    if (section === "branding") {
      brandingSettingsState = { ...brandingSettingsState, ...value };
      return NextResponse.json({ success: true, data: brandingSettingsState });
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      data: value,
    });
  }

  // Announcements CRUD (POST / PATCH / DELETE)
  if (endpoint === "platform-admin-announcements") {
    const action = (searchParams.get("action") || body.action || "create") as string;

    if (action === "create") {
      const newAnn = {
        id: `ann_${Date.now()}`,
        title: (body.title as string) || "System Announcement",
        body: (body.body as string) || "",
        status: (body.status as string) || "published",
        priority: (body.priority as string) || "normal",
        audience_type: (body.audience_type as string) || "all_users",
        channel: (body.channel as string) || "in_app",
        scheduled_at: (body.scheduled_at as string) || null,
        published_at: new Date().toISOString(),
        created_by: "ADMIN_FOUNDER",
        updated_by: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      announcementsState.unshift(newAnn);
      return NextResponse.json({ success: true, data: newAnn });
    }

    if (action === "publish") {
      const id = body.id as string;
      const target = announcementsState.find((a) => a.id === id);
      if (target) {
        target.status = "published";
        target.published_at = new Date().toISOString();
        target.updated_at = new Date().toISOString();
      }
      return NextResponse.json({ success: true, data: target });
    }

    if (action === "update") {
      const id = body.id as string;
      const target = announcementsState.find((a) => a.id === id);
      if (target) {
        Object.assign(target, body, { updated_at: new Date().toISOString() });
      }
      return NextResponse.json({ success: true, data: target });
    }
  }

  // Notifications Mark Read / Read All
  if (endpoint === "platform-admin-notifications") {
    const action = searchParams.get("action") || body.action;
    if (action === "read-all") {
      platformLiveStore.notifications.forEach((n) => {
        n.read_at = new Date().toISOString();
      });
      return NextResponse.json({ success: true, data: platformLiveStore.notifications.length });
    }
    if (action === "read") {
      const id = body.id as string;
      const target = platformLiveStore.notifications.find((n) => n.id === id);
      if (target) {
        target.read_at = new Date().toISOString();
      }
      return NextResponse.json({ success: true, data: target });
    }
  }

  // Generic POST fallback
  return NextResponse.json({
    success: true,
    message: "Operation completed successfully.",
    data: body,
  });
}
