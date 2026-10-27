"use client";

import {
  useVirtualizer,
} from "@tanstack/react-virtual";

interface Options {
  count: number;
  parentRef: React.RefObject<HTMLElement>;
  estimateSize?: number;
  overscan?: number;
}

export function useGalleryVirtualizer({
  count,
  parentRef,
  estimateSize = 180,
  overscan = 8,
}: Options) {
  return useVirtualizer({
    count,
    getScrollElement: () =>
      parentRef.current,
    estimateSize: () =>
      estimateSize,
    overscan,
  });
}