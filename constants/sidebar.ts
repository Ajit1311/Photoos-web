import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Image,
  BookOpen,
  FolderOpen,
  Sparkles,
  CreditCard,
  UsersRound,
  BarChart3,
  Settings,
} from "lucide-react";

export const sidebar = [
  {
    group: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    group: "Business",
    items: [
      {
        title: "Events",
        href: "/dashboard/events",
        icon: CalendarDays,
      },
      {
        title: "Clients",
        href: "/dashboard/clients",
        icon: Users,
      },
      {
        title: "Galleries",
        href: "/dashboard/galleries",
        icon: Image,
      },
      {
        title: "Albums",
        href: "/dashboard/albums",
        icon: BookOpen,
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
      },
      {
        title: "AI Processing",
        href: "/dashboard/ai",
        icon: Sparkles,
      },
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
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
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
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
];