"use client";

import {
  CalendarClock,
  CheckCircle2,
  Download,
  Lock,
  ShieldCheck,
} from "lucide-react";

const settings = [
  {
    title: "PIN Protection",
    value: "Enabled",
    icon: Lock,
  },
  {
    title: "Downloads",
    value: "Allowed",
    icon: Download,
  },
  {
    title: "Watermark",
    value: "Disabled",
    icon: ShieldCheck,
  },
  {
    title: "Gallery Expiry",
    value: "30 Days",
    icon: CalendarClock,
  },
];

export default function ClientAccess() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <h2 className="text-xl font-bold">
          Client Access
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Delivery permissions and security.
        </p>

      </div>

      <div className="space-y-4 p-5">

        {settings.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
            >

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[#0A3F61]/10 p-3">

                  <Icon
                    size={18}
                    className="text-[#0A3F61]"
                  />

                </div>

                <div>

                  <h3 className="font-medium">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {item.value}
                  </p>

                </div>

              </div>

              <CheckCircle2
                size={20}
                className="text-green-600"
              />

            </div>

          );

        })}

      </div>

    </section>
  );
}