"use client";

import {
  ExternalLink,
  Globe,
  QrCode,
  Share2,
} from "lucide-react";

export default function ClientGalleryHeader() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-6 p-6 xl:flex-row xl:items-center xl:justify-between">

        <div>

          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

            <Globe size={16} />

            Gallery Published

          </div>

          <h1 className="mt-5 text-4xl font-bold text-slate-900">
            Client Gallery
          </h1>

          <p className="mt-2 text-slate-500">
            Share your gallery with clients using a secure public link or QR code.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 hover:bg-slate-100">

            <QrCode size={18} />

            QR Code

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 hover:bg-slate-100">

            <Share2 size={18} />

            Share

          </button>

          <button className="flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-white hover:bg-[#14557F]">

            <ExternalLink size={18} />

            Open Gallery

          </button>

        </div>

      </div>

    </section>
  );
}