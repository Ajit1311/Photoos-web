"use client";

import {
  useMemo,
  useState,
} from "react";

export function usePagination<T>(
  items: T[],
  pageSize = 20,
) {

  const [page, setPage] =
    useState(1);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        items.length /
        pageSize,
      ),
    );

  const currentItems =
    useMemo(() => {

      const from =
        (page - 1) *
        pageSize;

      return items.slice(
        from,
        from + pageSize,
      );

    }, [
      items,
      page,
      pageSize,
    ]);

  return {

    page,

    setPage,

    totalPages,

    currentItems,

  };

}