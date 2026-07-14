"use client";

import {
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";

const options = [
  {
    title: "Public Gallery",
    description: "Anyone with the link can view.",
    icon: Globe,
    active: true,
  },
  {
    title: "Private Gallery",
    description: "Only invited clients can access.",
    icon: Lock,
    active: false,
  },
  {
    title: "PIN Protected",
    description: "Clients must enter a PIN.",
    icon: ShieldCheck,
    active: false,
  },
];

export default function GalleryVisibility() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <h2 className="text-xl font-bold text-slate-900">
          Gallery Visibility
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Control how clients access this gallery.
        </p>

      </div>

      <div className="space-y-4 p-5">

        {options.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.title}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                option.active
                  ? "border-[#0A3F61] bg-[#0A3F61]/5"
                  : "border-slate-200 hover:border-[#0A3F61]/30"
              }`}
            >
              <div className="flex items-start gap-4">

                <div
                  className={`rounded-xl p-3 ${
                    option.active
                      ? "bg-[#0A3F61] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div>

                  <h3 className="font-semibold text-slate-900">
                    {option.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {option.description}
                  </p>

                </div>

              </div>

            </button>
          );
        })}

      </div>

    </section>
  );
}