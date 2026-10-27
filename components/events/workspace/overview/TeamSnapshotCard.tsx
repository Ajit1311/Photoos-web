"use client";

import {
  Camera,
  Palette,
  Video,
  UserCheck,
  Users,
} from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: "assigned" | "confirmed" | "pending";
}

interface TeamSnapshotCardProps {
  members: TeamMember[];
}

export default function TeamSnapshotCard({
  members,
}: TeamSnapshotCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Team Snapshot
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Assigned Team
          </h2>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          <Users size={14} />
          {members.length} Member{members.length !== 1 ? "s" : ""}
        </span>

      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">

          <Users
            size={40}
            className="text-slate-400"
          />

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No Team Assigned
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Assign photographers, videographers and designers to this event.
          </p>

        </div>
      ) : (
        <div className="mt-6 space-y-3 max-h-80 overflow-y-auto">

          {members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
            />
          ))}

        </div>
      )}

    </div>
  );
}

interface TeamMemberRowProps {
  member: TeamMember;
}

function TeamMemberRow({
  member,
}: TeamMemberRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-full bg-slate-100 p-2">
          {getRoleIcon(member.role)}
        </div>

        <div>
          <p className="font-medium text-slate-900">
            {member.name}
          </p>

          <p className="text-sm text-slate-500">
            {member.role}
          </p>
        </div>

      </div>

      <StatusBadge
        status={member.status}
      />

    </div>
  );
}

interface StatusBadgeProps {
  status: TeamMember["status"];
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  switch (status) {
    case "confirmed":
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Confirmed
        </span>
      );

    case "pending":
      return (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Pending
        </span>
      );

    default:
      return (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Assigned
        </span>
      );
  }
}

function getRoleIcon(role: string) {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes("photographer")) {
    return (
      <Camera
        size={18}
        className="text-slate-600"
      />
    );
  }

  if (normalizedRole.includes("videographer")) {
    return (
      <Video
        size={18}
        className="text-slate-600"
      />
    );
  }

  if (normalizedRole.includes("designer")) {
    return (
      <Palette
        size={18}
        className="text-slate-600"
      />
    );
  }

  return (
    <UserCheck
      size={18}
      className="text-slate-600"
    />
  );
}