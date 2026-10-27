"use client";

import {
  useCallback,
  useMemo,
  useRef,
  type MouseEvent,
} from "react";

import {
  GalleryItem,
} from "./GalleryItem";

import type {
  GalleryPhoto,
} from "@/types/events/gallery";

interface GalleryGridProps {
  items: GalleryPhoto[];

  selectedIds: string[];

  keyboard: {
    activeIndex: number;
  };

  onSelect: (
    id: string,
    index: number,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

export const GalleryGrid = ({
  items,
  selectedIds,
  keyboard,
  onSelect,
}: GalleryGridProps) => {
  const itemRefs =
    useRef<
      (HTMLButtonElement | null)[]
    >([]);

  const selectedSet =
    useMemo(
      () =>
        new Set(
          selectedIds,
        ),
      [selectedIds],
    );

  const handleSelect =
    useCallback(
      (
        id: string,
        index: number,
        event: MouseEvent<HTMLButtonElement>,
      ) => {
        onSelect(
          id,
          index,
          event,
        );
      },
      [onSelect],
    );

  if (items.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center p-8 text-sm text-slate-500">
        No photos uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {items.map(
        (
          item,
          index,
        ) => (
          <GalleryItem
            key={item.id}
            ref={(element) => {
              itemRefs.current[index] =
                element;
            }}
            item={item}
            selected={
              selectedSet.has(
                item.id,
              ) ||
              keyboard.activeIndex ===
                index
            }
            onClick={(
              id,
              event,
            ) =>
              handleSelect(
                id,
                index,
                event,
              )
            }
          />
        ),
      )}
    </div>
  );
};