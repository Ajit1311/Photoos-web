"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

interface Options {
  totalItems: number;
  columns: number;
  onActivate?: (
    index: number,
    event: KeyboardEvent,
  ) => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
  onRangeMove?: (
    nextIndex: number,
  ) => void;
  itemRefs?: React.RefObject<(HTMLButtonElement | null)[]>;
}

export function useGalleryKeyboard({
  totalItems,
  columns,
  onActivate,
  onSelectAll,
  onEscape,
  onRangeMove,
  itemRefs,
}: Options) {
  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    if (totalItems === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= totalItems) {
      setActiveIndex(totalItems - 1);
    }
  }, [
    activeIndex,
    totalItems,
  ]);

  const move = useCallback(
    (next: number) => {
      if (totalItems === 0) {
        return;
      }

      const index = Math.max(
        0,
        Math.min(
          next,
          totalItems - 1,
        ),
      );

      setActiveIndex(index);

      const element = itemRefs?.current?.[index];
      element?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    },
    [totalItems, itemRefs],
  );

  const onKeyDown = useCallback(
    (
      event: React.KeyboardEvent,
    ) => {
      switch (event.key) {
        case "ArrowRight": {
          event.preventDefault();
          const next = Math.min(
            activeIndex + 1,
            totalItems - 1,
          );
          if (event.shiftKey) {
            onRangeMove?.(next);
          }
          move(next);
          break;
        }

        case "ArrowLeft": {
          event.preventDefault();
          const next = Math.max(
            activeIndex - 1,
            0,
          );
          if (event.shiftKey) {
            onRangeMove?.(next);
          }
          move(next);
          break;
        }

        case "ArrowDown":
          event.preventDefault();
          move(activeIndex + columns);
          break;

        case "ArrowUp":
          event.preventDefault();
          move(activeIndex - columns);
          break;

        case "Home":
          event.preventDefault();
          move(0);
          break;

        case "End":
          event.preventDefault();
          move(totalItems - 1);
          break;

        case "Enter":
        case " ":
          event.preventDefault();
          onActivate?.(
            activeIndex,
            event.nativeEvent,
          );
          break;

        case "a":
        case "A":
          if (
            event.metaKey ||
            event.ctrlKey
          ) {
            event.preventDefault();
            onSelectAll?.();
          }
          break;

        case "Escape":
          event.preventDefault();
          onEscape?.();
          break;

        default:
          break;
      }
    },
    [
      activeIndex,
      columns,
      move,
      onActivate,
      onSelectAll,
      onEscape,
      onRangeMove,
      totalItems,
    ],
  );

  return {
    activeIndex,
    setActiveIndex,
    move,
    onKeyDown,
  };
}