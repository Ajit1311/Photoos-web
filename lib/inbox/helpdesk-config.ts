import {
  UserProfile,
  EmailThread,
  CannedResponse,
  Department,
} from "@/types/inbox/helpdesk";

export const USER_PROFILES: UserProfile[] = [
  {
    id: "usr_super_admin",
    name: "Parashram S Naik",
    email: "adskartmedia11@gmail.com",
    role: "SUPER_ADMIN",
    roleTitle: "Founder & Super Admin",
    allowedDepartment: "all",
    avatar: "PN",
  },
  {
    id: "usr_support_agent",
    name: "PhotoOS Support Lead",
    email: "support@photoos.in",
    role: "SUPPORT_AGENT",
    roleTitle: "Support Specialist",
    allowedDepartment: "support",
    avatar: "PS",
  },
  {
    id: "usr_billing_agent",
    name: "PhotoOS Billing Desk",
    email: "billing@photoos.in",
    role: "BILLING_AGENT",
    roleTitle: "Billing Operations",
    allowedDepartment: "billing",
    avatar: "PB",
  },
  {
    id: "usr_marketing_specialist",
    name: "PhotoOS Growth Team",
    email: "marketing@photoos.in",
    role: "MARKETING_AGENT",
    roleTitle: "Marketing Lead",
    allowedDepartment: "marketing",
    avatar: "PG",
  },
];

export const DEPARTMENT_CONFIG: Record<
  Exclude<Department, "all">,
  {
    label: string;
    email: string;
    badgeBg: string;
    badgeText: string;
    borderCol: string;
    description: string;
    accentColor: string;
  }
> = {
  support: {
    label: "Support",
    email: "support@photoos.in",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-400",
    borderCol: "border-blue-500/30",
    description: "Bug reports, upload stuck, face recognition & general studio setup.",
    accentColor: "#2563eb",
  },
  billing: {
    label: "Billing",
    email: "billing@photoos.in",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-400",
    borderCol: "border-amber-500/30",
    description: "Tax invoices, double debits, GST receipts & plan upgrades.",
    accentColor: "#d97706",
  },
  marketing: {
    label: "Marketing",
    email: "marketing@photoos.in",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-400",
    borderCol: "border-purple-500/30",
    description: "Creator partnerships, studio onboarding & verified listings.",
    accentColor: "#9333ea",
  },
  founder_legal: {
    label: "Founder & Legal",
    email: "founder@photoos.in",
    badgeBg: "bg-slate-500/10 dark:bg-slate-500/20",
    badgeText: "text-slate-700 dark:text-slate-300",
    borderCol: "border-slate-500/30",
    description: "Enterprise studio networks, DPDP Act 2023 compliance & NDAs.",
    accentColor: "#475569",
  },
};

export const INITIAL_THREADS: EmailThread[] = [];

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "can_01",
    title: "GST Invoice Details Requested",
    department: "billing",
    content: `Dear Customer,\n\nThank you for providing your registered GST details. We have updated your account profile with GSTIN and regenerated your B2B tax invoice. You can download the signed tax invoice directly from your Studio Dashboard > Billing & Invoices section, or reply to this email if you need us to attach a PDF copy.\n\nWarm regards,\nPhotoOS Billing Operations`,
  },
  {
    id: "can_02",
    title: "Upload Speed & Quota Troubleshooting",
    department: "support",
    content: `Hello Studio Team,\n\nWe looked into the upload stream for your project. Please verify that individual JPEG/RAW files do not exceed 45MB each. If you are uploading via Wi-Fi with occasional packet drops, we recommend enabling 'Chunked Safe Upload' in your Studio Settings > Gallery Upload Preferences.\n\nOur system also provides auto-resume so you won't lose progress on uploaded images.\n\nBest regards,\nPhotoOS Technical Support`,
  },
  {
    id: "can_03",
    title: "Creator Partnership Media Kit",
    department: "marketing",
    content: `Hi there!\n\nThank you for your interest in partnering with PhotoOS. We love collaborating with passionate creators and educators who empower wedding and portrait photographers.\n\nWe have activated a 30-day Pro Studio sandbox account for your review and attached our media kit with official branding assets, key talking points, and affiliate program details.\n\nLet's schedule a 15-minute walkthrough whenever convenient!\n\nWarm regards,\nPhotoOS Growth & Marketing`,
  },
  {
    id: "can_04",
    title: "Enterprise Custom SLA & Multi-Studio Plan",
    department: "founder_legal",
    content: `Dear Enterprise Partner,\n\nThank you for your inquiry. PhotoOS Enterprise is specifically engineered for multi-branch studio networks and large event production companies requiring dedicated storage vaults, custom domains, 99.9% uptime SLAs, and centralized management.\n\nOur executive team would be delighted to host a private architecture review and discuss contract terms with you. What day and time work best this week?\n\nSincerely,\nPhotoOS Enterprise Team`,
  },
];

