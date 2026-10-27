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
          ? "bg-[#0A3F61] text-white shadow-md"
          : "text-slate-600 hover:bg-slate-100 hover:text-[#0A3F61]"
      }`}
    >
      <Icon size={20} />

      <span className="font-medium">
        {title}
      </span>

    </Link>
  );
}