"use client";

import {
  Download,
  Eye,
  Heart,
  Image,
} from "lucide-react";

const stats = [
  {
    title: "Published Photos",
    value: "4,826",
    icon: Image,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Gallery Views",
    value: "12,482",
    icon: Eye,
    color: "bg-green-50 text-green-700",
  },
  {
    title: "Favorites",
    value: "438",
    icon: Heart,
    color: "bg-pink-50 text-pink-700",
  },
  {
    title: "Downloads",
    value: "1,287",
    icon: Download,
    color: "bg-orange-50 text-orange-700",
  },
];

export default function ClientGalleryStats() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className={`inline-flex rounded-2xl p-3 ${item.color}`}>

              <Icon size={22} />

            </div>

            <p className="mt-5 text-sm text-slate-500">

              {item.title}

            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">

              {item.value}

            </h2>

          </div>

        );

      })}

    </section>
  );
}