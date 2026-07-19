"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export function useGallerySelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const anchorIdRef = useRef<string | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const select = useCallback(
    (
      id: string,
      options?: {
        multi?: boolean;
        range?: boolean;
        orderedIds?: string[];
      },
    ) => {
      setSelectedIds((previous) => {
        if (options?.range && anchorIdRef.current && options.orderedIds) {
          const start = options.orderedIds.indexOf(anchorIdRef.current);
          const end = options.orderedIds.indexOf(id);

          if (start !== -1 && end !== -1) {
            const [from, to] = start < end ? [start, end] : [end, start];
            return options.orderedIds.slice(from, to + 1);
          }
        }

        anchorIdRef.current = id;

        if (options?.multi) {
          if (previous.includes(id)) {
            return previous.filter((value) => value !== id);
          }
          return [...previous, id];
        }

        return [id];
      });
    },
    [],
  );

  // नवीन ॲड केलेले selectRange function
  const selectRange = useCallback(
    (from: string, to: string, orderedIds: string[]) => {
      const start = orderedIds.indexOf(from);
      const end = orderedIds.indexOf(to);

      // जर दोन्ही आयडी array मध्ये सापडले तरच रेंज सिलेक्ट करा
      if (start !== -1 && end !== -1) {
        const range = orderedIds.slice(
          Math.min(start, end),
          Math.max(start, end) + 1
        );
        setSelectedIds(range);
        
        // रेंज सिलेक्ट केल्यावर शेवटच्या आयडीला ॲंकर (anchor) म्हणून सेट करणे 
        // जेणेकरून Shift + Click लॉजिक नीट चालेल
        anchorIdRef.current = to; 
      }
    },
    []
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((value) => value !== id);
      }
      return [...previous, id];
    });
  }, []);

  // सर्व आयटम्स सिलेक्ट करण्यासाठी (Select All)
  const selectAll = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids);
    },
    [],
  );

  // सिलेक्ट नसलेले आयटम्स सिलेक्ट करण्यासाठी आणि आधीचे अनसिलेक्ट करण्यासाठी (Invert Selection)
  const invertSelection = useCallback(
    (ids: string[]) => {
      setSelectedIds(
        ids.filter(
          (id) => !selectedIds.includes(id),
        ),
      );
    },
    [selectedIds],
  );

  const count = useMemo(() => selectedIds.length, [selectedIds]);

  return {
    selectedIds,
    count,

    select,
    selectRange,
    toggle,

    isSelected,

    clearSelection,

    selectAll,

    invertSelection,
  };
}