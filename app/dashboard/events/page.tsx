import EventStats from "@/components/events/EventStats";
import EventFilters from "@/components/events/EventFilters";

export default function EventsPage() {
  return (
    <main className="space-y-8">

      <section className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0A3F61]">
            Event Management
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Events
          </h1>

          <p className="mt-3 text-slate-500">
            Manage all photography events, clients and workflows from one place.
          </p>

        </div>

      </section>

      <EventStats />

      <EventFilters />

    </main>
  );
}