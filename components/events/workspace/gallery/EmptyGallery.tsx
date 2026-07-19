"use client";

import { Images, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyGalleryProps {
  title?: string;
  description?: string;
  showUploadButton?: boolean;
  onUpload?: () => void;
}

export default function EmptyGallery({
  title = "No Photos Available",
  description = "Upload photos to start building this gallery.",
  showUploadButton = true,
  onUpload,
}: EmptyGalleryProps) {
  return (
    <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
      <div className="max-w-md text-center">
        {/* Icon */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Images className="h-10 w-10 text-slate-500" />
        </div>

        {/* Title */}

        <h2 className="mt-6 text-2xl font-semibold text-slate-900">
          {title}
        </h2>

        {/* Description */}

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>

        {/* Action */}

        {showUploadButton && (
          <Button
            className="mt-8"
            onClick={onUpload}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Photos
          </Button>
        )}
      </div>
    </div>
  );
}