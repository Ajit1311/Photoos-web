"use client";

import PhotoCard from "./PhotoCard";

const photos = Array.from({ length: 48 }, (_, index) => ({
  id: `IMG_${String(index + 1).padStart(4, "0")}`,
  image: `https://picsum.photos/600/600?random=${index + 1}`,
  rating: 5,
  favorite: index % 7 === 0,
  selected: index % 11 === 0,
  faces: (index % 6) + 1,
  label: (
    ["Blue", "Green", "Yellow", "Purple", "Red"] as const
  )[index % 5],
}));

export default function PhotoGrid() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Photo Gallery
            </h2>

            <p className="mt-2 text-slate-500">
              Select photos for albums, AI and delivery.
            </p>

          </div>

          <div className="rounded-2xl bg-[#0A3F61]/10 px-5 py-3">

            <p className="text-xs uppercase tracking-wide text-[#0A3F61]">
              Photos
            </p>

            <h3 className="text-xl font-bold text-[#0A3F61]">
              {photos.length}
            </h3>

          </div>

        </div>

      </div>

      <div className="max-h-[900px] overflow-y-auto p-6">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">

          {photos.map((photo) => (

            <PhotoCard
              key={photo.id}
              id={photo.id}
              image={photo.image}
              rating={photo.rating}
              favorite={photo.favorite}
              selected={photo.selected}
              faces={photo.faces}
              label={photo.label}
            />

          ))}

        </div>

      </div>

    </section>
  );
}