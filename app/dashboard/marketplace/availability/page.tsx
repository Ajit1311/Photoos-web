"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
} from "lucide-react";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import StudioAvailabilityCalendar from "@/components/dashboard/marketplace/StudioAvailabilityCalendar";

export default function MarketplaceAvailabilityPage() {
  const bootstrap = useBootstrapContext();

  const studioId =
    bootstrap.data?.workspace?.studio?.id ||
    "";

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 pb-10">

      <div className="flex items-center justify-between">

        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <CalendarDays size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Studio Availability
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your Marketplace availability and booked dates.
              </p>
            </div>
          </div>
        </div>

      </div>

      {studioId ? (
        <StudioAvailabilityCalendar
          studioId={studioId}
        />
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Studio information is not available.
          </p>
        </div>
      )}

    </main>
  );
}
