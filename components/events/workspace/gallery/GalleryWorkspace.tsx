"use client";

import {
  useMemo,
  type MouseEvent,
} from "react";
import { useParams } from "next/navigation";

import GalleryHeader from "./GalleryHeader";
import { GalleryGrid } from "./GalleryGrid";
import UploadQueue from "./upload/UploadQueue";

import { useGallery } from "@/hooks/events/useGallery";
import { useGallerySelection } from "@/hooks/events/useGallerySelection";
import { useUploadManager } from "@/hooks/events/useUploadManager";
import GalleryToolbar from "./toolbar/GalleryToolbar";
import { useGalleryFilters } from "@/hooks/events/useGalleryFilters";
import GalleryBulkActions from "./toolbar/GalleryBulkActions";

export default function GalleryWorkspace() {
  const params = useParams();

  const eventId = useMemo(() => {
    const value = params?.eventId;

    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return (value as string) ?? "";
  }, [params]);

  const {
    photos,
    loading,
  } = useGallery(eventId);

  const uploadManager = useUploadManager();

  const filters = useGalleryFilters(uploadManager.items);

  const selection = useGallerySelection();

  const orderedIds = useMemo(
    () => filters.items.map((item) => item.id),
    [filters.items],
  );

  const handleSelect = (
    id: string,
    _index: number,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    selection.select(id, {
      multi: event.metaKey || event.ctrlKey,
      range: event.shiftKey,
      orderedIds,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <GalleryHeader
        totalPhotos={photos.length}
        onFilesSelected={uploadManager.addFiles}
      />
      <GalleryToolbar
        total={filters.total}
        filteredCount={filters.filteredCount}
        search={filters.search}
        filter={filters.filter}
        sort={filters.sort}
        onSearch={filters.setSearch}
        onFilter={filters.setFilter}
        onSort={filters.setSort}
      />
      <GalleryBulkActions
        selectedCount={selection.count}
        totalCount={filters.filteredCount}
        failedCount={
          uploadManager.items.filter(
            (item) =>
              selection.selectedIds.includes(item.id) &&
              item.status === "failed",
          ).length
        }
        onSelectAll={() =>
          selection.selectAll(orderedIds)
        }
        onInvertSelection={() =>
          selection.invertSelection(orderedIds)
        }
        onClearSelection={
          selection.clearSelection
        }
        onDownload={() => {
          alert(
            "Bulk download will be enabled after Storage download APIs are completed.",
          );
        }}
        onRetry={() => {
          selection.selectedIds.forEach((id) => {
            uploadManager.retry(id);
          });

          selection.clearSelection();
        }}
        onRemove={() => {
          const confirmed = window.confirm(
            `Remove ${selection.count} selected upload(s)?`,
          );

          if (!confirmed) {
            return;
          }

          selection.selectedIds.forEach((id) => {
            uploadManager.remove(id);
          });

          selection.clearSelection();
        }}
      />
      <div className="flex-1 overflow-auto">
        <GalleryGrid
  items={filters.items}
  selectedIds={selection.selectedIds}
  keyboard={{
    activeIndex: 0,
  }}
  onSelect={handleSelect}
/>
      </div>

      <UploadQueue
        items={uploadManager.items}
        isUploading={uploadManager.isUploading}
        overallProgress={uploadManager.overallProgress}
        onRemove={uploadManager.remove}
        onRetry={uploadManager.retry}
        onCancel={uploadManager.cancel}
        onClearCompleted={uploadManager.clearCompleted}
      />
    </div>
  );
}