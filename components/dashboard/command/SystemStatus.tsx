import {
  CheckCircle2,
  Database,
  HardDrive,
  Sparkles,
  Wifi,
} from "lucide-react";

const services = [
  {
    name: "Backend API",
    icon: Database,
  },
  {
    name: "Storage",
    icon: HardDrive,
  },
  {
    name: "AI Workers",
    icon: Sparkles,
  },
  {
    name: "Realtime",
    icon: Wifi,
  },
];

export default function SystemStatus() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold">
          System Status
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          All services operational
        </p>

      </div>

      <div className="space-y-4">

        {services.map((service) => {

          const Icon = service.icon;

          return (

            <div
              key={service.name}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
            >

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-[#0A3F61]/10 p-2 text-[#0A3F61]">

                  <Icon size={18} />

                </div>

                <span className="font-medium">
                  {service.name}
                </span>

              </div>

              <div className="flex items-center gap-2 text-green-600">

                <CheckCircle2 size={18} />

                <span className="text-sm font-medium">
                  Online
                </span>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}