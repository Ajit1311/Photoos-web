"use client";

import {
  CalendarDays,
  Download,
  Heart,
  Image as ImageIcon,
  MapPin,
  User,
} from "lucide-react";

import { useCurrentEvent } from "@/hooks/useCurrentEvent";

export default function EventOverviewWorkspace() {
  const { event, loading } = useCurrentEvent();

  if (loading || !event) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-slate-500">Loading event overview...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">

      {/* Event Summary */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <h2 className="text-2xl font-bold text-slate-900">
            Event Overview
          </h2>

          <p className="mt-2 text-slate-500">
            Current event summary and statistics.
          </p>

        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">

          <InfoCard
            icon={<User size={18} />}
            title="Client"
            value={event.client.name}
          />

          <InfoCard
            icon={<CalendarDays size={18} />}
            title="Event Date"
            value={event.date}
          />

          <InfoCard
            icon={<MapPin size={18} />}
            title="Venue"
            value={event.venue}
          />

          <InfoCard
            icon={<ImageIcon size={18} />}
            title="Status"
            value={event.status}
          />

        </div>

      </div>

      {/* Gallery Analytics */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Photos"
          value={event.gallery.totalPhotos.toLocaleString()}
          icon={<ImageIcon size={20} />}
        />

        <StatCard
          title="Published"
          value={event.gallery.publishedPhotos.toLocaleString()}
          icon={<ImageIcon size={20} />}
        />

        <StatCard
          title="Favorites"
          value={event.gallery.favorites.toLocaleString()}
          icon={<Heart size={20} />}
        />

        <StatCard
          title="Downloads"
          value={event.gallery.downloads.toLocaleString()}
          icon={<Download size={20} />}
        />

      </div>

    </section>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function InfoCard({
  icon,
  title,
  value,
}: InfoCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5">

      <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
        {icon}
      </div>

      <div>

        <p className="text-xs uppercase text-slate-400">
          {title}
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {value}
        </p>

      </div>

    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
};

function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="inline-flex rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </h3>

    </div>
  );
}