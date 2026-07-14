import {
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";

const steps = [
  {
    title: "Event Created",
    description: "Basic event setup completed",
    status: "completed",
  },
  {
    title: "Photos Uploaded",
    description: "12,482 photos uploaded",
    status: "completed",
  },
  {
    title: "AI Processing",
    description: "Face recognition completed",
    status: "completed",
  },
  {
    title: "Gallery Published",
    description: "Client gallery is live",
    status: "active",
  },
  {
    title: "Album Design",
    description: "Waiting for client selection",
    status: "pending",
  },
  {
    title: "Final Delivery",
    description: "Pending",
    status: "pending",
  },
];

function StatusIcon(status: string) {
  if (status === "completed") {
    return (
      <div className="rounded-full bg-green-100 p-2 text-green-600">
        <CheckCircle2 size={18} />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="rounded-full bg-[#0A3F61]/10 p-2 text-[#0A3F61]">
        <Clock3 size={18} />
      </div>
    );
  }

  return (
    <div className="rounded-full bg-slate-100 p-2 text-slate-400">
      <Circle size={18} />
    </div>
  );
}

export default function EventProgress() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <h2 className="text-2xl font-bold text-slate-900">
          Event Progress
        </h2>

        <p className="mt-2 text-slate-500">
          Current workflow status of this event.
        </p>

      </div>

      <div className="space-y-6 p-6">

        {steps.map((step, index) => (

          <div
            key={step.title}
            className="flex gap-5"
          >

            <div className="flex flex-col items-center">

              {StatusIcon(step.status)}

              {index !== steps.length - 1 && (
                <div className="mt-2 h-12 w-px bg-slate-200" />
              )}

            </div>

            <div className="flex-1 pb-4">

              <h3 className="font-semibold text-slate-900">
                {step.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {step.description}
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}