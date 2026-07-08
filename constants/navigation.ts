import {
  LayoutDashboard,
  Images,
  FolderOpen,
  Users,
  Sparkles,
  Workflow,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: Images,
  },
  {
    title: "Galleries",
    href: "/galleries",
    icon: FolderOpen,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "AI",
    href: "/ai",
    icon: Sparkles,
  },
  {
    title: "Workflows",
    href: "/workflows",
    icon: Workflow,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];