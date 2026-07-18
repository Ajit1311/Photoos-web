"use client";

import { BadgeCheck, CalendarDays, Camera, MapPin, User } from "lucide-react";
import { useCurrentEvent } from "@/hooks/useCurrentEvent";

export default function EventHero() {
  const { event } = useCurrentEvent();

  // जर इव्हेंटचा डेटा अजून लोड होत असेल, तर क्रॅश न होता डमी/फॉलबॅक डेटा दाखवून UI स्थिर ठेवणे
  const title = event?.title || "Loading Event Title...";
  const statusLabel = event?.status 
    ? event.status.charAt(0).toUpperCase() + event.status.slice(1) 
    : "Active";
  const clientName = event?.client?.name || "Loading...";
  const eventDate = event?.date || "TBD";
  const eventVenue = event?.venue || "TBD";
  
  const totalPhotos = event?.gallery?.totalPhotos?.toLocaleString() || "0";
  const aiFaces = event?.gallery?.favorites?.toLocaleString() || "0";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-6 xl:flex-row xl:items-center xl:justify-between">
        
        <div className="flex-1">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <BadgeCheck size={14} />
            {statusLabel}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <InfoItem icon={<User size={16} />} title="Client" value={clientName} />
            <InfoItem icon={<Camera size={16} />} title="Photographer" value="Akshay" />
            <InfoItem icon={<CalendarDays size={16} />} title="Date" value={eventDate} />
            <InfoItem icon={<MapPin size={16} />} title="Venue" value={eventVenue} />
          </div>
        </div>

        {/* Live Metrics: कधीही न लपणारे काउंटर कार्ड्स */}
        <div className="grid min-w-[300px] grid-cols-2 gap-3">
          <StatCard title="Total Photos" value={totalPhotos} className="bg-[#0A3F61] text-white" />
          <StatCard title="AI Faces" value={aiFaces} className="bg-emerald-600 text-white" />
        </div>

      </div>
    </section>
  );
}

function InfoItem({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[#0A3F61]">{icon}</div>
      <div>
        <p className="text-[10px] uppercase text-slate-400 font-medium">{title}</p>
        <p className="text-xs font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, className }: { title: string; value: string; className: string }) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <p className="text-xs opacity-80 font-medium">{title}</p>
      <h2 className="mt-1 text-xl font-bold">{value}</h2>
    </div>
  );
}