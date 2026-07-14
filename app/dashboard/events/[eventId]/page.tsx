import EventQuickActions from "@/components/events/actions/EventQuickActions";
import EventHero from "@/components/events/hero/EventHero";
import EventOverviewWorkspace from "@/components/events/overview/EventOverviewWorkspace";
import EventProgress from "@/components/events/progress/EventProgress";
import EventTabs from "@/components/events/tabs/EventTabs";
import { EventProvider } from "@/context/EventContext";

type EventDetailsPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { eventId } = await params;

  return (
    <EventProvider eventId={eventId}>
      <main className="space-y-8">

        <EventHero />

        <div className="grid gap-6 xl:grid-cols-3">

          <div className="space-y-6 xl:col-span-2">

            <EventOverviewWorkspace />

            <EventProgress />

          </div>

          <EventQuickActions />

        </div>

        <EventTabs />

      </main>
    </EventProvider>
  );
}