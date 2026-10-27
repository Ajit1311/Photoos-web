"use client";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AlbumWorkspace from "@/components/events/albums/AlbumWorkspace";

export default function AlbumDetailsPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const albumId =
    typeof params.albumId ===
    "string"
      ? params.albumId
      : "";

  if (!albumId) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">

        <p className="text-sm text-slate-500">
          Album not found.
        </p>

      </main>
    );
  }

  return (
    <main className="min-h-0 flex-1 bg-[#f8fafc]">

      <div className="mx-auto w-full max-w-[1800px] px-6 py-5">

        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/albums",
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Albums
          </button>

        </div>

        <AlbumWorkspace
          albumId={albumId}
        />

      </div>

    </main>
  );
}