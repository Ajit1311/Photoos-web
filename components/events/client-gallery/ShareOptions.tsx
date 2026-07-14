"use client";

import {
  Copy,
  Link2,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";

const options = [
  {
    title: "Copy Link",
    description: "Copy gallery URL",
    icon: Copy,
  },
  {
    title: "WhatsApp",
    description: "Share instantly",
    icon: MessageCircle,
  },
  {
    title: "Email",
    description: "Send invitation",
    icon: Mail,
  },
  {
    title: "Short URL",
    description: "Generate short link",
    icon: Link2,
  },
];

export default function ShareOptions() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-center gap-3">

          <Share2
            size={20}
            className="text-[#0A3F61]"
          />

          <div>

            <h2 className="text-xl font-bold">
              Share Gallery
            </h2>

            <p className="text-sm text-slate-500">
              Deliver gallery to your client.
            </p>

          </div>

        </div>

      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">

        {options.map((option) => {

          const Icon = option.icon;

          return (

            <button
              key={option.title}
              className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A3F61]/10">

                <Icon
                  size={22}
                  className="text-[#0A3F61]"
                />

              </div>

              <h3 className="font-semibold text-slate-900">
                {option.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {option.description}
              </p>

            </button>

          );

        })}

      </div>

    </section>
  );
}