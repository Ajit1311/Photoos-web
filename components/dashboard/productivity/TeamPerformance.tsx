const members = [
  {
    name: "Rahul",
    role: "Photographer",
    score: 96,
  },
  {
    name: "Akshay",
    role: "Editor",
    score: 92,
  },
  {
    name: "Sneha",
    role: "Album Designer",
    score: 88,
  },
];

export default function TeamPerformance() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold">
        Team Performance
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Today's productivity score
      </p>

      <div className="mt-6 space-y-5">

        {members.map((member) => (

          <div key={member.name}>

            <div className="mb-2 flex items-center justify-between">

              <div>

                <h3 className="font-semibold">
                  {member.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {member.role}
                </p>

              </div>

              <span className="font-bold text-[#0A3F61]">
                {member.score}%
              </span>

            </div>

            <div className="h-2 rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0A3F61] to-[#3495A1]"
                style={{
                  width: `${member.score}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}