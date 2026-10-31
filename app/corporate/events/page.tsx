"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { CorporateShell } from "@/components/corporate/CorporateShell";
import {
  getCorporateCompany,
  getCorporateEvents,
  type CorporateCompany,
  type CorporateEvent,
} from "@/lib/corporate/corporate-service";

export default function CorporateEventsListPage() {
  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const comp = await getCorporateCompany();
      setCompany(comp);
      const evs = await getCorporateEvents(comp.id);
      setEvents(evs);
      setLoading(false);
    }
    void load();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      selectedType === "all" || ev.event_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <CorporateShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Corporate Events & Live Galleries
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Create and manage all your office events, upload candid photos, and configure AI face matching.
            </p>
          </div>

          <Link
            href="/corporate/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#072c44] transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Create Corporate Event
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title or office venue..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Event Types</option>
            <option value="Annual Day">Annual Day</option>
            <option value="Townhall">Townhall</option>
            <option value="Offsite / Retreat">Offsite / Retreat</option>
            <option value="Festive Celebration">Festive Celebration</option>
            <option value="Conference">Conference</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all flex flex-col justify-between"
            >
              <Link href={`/corporate/events/${ev.id}`} className="block">
                {/* Event Image */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {ev.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ev.cover_image_url}
                      alt={ev.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <CalendarDays className="h-10 w-10" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-slate-200 border border-white/10">
                      {ev.event_type}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-md bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white border border-white/10">
                      {ev.photos_count} Photos
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <span className="text-[11px] font-medium text-slate-400">
                    {ev.date}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#0A3F61] dark:group-hover:text-slate-200 transition-colors line-clamp-1">
                    {ev.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{ev.location}</span>
                  </p>
                  {ev.description && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {ev.description}
                    </p>
                  )}
                </div>
              </Link>

              {/* Event Actions Footer */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/corporate/events/${ev.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0A3F61] py-2 text-xs font-semibold text-white hover:bg-[#072c44] shadow-xs transition-all"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Manage & Upload
                </Link>

                <Link
                  href={`/corporate/events/${ev.id}?tab=qrcode`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs transition-colors"
                  title="View Standee QR"
                >
                  <QrCode className="h-3.5 w-3.5 text-slate-500" />
                  QR
                </Link>

                <Link
                  href={`/gallery/${ev.id}/access`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-xs transition-colors"
                  title="Open Mobile Employee View"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CorporateShell>
  );
}

