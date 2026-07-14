"use client";

import NextImage from "next/image";

import {
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useAlbumSession } from "@/hooks/useAlbumSession";

export default function SelectedPhotosPanel() {
  const { selectedPhotos } = useAlbumSession();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Selected Photos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ready for Album Builder
            </p>

          </div>

          <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">

            {selectedPhotos.length} Selected

          </div>

        </div>

      </div>

      {selectedPhotos.length === 0 ? (

        <div className="p-10 text-center">

          <ImageIcon
            size={40}
            className="mx-auto mb-4 text-slate-300"
          />

          <h3 className="font-semibold text-slate-900">
            No Photos Selected
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Select photos from Gallery to start building the album.
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-2 gap-3 p-5">

          {selectedPhotos.map((photo) => (

            <div
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >

              <div className="relative aspect-square">

                <NextImage
  src={photo.image}
  alt={`Selected photo ${photo.id}`}
  fill
  sizes="(max-width:768px) 50vw, 20vw"
  className="object-cover"
/>

                <div className="absolute right-2 top-2 rounded-full bg-white p-1 shadow">

                  <CheckCircle2
                    size={16}
                    className="text-green-600"
                  />

                </div>

              </div>

              <div className="truncate p-3 text-sm font-medium">

                {photo.id}

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}