"use client";

// Next.js Image component import
import NextImage from "next/image";

import {
  Camera,
  CalendarDays,
  Download,
  HardDrive,
  Image as ImageIcon,
  MapPin,
  MoreHorizontal,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";

export default function PhotoDetails() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Photo Details
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              IMG_004281.CR3
            </p>

          </div>

          <button className="rounded-xl border border-slate-200 p-3 hover:bg-slate-100">

            <MoreHorizontal size={18} />

          </button>

        </div>

      </div>

      <div className="space-y-6 p-6">

        {/* Preview */}

        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          {/* Standard image tag */}
<img
  src="https://picsum.photos/700"
  alt="Photo preview"
  className="w-full h-full object-cover"
/>
        </div>

        {/* Rating */}

        <div>

          <p className="mb-3 text-sm font-semibold text-slate-500">
            Rating
          </p>

          <div className="flex gap-1">

            {Array.from({ length: 5 }).map((_, index) => (

              <Star
                key={index}
                size={18}
                className="fill-yellow-400 text-yellow-400"
              />

            ))}

          </div>

        </div>

        {/* Details */}

        <div className="space-y-4">

          <InfoRow
            icon={<Camera size={18} />}
            label="Camera"
            value="Canon R6 Mark II"
          />

          <InfoRow
            icon={<ImageIcon size={18} />}
            label="Resolution"
            value="6000 × 4000"
          />

          <InfoRow
            icon={<HardDrive size={18} />}
            label="File Size"
            value="34.8 MB"
          />

          <InfoRow
            icon={<CalendarDays size={18} />}
            label="Captured"
            value="09 Jul 2026"
          />

          <InfoRow
            icon={<MapPin size={18} />}
            label="Location"
            value="Kolhapur"
          />

        </div>

        {/* AI */}

        <div className="rounded-2xl bg-[#0A3F61]/5 p-5">

          <div className="flex items-center gap-3">

            <Sparkles className="text-[#0A3F61]" size={20} />

            <h3 className="font-semibold text-[#0A3F61]">
              AI Analysis
            </h3>

          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-600">
                Faces Detected
              </span>

              <span className="font-semibold">
                4
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-600">
                Eyes Open
              </span>

              <span className="font-semibold text-green-600">
                Yes
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-600">
                Blur Score
              </span>

              <span className="font-semibold">
                2%
              </span>

            </div>

          </div>

        </div>

        {/* People */}

        <div>

          <h3 className="mb-4 font-semibold text-slate-900">
            People
          </h3>

          <div className="flex flex-wrap gap-3">

            {["Rahul", "Priya", "Guest 1", "Guest 2"].map((person) => (

              <div
                key={person}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
              >

                <UserRound size={16} />

                <span className="text-sm">
                  {person}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 p-6">

        <div className="grid grid-cols-2 gap-3">

          <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] py-3 font-medium text-white hover:bg-[#14557F]">

            <Download size={18} />

            Download

          </button>

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 py-3 font-medium text-red-600 hover:bg-red-50">

            <Trash2 size={18} />

            Delete

          </button>

        </div>

      </div>

    </aside>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <div className="text-[#0A3F61]">
          {icon}
        </div>

        <span className="text-sm text-slate-600">
          {label}
        </span>

      </div>

      <span className="font-medium text-slate-900">
        {value}
      </span>

    </div>
  );
}