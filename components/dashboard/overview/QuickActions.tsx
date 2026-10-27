import Link from "next/link";

import {
  ArrowRight,
  CalendarPlus,
  UserPlus,
} from "lucide-react";


const actions = [
  {
    title: "Create Event",

    description:
      "Start a new photography event",

    href:
      "/dashboard/events/create",

    icon:
      CalendarPlus,
  },

  {
    title: "Create Client",

    description:
      "Add a new client",

    href:
      "/dashboard/clients/create",

    icon:
      UserPlus,
  },
];


export default function QuickActions() {

  return (

    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <h2 className="text-2xl font-bold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-2 text-slate-500">
          Create new records for your studio.
        </p>

      </div>


      <div className="space-y-5 p-6">

        {
          actions.map(
            (
              action,
            ) => {

              const Icon =
                action.icon;


              return (

                <Link
                  key={
                    action.title
                  }
                  href={
                    action.href
                  }
                  className="group flex w-full items-center justify-between rounded-2xl bg-[#0A3F61] p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#14557F] hover:shadow-xl"
                >

                  <div className="flex items-center gap-4">

                    <div className="rounded-2xl bg-white/15 p-3">

                      <Icon
                        size={22}
                      />

                    </div>


                    <div className="text-left">

                      <h3 className="text-lg font-semibold">

                        {action.title}

                      </h3>


                      <p className="mt-1 text-sm text-white/80">

                        {action.description}

                      </p>

                    </div>

                  </div>


                  <ArrowRight
                    size={20}
                    className="transition group-hover:translate-x-1"
                  />

                </Link>

              );

            },
          )
        }

      </div>

    </section>

  );

}
