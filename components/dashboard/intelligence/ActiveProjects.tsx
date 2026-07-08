const projects = [
  {
    name: "Rahul Wedding",
    progress: 82,
  },
  {
    name: "Corporate Shoot",
    progress: 58,
  },
  {
    name: "Birthday Album",
    progress: 96,
  },
];

export default function ActiveProjects() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold">
        Active Projects
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Current production status
      </p>

      <div className="mt-6 space-y-5">

        {projects.map((project) => (

          <div key={project.name}>

            <div className="mb-2 flex items-center justify-between">

              <span className="font-medium">
                {project.name}
              </span>

              <span className="text-[#0A3F61] font-semibold">
                {project.progress}%
              </span>

            </div>

            <div className="h-2 rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0A3F61] to-[#3495A1]"
                style={{
                  width: `${project.progress}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}