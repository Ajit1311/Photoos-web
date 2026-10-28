"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

type Props = {
  href: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  locked?: boolean;
};

export default function SidebarItem({
  href,
  title,
  icon: Icon,
  badge,
  locked = false,
}: Props) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#1F70B8] via-[#1686B4] to-[#3495A1] text-white shadow-[0_6px_18px_rgba(31,112,184,0.28)] ring-1 ring-white/15"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={21} strokeWidth={1.9} className="shrink-0" />
        <span className="truncate font-medium">
          {title}
        </span>
      </div>

      {badge ? (
        <span className="ml-2 inline-flex items-center rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          {badge}
        </span>
      ) : locked ? (
        <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
          <Lock className="h-2.5 w-2.5" />
          PRO
        </span>
      ) : null}
    </Link>
  );
}
