import EventStats from "@/components/events/EventStats";
import EventFilters from "@/components/events/EventFilters";
import EventTable from "@/components/events/EventTable";


export default function EventsPage() {
    return (
        <main className="space-y-8">

            <section>

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0A3F61]">
                    Event Management
                </p>

                <h1 className="mt-2 text-4xl font-bold text-slate-900">
                    Events
                </h1>

                <p className="mt-3 text-slate-500">
                    Manage bookings, galleries, payments, AI processing and client delivery.
                </p>
                <p className="mt-3 text-slate-500">
                    Manage events, clients, payments, AI processing,
                    QR access, galleries and delivery from a single workspace.
                </p>

            </section>

            <EventStats />

            <EventFilters />

            <EventTable />
            

        </main>
    );
}