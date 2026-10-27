import EventWizard from "@/components/events/create/EventWizard";

type CreateProjectEventPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function CreateProjectEventPage({
  params,
}: CreateProjectEventPageProps) {

  const {
    projectId,
  } = await params;

  return (
    <main className="space-y-8">

      <section>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0A3F61]">
          Event Management
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Create Event
        </h1>

        <p className="mt-3 text-slate-500">
          Create a new event for this project.
        </p>

      </section>

      <EventWizard
        projectId={projectId}
      />

    </main>
  );
}
