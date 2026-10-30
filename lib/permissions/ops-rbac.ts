/**
 * PhotoOS Operations Console - Role-Based Access Control (RBAC)
 * Defines role definitions, permission checking, route matching, and sidebar filtering.
 */

export type OpsRoleCode =
  | "super_admin"
  | "admin"
  | "software_developer"
  | "hr"
  | "marketing"
  | "accountant"
  | "qa_tester"
  | "sales"
  | "support";

export interface RoleDefinition {
  code: OpsRoleCode;
  name: string;
  department: string;
  description: string;
  badgeLabel: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
  defaultPath: string;
  allowedRoutePrefixes: string[];
}

export const ROLE_DEFINITIONS: Record<OpsRoleCode, RoleDefinition> = {
  super_admin: {
    code: "super_admin",
    name: "Super Administrator (Founder & CEO)",
    department: "Executive & Founder",
    description: "Unrestricted master access across all platform modules, settings, finances, and system records.",
    badgeLabel: "FOUNDER & CEO (MASTER)",
    badgeColor: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/30",
    },
    defaultPath: "/ops-console/dashboard",
    // Wildcard: Full master access
    allowedRoutePrefixes: ["*"],
  },
  admin: {
    code: "admin",
    name: "Administrator (Operations)",
    department: "Operations",
    description: "Platform operations, studio approvals, user accounts, marketplace management, and support desk.",
    badgeLabel: "OPERATIONS ADMIN",
    badgeColor: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-500/30",
    },
    defaultPath: "/ops-console/dashboard",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/users",
      "/ops-console/studios",
      "/ops-console/subscriptions",
      "/ops-console/marketplace",
      "/ops-console/support",
      "/ops-console/inbox",
      "/ops-console/chat",
      "/ops-console/announcements",
      "/ops-console/notifications",
      "/ops-console/settings",
      "/ops-console/settings/company",
      "/ops-console/settings/branding",
      "/ops-console/settings/notifications",
    ],
  },
  software_developer: {
    code: "software_developer",
    name: "Software Developer (Engineering)",
    department: "Engineering",
    description: "Software features, core system health, usage diagnostics, engineering logs, and technical integrations.",
    badgeLabel: "ENGINEERING",
    badgeColor: {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      text: "text-indigo-700 dark:text-indigo-400",
      border: "border-indigo-500/30",
    },
    defaultPath: "/ops-console/software",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/software",
      "/ops-console/app-analytics",
      "/ops-console/chat",
      "/ops-console/announcements",
      "/ops-console/notifications",
      "/ops-console/audit-logs",
      "/ops-console/security-logs",
      "/ops-console/settings/system",
      "/ops-console/settings/integrations",
    ],
  },
  hr: {
    code: "hr",
    name: "Human Resources (HR)",
    department: "Human Resources",
    description: "Employee onboarding, credential dispatch, role assignments, access control, and team announcements.",
    badgeLabel: "HUMAN RESOURCES",
    badgeColor: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/30",
    },
    defaultPath: "/ops-console/employees",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/employees",
      "/ops-console/roles",
      "/ops-console/access-control",
      "/ops-console/audit-logs",
      "/ops-console/chat",
      "/ops-console/announcements",
      "/ops-console/notifications",
      "/ops-console/inbox",
    ],
  },
  marketing: {
    code: "marketing",
    name: "Marketing Specialist",
    department: "Marketing",
    description: "Promotional campaigns, event QR guest leads, growth analytics, signups, and marketing inbox.",
    badgeLabel: "MARKETING",
    badgeColor: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-500/30",
    },
    defaultPath: "/ops-console/marketing",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/marketing",
      "/ops-console/app-analytics",
      "/ops-console/inbox",
      "/ops-console/announcements",
      "/ops-console/notifications",
    ],
  },
  accountant: {
    code: "accountant",
    name: "Accountant (Finance & Billing)",
    department: "Finance & Accounting",
    description: "Payment transactions, GST ledgers, billing invoices, refunds, renewals, and accounting reports.",
    badgeLabel: "FINANCE & BILLING",
    badgeColor: {
      bg: "bg-emerald-600/10 dark:bg-emerald-600/20",
      text: "text-emerald-800 dark:text-emerald-400",
      border: "border-emerald-600/30",
    },
    defaultPath: "/ops-console/accounting",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/payments",
      "/ops-console/subscriptions",
      "/ops-console/renewals",
      "/ops-console/accounting",
      "/ops-console/settings/payments",
      "/ops-console/inbox",
    ],
  },
  qa_tester: {
    code: "qa_tester",
    name: "QA Tester (Quality Assurance)",
    department: "Quality Assurance",
    description: "Quality assurance, app diagnostics, system health checks, customer bug verification, and audit logs.",
    badgeLabel: "QA & TESTING",
    badgeColor: {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      text: "text-cyan-700 dark:text-cyan-400",
      border: "border-cyan-500/30",
    },
    defaultPath: "/ops-console/software/system-health",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/app-analytics",
      "/ops-console/software",
      "/ops-console/support/issues",
      "/ops-console/support-tickets",
      "/ops-console/audit-logs",
      "/ops-console/security-logs",
    ],
  },
  sales: {
    code: "sales",
    name: "Sales (Studio Acquisition)",
    department: "Sales",
    description: "Studio acquisition, enterprise leads, studio demos, marketplace listings, and trial conversions.",
    badgeLabel: "SALES & GROWTH",
    badgeColor: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/30",
    },
    defaultPath: "/ops-console/marketplace",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/marketplace",
      "/ops-console/marketing/leads",
      "/ops-console/marketing/signups",
      "/ops-console/marketing/trial-conversion",
      "/ops-console/studios",
      "/ops-console/subscriptions/trials",
      "/ops-console/inbox",
    ],
  },
  support: {
    code: "support",
    name: "Customer Support Specialist",
    department: "Customer Support",
    description: "Studio helpdesk, customer issues, tickets, cancellations, user activity lookup, and support inbox.",
    badgeLabel: "CUSTOMER SUPPORT",
    badgeColor: {
      bg: "bg-sky-500/10 dark:bg-sky-500/20",
      text: "text-sky-700 dark:text-sky-400",
      border: "border-sky-500/30",
    },
    defaultPath: "/ops-console/support",
    allowedRoutePrefixes: [
      "/ops-console/dashboard",
      "/ops-console/support",
      "/ops-console/inbox",
      "/ops-console/support-tickets",
      "/ops-console/users",
      "/ops-console/studios",
      "/ops-console/chat",
      "/ops-console/announcements",
      "/ops-console/notifications",
    ],
  },
};

