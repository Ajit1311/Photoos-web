"use client";

import {
  CalendarClock,
  Download,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function PublishGalleryCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-[#0A3F61]/10 p-3">

            <Sparkles
              size={22}
              className="text-[#0A3F61]"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold">
              Publish Gallery
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure delivery settings before publishing.
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-5 p-6">

        <SettingRow
          icon={<Globe size={18} />}
          title="Visibility"
          value="Public Gallery"
        />

        <SettingRow
          icon={<Download size={18} />}
          title="Downloads"
          value="Allowed"
        />

        <SettingRow
          icon={<ShieldCheck size={18} />}
          title="Watermark"
          value="Disabled"
        />

        <SettingRow
          icon={<Lock size={18} />}
          title="PIN Protection"
          value="Not Required"
        />

        <SettingRow
          icon={<CalendarClock size={18} />}
          title="Expiry"
          value="30 Days"
        />

      </div>

      <div className="border-t border-slate-100 p-6">

        <button className="w-full rounded-2xl bg-[#0A3F61] py-4 text-lg font-semibold text-white transition hover:bg-[#14557F]">

          Publish Gallery

        </button>

      </div>

    </section>
  );
}

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function SettingRow({
  icon,
  title,
  value,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

          {icon}

        </div>

        <span className="font-medium">

          {title}

        </span>

      </div>

      <span className="text-sm font-semibold text-slate-600">

        {value}

      </span>

    </div>
  );
}