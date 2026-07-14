"use client";

import {
  BookOpen,
  FileImage,
  Layers3,
  Ruler,
  Settings2,
} from "lucide-react";

const properties = [
  {
    icon: BookOpen,
    label: "Album Size",
    value: "12 × 36 in",
  },
  {
    icon: Layers3,
    label: "Layout",
    value: "Classic Wedding",
  },
  {
    icon: FileImage,
    label: "Photos",
    value: "248 Selected",
  },
  {
    icon: Ruler,
    label: "Bleed",
    value: "3 mm",
  },
];

export default function AlbumProperties() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-center gap-3">

          <Settings2 className="text-[#0A3F61]" size={20} />

          <h2 className="text-lg font-bold">
            Album Properties
          </h2>

        </div>

      </div>

      <div className="space-y-4 p-5">

        {properties.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 p-4"
            >

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                  <Icon size={18} />

                </div>

                <div>

                  <p className="text-xs uppercase text-slate-400">

                    {item.label}

                  </p>

                  <h3 className="font-semibold text-slate-900">

                    {item.value}

                  </h3>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}