import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const projects = [
  {
    event: "Rahul & Priya Wedding",
    client: "Rahul Patil",
    status: "AI Processing",
    progress: 65,
  },
  {
    event: "ABC Industries",
    client: "ABC Pvt Ltd",
    status: "Gallery Ready",
    progress: 85,
  },
  {
    event: "Sneha Birthday",
    client: "Sneha Kulkarni",
    status: "Album Design",
    progress: 40,
  },
  {
    event: "Patil Family Shoot",
    client: "Patil Family",
    status: "Delivery Pending",
    progress: 95,
  },
];

export default function ActiveProjects() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Active Projects
          </h2>

          <p className="mt-2 text-slate-500">
            Currently running photography projects.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-50">

          View All

          <ChevronRight size={16} />

        </button>

      </div>

      <div className="space-y-5">

        {projects.map((project) => (

          <div
            key={project.event}
            className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#0A3F61]/20 hover:shadow-md"
          >

            <div className="flex items-start justify-between">

              <div>

                <h3 className="font-semibold text-slate-900">
                  {project.event}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {project.client}
                </p>

              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#0A3F61]/10 px-3 py-2 text-sm text-[#0A3F61]">

                <CalendarDays size={16} />

                {project.status}

              </div>

            </div>

            <div className="mt-5">

              <div className="mb-2 flex justify-between">

                <span className="text-sm text-slate-500">
                  Progress
                </span>

                <span className="font-semibold text-slate-700">
                  {project.progress}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-[#0A3F61]"
                  style={{
                    width: `${project.progress}%`,
                  }}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}