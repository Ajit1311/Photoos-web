import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  Crown,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  ShoppingBag,
  Settings,
  Sparkles,
  ArrowUpCircle,
  Users,
  UsersRound,
} from "lucide-react";


export type SidebarItemConfig = {
  title: string;
  href: string;
  icon: React.ElementType;
  requiresPlatformAdmin?: boolean;
  requiredFeature?: string;
};


export type SidebarGroupConfig = {
  group: string;
  requiresPlatformAdmin?: boolean;
  items: SidebarItemConfig[];
};


export const sidebar: SidebarGroupConfig[] = [
  {
    group: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        requiredFeature: "dashboard",
      },
    ],
  },

  {
    group: "Business",
    items: [
      {
        title: "Clients",
        href: "/dashboard/clients",
        icon: Users,
        requiredFeature: "crm",
      },
      {
        title: "Projects",
        href: "/dashboard/projects",
        icon: FolderOpen,
        requiredFeature: "projects",
      },
      {
        title: "Events",
        href: "/dashboard/events",
        icon: CalendarDays,
        requiredFeature: "events",
      },
      
      {
        title: "Chat",
        href: "/dashboard/chat",
        icon: MessageSquare,
        requiredFeature: "chat",
      },
      {
        title: "Albums",
        href: "/dashboard/albums",
        icon: BookOpen,
        requiredFeature: "gallery",
      },
    ],
  },

  {
    group: "Operations",
    items: [
      {
        title: "Assets",
        href: "/dashboard/assets",
        icon: FolderOpen,
        requiredFeature: "gallery",
      },
      {
        title: "AI Processing",
        href: "/dashboard/ai",
        icon: Sparkles,
        requiredFeature: "ai_features",
      },
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
        requiredFeature: "dashboard",
      },
    ],
  },

  {
    group: "Growth",
    items: [
      {
        title: "Marketing",
        href: "/dashboard/marketing",
        icon: Megaphone,
        requiredFeature: "automation",
      },
      {
        title: "Marketplace",
        href: "/dashboard/marketplace/leads",
        icon: ShoppingBag,
        requiredFeature: "dashboard",
      },
    ],
  },

  {
    group: "Management",
    items: [
      {
        title: "Team",
        href: "/dashboard/team",
        icon: UsersRound,
        requiredFeature: "dashboard",
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        requiredFeature: "reports",
      },
    ],
  },

  {
    group: "Settings",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },

  {
    group: "Subscription",
    items: [
      {
        title: "Upgrade Plan",
        href: "/dashboard/subscription-plans",
        icon: ArrowUpCircle,
      },
    ],
  },

  {
    group: "Platform",
    requiresPlatformAdmin: true,
    items: [
      {
        title: "Platform Admin",
        href: "/dashboard/admin",
        icon: Crown,
        requiresPlatformAdmin: true,
      },
    ],
  },
];
