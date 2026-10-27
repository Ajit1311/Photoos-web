"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  title: string;
  icon: React.ElementType;
};

export default function SidebarItem({
  href,
  title,
  icon: Icon,
}: Props) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#1F70B8] via-[#1686B4] to-[#3495A1] text-white shadow-[0_6px_18px_rgba(31,112,184,0.28)] ring-1 ring-white/15"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={21} strokeWidth={1.9} />

      <span className="font-medium">
        {title}
      </span>

    </Link>
  );
}