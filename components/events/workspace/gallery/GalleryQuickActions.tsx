"use client";

import {
  QrCode,
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

      <Button
        variant="outline"
        className="w-full justify-center"
        type="button"
      >
        <QrCode className="mr-2 h-4 w-4" />
        Generate QR
      </Button>
    </div>
  );
}