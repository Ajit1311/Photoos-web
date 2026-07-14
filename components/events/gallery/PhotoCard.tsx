"use client";

import Image from "next/image";

import {
  Camera,
  Check,
  Heart,
  MoreVertical,
  Star,
  Tag,
  UserRound,
} from "lucide-react";

import { useAlbumSession } from "@/hooks/useAlbumSession";

type PhotoCardProps = {
  id: string;
  image: string;
  selected?: boolean;
  favorite?: boolean;
  rating?: number;
  faces?: number;
  label?: "Red" | "Green" | "Blue" | "Yellow" | "Purple";
};

export default function PhotoCard({
  id,
  image,
  selected = false,
  favorite = false,
  rating = 5,
  faces = 0,
  label = "Blue",
}: PhotoCardProps) {
  const { addPhoto } = useAlbumSession();

  function labelColor() {
    switch (label) {
      case "Red":
        return "bg-red-500";

      case "Green":
        return "bg-green-500";

      case "Yellow":
        return "bg-yellow-500";

      case "Purple":
        return "bg-purple-500";

      default:
        return "bg-blue-500";
    }
  }

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3F61]/30 hover:shadow-xl">

      {/* Image */}

      <div className="relative aspect-square overflow-hidden bg-slate-100">

       <Image
  src={image}
  alt={id}
  fill
  sizes="(max-width: 768px) 100vw, 25vw"
  className="object-cover transition duration-300 group-hover:scale-105"
/>
        {/* Selection */}

        <button className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow">

          {selected ? (
            <div className="rounded bg-[#0A3F61] p-1 text-white">
              <Check size={14} />
            </div>
          ) : (
            <div className="h-4 w-4 rounded border-2 border-slate-300" />
          )}

        </button>

        {/* Favorite */}

        <button className="absolute right-4 top-4 rounded-xl bg-white p-2 shadow">

          <Heart
            size={16}
            className={
              favorite
                ? "fill-red-500 text-red-500"
                : "text-slate-400"
            }
          />

        </button>

        {/* Color Label */}

        <div
          className={`absolute bottom-4 left-4 h-3 w-12 rounded-full ${labelColor()}`}
        />

      </div>

      {/* Content */}

      <div className="space-y-4 p-5">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold text-slate-900">
            {id}
          </h3>

          <button className="rounded-lg p-2 hover:bg-slate-100">

            <MoreVertical size={18} />

          </button>

        </div>

        {/* Rating */}

        <div className="flex items-center gap-1">

          {Array.from({ length: rating }).map((_, index) => (

            <Star
              key={index}
              size={15}
              className="fill-yellow-400 text-yellow-400"
            />

          ))}

        </div>

        {/* Bottom */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 text-sm text-slate-500">

            <UserRound size={16} />

            {faces} Faces

          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#0A3F61]/10 px-3 py-1 text-xs font-medium text-[#0A3F61]">

            <Camera size={14} />

            RAW

          </div>

        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <Tag size={14} />

            AI Tagged

          </div>

          <span className="text-xs font-medium text-green-600">
            Synced
          </span>

        </div>

        {/* Add To Album */}

        <button
          onClick={() =>
            addPhoto({
              id,
              image,
            })
          }
          className="w-full rounded-xl bg-[#0A3F61] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#14557F]"
        >
          Add to Album
        </button>

      </div>

    </div>
  );
}