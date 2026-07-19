"use client";

import {
  Upload,
  QrCode,
  Sparkles,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GalleryQuickActions() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Quick Actions
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Frequently used gallery actions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <Button className="justify-start">
          <Upload className="mr-2 h-4 w-4" />
          Upload Photos
        </Button>

        <Button
          variant="outline"
          className="justify-start"
        >
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR
        </Button>

        <Button
          variant="outline"
          className="justify-start"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Processing
        </Button>

        <Button
          variant="outline"
          className="justify-start"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Publish Gallery
        </Button>

      </div>
    </div>
  );
}