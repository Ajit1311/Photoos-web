import MemberCard from "./MemberCard";

export default function StepThreeTeam() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold">
        Team Assignment
      </h2>

      <p className="mt-2 text-slate-500">
        Assign your team members for this event.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <MemberCard
          title="Photographer"
          placeholder="Select Photographer"
        />

        <MemberCard
          title="Cinematographer"
          placeholder="Select Cinematographer"
        />

        <MemberCard
          title="Editor"
          placeholder="Select Editor"
        />

        <MemberCard
          title="Album Designer"
          placeholder="Select Album Designer"
        />

      </div>

    </div>
  );
}