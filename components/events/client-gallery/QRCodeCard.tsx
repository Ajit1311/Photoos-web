"use client";

import {
  Copy,
  Download,
  QrCode,
  Share2,
} from "lucide-react";

export default function QRCodeCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-center gap-3">

          <QrCode
            size={22}
            className="text-[#0A3F61]"
          />

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              QR Code
            </h2>

            <p className="text-sm text-slate-500">
              Scan to open the client gallery.
            </p>

          </div>

        </div>

      </div>

      <div className="flex flex-col items-center p-8">

        <div className="flex h-64 w-64 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100">

          <QrCode
            size={140}
            className="text-slate-400"
          />

        </div>

        <div className="mt-6 w-full rounded-2xl bg-slate-100 p-4 text-center text-sm text-slate-600">

          https://photoos.app/g/rahul-priya

        </div>

      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-slate-100 p-5">

        <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 hover:bg-slate-100">

          <Copy size={18} />

          Copy

        </button>

        <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 hover:bg-slate-100">

          <Share2 size={18} />

          Share

        </button>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-white hover:bg-[#14557F]">

          <Download size={18} />

          Save

        </button>

      </div>

    </section>
  );
}