"use client";

import {
  BadgeCheck,
  CalendarDays,
  Camera,
  MapPin,
  User,
} from "lucide-react";

import { useCurrentEvent } from "@/hooks/useCurrentEvent";

export default function EventHero() {
  const { event, loading } = useCurrentEvent();

  if (loading || !event) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-slate-500">Loading event...</p>
      </section>
    );
  }

  const statusLabel =
    event.status.charAt(0).toUpperCase() +
    event.status.slice(1);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-8 p-8 xl:flex-row xl:items-center xl:justify-between">

        <div className="flex-1">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

            <BadgeCheck size={16} />

            {statusLabel}

          </div>

          <h1 className="text-4xl font-bold text-slate-900">
            {event.title}
          </h1>

          <p className="mt-3 text-slate-500">
            Wedding Photography Event
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            <InfoItem
              icon={<User size={18} />}
              title="Client"
              value={event.client.name}
            />

            <InfoItem
              icon={<Camera size={18} />}
              title="Photographer"
              value="Akshay"
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              title="Event Date"
              value={event.date}
            />

            <InfoItem
              icon={<MapPin size={18} />}
              title="Venue"
              value={event.venue}
            />

          </div>

        </div>

        <div className="grid min-w-[330px] grid-cols-2 gap-4">

          <StatCard
            title="Photos"
            value={event.gallery.totalPhotos.toLocaleString()}
            className="bg-[#0A3F61] text-white"
          />

          <StatCard
            title="Published"
            value={event.gallery.publishedPhotos.toLocaleString()}
            className="bg-green-600 text-white"
          />

          <StatCard
            title="Downloads"
            value={event.gallery.downloads.toLocaleString()}
            className="bg-orange-500 text-white"
          />

          <StatCard
            title="Favorites"
            value={event.gallery.favorites.toLocaleString()}
            className="bg-purple-600 text-white"
          />

        </div>

      </div>

    </section>
  );
}

type InfoItemProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function InfoItem({
  icon,
  title,
  value,
}: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">

      <div className="text-[#0A3F61]">
        {icon}
      </div>

      <div>

        <p className="text-xs uppercase text-slate-400">
          {title}
        </p>

        <p className="font-semibold text-slate-900">
          {value}
        </p>

      </div>

    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  className: string;
};

function StatCard({
  title,
  value,
  className,
}: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}>

      <p className="text-sm opacity-80">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>

    </div>
  );
}