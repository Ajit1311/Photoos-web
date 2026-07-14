"use client";

import {
  CheckCircle2,
  User,
} from "lucide-react";

type Props = {
  id: string;

  name: string;

  role: string;

  email?: string | null;

  active?: boolean;

  onSelect?: (
    id: string,
  ) => void;
};

export default function MemberCard({
  id,
  name,
  role,
  email,
  active = false,
  onSelect,
}: Props) {

  return (

    <button
      type="button"
      onClick={() => onSelect?.(id)}
      className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
        active
          ? "border-[#0A3F61] bg-[#0A3F61]/5"
          : "border-slate-200 hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
      }`}
    >

      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A3F61]/10">

          <User
            size={22}
            className="text-[#0A3F61]"
          />

        </div>

        <div>

          <h3 className="font-semibold text-slate-900">
            {name}
          </h3>

          <p className="text-sm text-slate-500">
            {role}
          </p>

          {email && (

            <p className="mt-1 text-xs text-slate-400">
              {email}
            </p>

          )}

        </div>

      </div>

      <CheckCircle2
        size={22}
        className={
          active
            ? "text-[#0A3F61]"
            : "text-slate-300"
        }
      />

    </button>

  );

}