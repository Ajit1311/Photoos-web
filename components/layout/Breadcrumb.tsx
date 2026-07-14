"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">

      <Link
        href="/dashboard"
        className="hover:text-[#0A3F61]"
      >
        Dashboard
      </Link>

      {/* इथे index काढून फक्त segment ठेवला आहे */}
      {segments.slice(1).map((segment) => (

        <div
          key={segment} // segment स्वतः unique key म्हणून काम करेल
          className="flex items-center gap-2"
        >

          <ChevronRight size={14} />

          <span className="capitalize">

            {segment.replace(/-/g, " ")}

          </span>

        </div>

      ))}

    </div>
  );
}