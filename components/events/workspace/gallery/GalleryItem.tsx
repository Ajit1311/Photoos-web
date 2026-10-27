"use client";

import {
  forwardRef,
  memo,
  useState,
} from "react";

import type {
  GalleryPhoto,
} from "@/types/events/gallery";

interface GalleryItemProps {
  item: GalleryPhoto;

  selected?: boolean;

  onClick?: (
    id: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

const GalleryItemComponent =
  forwardRef<
    HTMLButtonElement,
    GalleryItemProps
  >(function GalleryItem(
    {
      item,
      selected,
      onClick,
    },
    ref,
  ) {
    const [
      loaded,
      setLoaded,
    ] = useState(false);

    const [
      hasError,
      setHasError,
    ] = useState(false);

    return (
      <button
        ref={ref}
        type="button"
        onClick={(event) =>
          onClick?.(
            item.id,
            event,
          )
        }
        className={[
          "group",
          "[contain:layout_paint]",
          "relative",
          "aspect-square",
          "overflow-hidden",
          "rounded-xl",
          "border",
          "transition-all",
          selected
            ? "border-[#0A3F61] ring-2 ring-[#0A3F61]"
            : "border-slate-200 hover:border-[#0A3F61]/40",
        ].join(" ")}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        )}

        <img
          src={
            hasError
              ? "/images/photo-placeholder.svg"
              : item.thumbnailUrl ||
                item.originalUrl ||
                "/images/photo-placeholder.svg"
          }
          alt={item.fileName}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setLoaded(true);
          }}
          onError={() => {
            setHasError(true);
            setLoaded(true);
          }}
          className={[
            "h-full",
            "w-full",
            "object-cover",
            "transition-opacity",
            "duration-300",
            loaded
              ? "opacity-100"
              : "opacity-0",
          ].join(" ")}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-all duration-200 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="truncate text-xs font-medium text-white">
            {item.fileName}
          </p>

          <p className="mt-1 text-[10px] text-white/70">
            {(
              item.fileSize /
              1024 /
              1024
            ).toFixed(2)}
            MB
          </p>
        </div>
      </button>
    );
  });

export const GalleryItem =
  memo(
    GalleryItemComponent,
    (
      previous,
      next,
    ) => {
      return (
        previous.selected ===
          next.selected &&
        previous.item.id ===
          next.item.id &&
        previous.item.status ===
          next.item.status &&
        previous.item.thumbnailUrl ===
          next.item.thumbnailUrl &&
        previous.item.originalUrl ===
          next.item.originalUrl
      );
    },
  );