/**
 * Universal public ops routes accessible by any logged-in ops staff
 */
export const COMMON_OPS_ROUTES = [
  "/ops-console/login",
  "/ops-console/change-password",
];

/**
 * Normalize a role code string into a valid OpsRoleCode
 */
export function normalizeRoleCode(roleInput?: string | null): OpsRoleCode {
  if (!roleInput) return "super_admin";
  const clean = roleInput.trim().toLowerCase();

  if (clean in ROLE_DEFINITIONS) {
    return clean as OpsRoleCode;
  }

  // Handle aliases or legacy codes
  if (clean.includes("super") || clean.includes("founder") || clean.includes("ceo") || clean.includes("master")) {
    return "super_admin";
  }
  if (clean.includes("dev") || clean.includes("software") || clean.includes("engineer")) {
    return "software_developer";
  }
  if (clean.includes("hr") || clean.includes("human")) {
    return "hr";
  }
  if (clean.includes("market") || clean.includes("growth")) {
    return "marketing";
  }
  if (clean.includes("account") || clean.includes("billing") || clean.includes("finance")) {
    return "accountant";
  }
  if (clean.includes("qa") || clean.includes("test")) {
    return "qa_tester";
  }
  if (clean.includes("sale") || clean.includes("acquisition")) {
    return "sales";
  }
  if (clean.includes("support") || clean.includes("helpdesk")) {
    return "support";
  }
  if (clean.includes("admin")) {
    return "admin";
  }

  return "super_admin";
}

/**
 * Check if a role is permitted to navigate to a target pathname
 */
export function isRouteAllowedForRole(roleCode: string | undefined | null, pathname: string): boolean {
  // Always allow common auth routes
  if (COMMON_OPS_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return true;
  }

  const role = normalizeRoleCode(roleCode);
  const def = ROLE_DEFINITIONS[role];

  // Super admin / Founder has unrestricted master access
  if (role === "super_admin" || def.allowedRoutePrefixes.includes("*")) {
    return true;
  }

  // Normalize path without trailing slash
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Always allow ops console base or dashboard if designated
  if (cleanPath === "/ops-console" || cleanPath === "/ops-console/dashboard") {
    return true;
  }

  // Check prefix match
  return def.allowedRoutePrefixes.some((prefix) => {
    const cleanPrefix = prefix.replace(/\/+$/, "");
    return cleanPath === cleanPrefix || cleanPath.startsWith(cleanPrefix + "/");
  });
}

/**
 * Filter an array of navigation items/sections based on a role's permissions
 */
export interface NavItemConfig {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavItemConfig[];
}

export interface NavSectionConfig {
  label: string;
  items: NavItemConfig[];
}

export function filterNavSectionsForRole(
  sections: NavSectionConfig[],
  roleCode: string | undefined | null,
): NavSectionConfig[] {
  const role = normalizeRoleCode(roleCode);

  // Super Admin sees ALL sections and items
  if (role === "super_admin") {
    return sections;
  }

  return sections
    .map((section) => {
      const allowedItems = section.items
        .map((item) => {
          // If item has children, filter children as well
          if (item.children && item.children.length > 0) {
            const allowedChildren = item.children.filter((child) =>
              isRouteAllowedForRole(role, child.href)
            );
            if (allowedChildren.length > 0) {
              return {
                ...item,
                children: allowedChildren,
              };
            }
          }
          return item;
        })
        .filter((item) => isRouteAllowedForRole(role, item.href));

      return {
        ...section,
        items: allowedItems,
      };
    })
    .filter((section) => section.items.length > 0);
}

