"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Construction,
  ShieldCheck,
} from "lucide-react";

import { useParams } from "next/navigation";

function titleFromSlug(
  slug: string[],
) {
  return slug
    .join(" / ")
    .split("/")
    .map(
      (part) =>
        part
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
          ),
    )
    .join(" / ");
}

export default function AdminModulePage() {
  const params =
    useParams<{
      slug: string[];
    }>();

  const title = titleFromSlug(
    params.slug ?? [],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A3F61]/8 text-[#0A3F61]">
            <Construction className="h-6 w-6" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin module registered
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            This module is part of the PhotoOS
            Platform Administration workspace.
            The production data table, actions,
            permissions and backend integration
            will be connected in the module build.
          </p>

          <Link
            href="/admin"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
