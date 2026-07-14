"use client";
import { useEventWizard } from "@/context/EventWizardContext";

export default function StepOneBasicDetails() {
  // Component च्या स्टार्टिंगला context डेटा आणि setField मेथड ॲड केली आहे
  const { data, setField } = useEventWizard();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        Basic Details
      </h2>

      <p className="mt-2 text-slate-500">
        Enter the primary information about the event.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Event Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Name
          </label>
          <input
            value={data.title}
            onChange={(e) => setField("title", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3 outline-none focus:border-[#0A3F61]"
            placeholder="Rahul & Priya Wedding"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Type
          </label>
          <select
            value={data.eventType}
            onChange={(e) => setField("eventType", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3"
          >
            <option value="Wedding">Wedding</option>
            <option value="Pre Wedding">Pre Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>

        {/* Event Date */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Date
          </label>
          <input
            type="date"
            value={data.eventDate}
            onChange={(e) => setField("eventDate", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3"
          />
        </div>

        {/* Event Time */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Event Time
          </label>
          <input
            type="time"
            value={data.eventTime}
            onChange={(e) => setField("eventTime", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3"
          />
        </div>

        {/* Venue */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Venue
          </label>
          <input
            value={data.venue}
            onChange={(e) => setField("venue", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3"
            placeholder="Event Venue"
          />
        </div>
      </div>
    </div>
  );
}