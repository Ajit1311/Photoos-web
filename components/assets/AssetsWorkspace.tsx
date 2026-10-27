"use client";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Download,
  Eye,
  File,
  FileImage,
  FileVideo,
  FolderOpen,
  Grid2X2,
  ImageIcon,
  List,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  AlbumAsset,
  completeAsset,
  generateAssetUrl,
  listAlbumAssets,
  listStudioAlbums,
  prepareAsset,
} from "@/lib/api/assets";

import { getSupabaseClient } from "@/lib/supabase/client";
import { resolveUserStudio } from "@/lib/auth/resolve-user-studio";

type AssetViewMode = "grid" | "list";

type AssetFilter =
  | "all"
  | "image"
  | "video"
  | "other";

type AlbumOption = {
  id: string;
  title: string;
  code?: string | null;
};

type WorkspaceAsset = AlbumAsset & {
  album_name?: string | null;
  preview_url?: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong.";
}

function formatBytes(
  value: number | string | null | undefined,
): string {
  const bytes = Number(value ?? 0);

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const formatted =
    bytes /
    Math.pow(
      1024,
      index,
    );

  return `${formatted.toFixed(
    index === 0 ? 0 : 1,
  )} ${units[index]}`;
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getAssetCategory(
  asset: WorkspaceAsset,
): AssetFilter {
  const mimeType =
    asset.mime_type?.toLowerCase() ??
    "";

  if (
    mimeType.startsWith(
      "image/",
    )
  ) {
    return "image";
  }

  if (
    mimeType.startsWith(
      "video/",
    )
  ) {
    return "video";
  }

  return "other";
}

function getAssetIcon(
  asset: WorkspaceAsset,
) {
  const category =
    getAssetCategory(asset);

  if (category === "image") {
    return ImageIcon;
  }

  if (category === "video") {
    return FileVideo;
  }

  return File;
}

async function getFileDimensions(
  file: File,
): Promise<{
  width: number | null;
  height: number | null;
}> {
  if (
    !file.type.startsWith(
      "image/",
    )
  ) {
    return {
      width: null,
      height: null,
    };
  }

  return new Promise(
    (resolve) => {
      const url =
        URL.createObjectURL(file);

      const image =
        new Image();

      image.onload = () => {
        const width =
          image.naturalWidth ||
          null;

        const height =
          image.naturalHeight ||
          null;

        URL.revokeObjectURL(url);

        resolve({
          width,
          height,
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);

        resolve({
          width: null,
          height: null,
        });
      };

      image.src = url;
    },
  );
}

export default function AssetsWorkspace() {
  const supabase = useMemo(
    () => getSupabaseClient(),
    [],
  );

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    deletingAssetId,
    setDeletingAssetId,
  ] = useState<string | null>(null);

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    uploadError,
    setUploadError,
  ] = useState<string | null>(null);

  const [
    studioId,
    setStudioId,
  ] = useState<string | null>(null);

  const [
    albums,
    setAlbums,
  ] = useState<AlbumOption[]>([]);

  const [
    selectedAlbumId,
    setSelectedAlbumId,
  ] = useState("");

  const [
    assets,
    setAssets,
  ] = useState<WorkspaceAsset[]>([]);

  const [
    viewMode,
    setViewMode,
  ] = useState<AssetViewMode>("grid");

  const [
    filter,
    setFilter,
  ] = useState<AssetFilter>("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    previewAsset,
    setPreviewAsset,
  ] = useState<WorkspaceAsset | null>(
    null,
  );

  const createAssetUrl =
    useCallback(
      async (
        asset: Pick<
          AlbumAsset,
          "id"
        >,
      ) => {
        try {
          return await generateAssetUrl(
            asset.id,
          );
        } catch (
          error
        ) {
          console.error(
            "Failed to generate asset URL",
            {
              assetId:
                asset.id,
              error,
            },
          );

          return null;
        }
      },
      [],
    );

  const loadWorkspace =
    useCallback(
      async () => {
        try {
          setError(null);

          let resolvedStudioId =
            studioId;

          if (!resolvedStudioId) {
            const membership =
              await resolveUserStudio();

            resolvedStudioId =
              membership?.studioId ??
              null;

            if (!resolvedStudioId) {
              throw new Error(
                "Studio could not be resolved.",
              );
            }

            setStudioId(
              resolvedStudioId,
            );
          }

          const albumRows =
            await listStudioAlbums(
              resolvedStudioId,
            );

          const nextAlbums =
            albumRows.map(
              (album) => ({
                id:
                  album.id,
                title:
                  album.title ??
                  "Untitled Album",
                code:
                  album.code ??
                  null,
              }),
            );

          setAlbums(
            nextAlbums,
          );

          setSelectedAlbumId(
            (current) => {
              if (
                current &&
                nextAlbums.some(
                  (album) =>
                    album.id ===
                    current,
                )
              ) {
                return current;
              }

              return (
                nextAlbums[0]?.id ??
                ""
              );
            },
          );

          if (
            nextAlbums.length ===
            0
          ) {
            setAssets([]);
          }
        } catch (
          loadError
        ) {
          console.error(
            "Failed to load assets workspace",
            loadError,
          );

          setError(
            getErrorMessage(
              loadError,
            ),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        studioId,
      ],
    );

  const loadAssets =
    useCallback(
      async (
        albumId: string,
      ) => {
        if (!albumId) {
          setAssets([]);
          return;
        }

        try {
          setError(null);

          const result =
            await listAlbumAssets(
              albumId,
              {
                limit: 100,
                offset: 0,
              },
            );

          const album =
            albums.find(
              (item) =>
                item.id ===
                albumId,
            );

          const assetsWithUrls =
            await Promise.all(
              (
                result.assets ??
                []
              ).map(
                async (
                  asset,
                ) => {
                  const previewUrl =
                    await createAssetUrl(
                      asset,
                    );

                  return {
                    ...asset,
                    album_name:
                      album?.title ??
                      null,
                    preview_url:
                      previewUrl,
                  } as WorkspaceAsset;
                },
              ),
            );

          setAssets(
            assetsWithUrls,
          );
        } catch (
          loadError
        ) {
          console.error(
            "Failed to load assets",
            loadError,
          );

          setError(
            getErrorMessage(
              loadError,
            ),
          );
        }
      },
      [
        albums,
        createAssetUrl,
      ],
    );

  useEffect(
    () => {
      void loadWorkspace();
    },
    [
      loadWorkspace,
    ],
  );

  useEffect(
    () => {
      if (selectedAlbumId) {
        void loadAssets(
          selectedAlbumId,
        );
      }
    },
    [
      selectedAlbumId,
      loadAssets,
    ],
  );

  const handleRefresh =
    useCallback(
      async () => {
        setRefreshing(true);

        await loadWorkspace();

        if (selectedAlbumId) {
          await loadAssets(
            selectedAlbumId,
          );
        }
      },
      [
        loadAssets,
        loadWorkspace,
        selectedAlbumId,
      ],
    );

  const handleUpload =
    useCallback(
      async (
        files: File[],
      ) => {
        if (
          files.length === 0
        ) {
          return;
        }

        if (!studioId) {
          setUploadError(
            "Studio could not be resolved.",
          );

          return;
        }

        if (!selectedAlbumId) {
          setUploadError(
            "Select an album before uploading assets.",
          );

          return;
        }

        try {
          setUploading(true);
          setUploadError(null);

          for (
            const file of files
          ) {
            const {
              width,
              height,
            } =
              await getFileDimensions(
                file,
              );

            const prepared =
              await prepareAsset(
                studioId,
                {
                  albumId:
                    selectedAlbumId,

                  assetType:
                    file.type.startsWith(
                      "image/",
                    )
                      ? "image"
                      : file.type.startsWith(
                          "video/",
                        )
                        ? "video"
                        : "file",

                  originalFilename:
                    file.name,

                  mimeType:
                    file.type ||
                    "application/octet-stream",

                  fileSize:
                    file.size,

                  width,

                  height,

                  metadata: {},
                },
              );

            const {
              error: storageError,
            } =
              await supabase.storage
                .from(
                  prepared.storage_bucket,
                )
                .upload(
                  prepared.storage_path,
                  file,
                  {
                    contentType:
                      file.type ||
                      "application/octet-stream",

                    upsert: false,
                  },
                );

            if (storageError) {
              throw new Error(
                storageError.message,
              );
            }

            try {
              await completeAsset(
                studioId,
                {
                  assetId:
                    prepared.id,

                  storagePath:
                    prepared.storage_path,

                  storageFilename:
                    prepared.storage_filename,

                  mimeType:
                    file.type ||
                    "application/octet-stream",

                  fileSize:
                    file.size,

                  width,

                  height,
                },
              );
            } catch (
              completionError
            ) {
              await supabase.storage
                .from(
                  prepared.storage_bucket,
                )
                .remove(
                  [
                    prepared.storage_path,
                  ],
                );

              throw completionError;
            }
          }

          await loadAssets(
            selectedAlbumId,
          );
        } catch (
          uploadFailure
        ) {
          console.error(
            "Failed to upload assets",
            uploadFailure,
          );

          setUploadError(
            getErrorMessage(
              uploadFailure,
            ),
          );
        } finally {
          setUploading(false);
        }
      },
      [
        loadAssets,
        selectedAlbumId,
        studioId,
        supabase,
      ],
    );

  const handleFileChange =
    useCallback(
      (
        event: ChangeEvent<
          HTMLInputElement
        >,
      ) => {
        const files =
          Array.from(
            event.target.files ??
              [],
          );

        event.target.value = "";

        void handleUpload(files);
      },
      [
        handleUpload,
      ],
    );

  const handleDrop =
    useCallback(
      (
        event: DragEvent<
          HTMLDivElement
        >,
      ) => {
        event.preventDefault();

        setDragActive(false);

        const files =
          Array.from(
            event.dataTransfer.files,
          );

        void handleUpload(files);
      },
      [
        handleUpload,
      ],
    );

  const handlePreview =
    useCallback(
      (
        asset: WorkspaceAsset,
      ) => {
        setPreviewAsset(asset);
      },
      [],
    );

  const handleDownload =
    useCallback(
      async (
        asset: WorkspaceAsset,
      ) => {
        try {
          const url =
            asset.preview_url ??
            await createAssetUrl(
              asset,
            );

          if (!url) {
            throw new Error(
              "Unable to create download link.",
            );
          }

          const anchor =
            document.createElement("a");

          anchor.href = url;

          anchor.download =
            asset.original_filename;

          anchor.target = "_blank";

          anchor.rel =
            "noopener noreferrer";

          document.body.appendChild(
            anchor,
          );

          anchor.click();

          document.body.removeChild(
            anchor,
          );
        } catch (
          downloadError
        ) {
          setError(
            getErrorMessage(
              downloadError,
            ),
          );
        }
      },
      [
        createAssetUrl,
      ],
    );

  const handleDelete =
    useCallback(
      async (
        asset: WorkspaceAsset,
      ) => {
        const confirmed =
          window.confirm(
            `Delete "${asset.original_filename}"? This cannot be undone.`,
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingAssetId(
            asset.id,
          );

          setError(null);

          const {
            error: storageError,
          } =
            await supabase.storage
              .from(
                asset.storage_bucket,
              )
              .remove(
                [
                  asset.storage_path,
                ],
              );

          if (
            storageError &&
            !storageError.message
              .toLowerCase()
              .includes(
                "not found",
              )
          ) {
            throw new Error(
              storageError.message,
            );
          }

          const {
            error: databaseError,
          } =
            await supabase
              .from(
                "assets",
              )
              .delete()
              .eq(
                "id",
                asset.id,
              );

          if (databaseError) {
            throw new Error(
              databaseError.message,
            );
          }

          setAssets(
            (current) =>
              current.filter(
                (item) =>
                  item.id !==
                  asset.id,
              ),
          );

          if (
            previewAsset?.id ===
            asset.id
          ) {
            setPreviewAsset(null);
          }
        } catch (
          deleteError
        ) {
          console.error(
            "Failed to delete asset",
            deleteError,
          );

          setError(
            getErrorMessage(
              deleteError,
            ),
          );
        } finally {
          setDeletingAssetId(null);
        }
      },
      [
        previewAsset,
        supabase,
      ],
    );

  const filteredAssets =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return assets.filter(
          (asset) => {
            const category =
              getAssetCategory(
                asset,
              );

            if (
              filter !== "all" &&
              category !== filter
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            return (
              asset.original_filename
                .toLowerCase()
                .includes(query) ||
              (
                asset.mime_type ??
                ""
              )
                .toLowerCase()
                .includes(query)
            );
          },
        );
      },
      [
        assets,
        filter,
        search,
      ],
    );

  const imageCount =
    assets.filter(
      (asset) =>
        getAssetCategory(
          asset,
        ) === "image",
    ).length;

  const videoCount =
    assets.filter(
      (asset) =>
        getAssetCategory(
          asset,
        ) === "video",
    ).length;

  const otherCount =
    assets.filter(
      (asset) =>
        getAssetCategory(
          asset,
        ) === "other",
    ).length;

  const selectedAlbum =
    albums.find(
      (album) =>
        album.id ===
        selectedAlbumId,
    );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />

          Loading assets...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-full flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Assets
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage photos, videos and files across your studio albums.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void handleRefresh();
              }}
              disabled={
                refreshing ||
                loading
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                inputRef.current?.click();
              }}
              disabled={
                uploading ||
                !selectedAlbumId
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}

              {uploading
                ? "Uploading..."
                : "Upload Assets"}
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={
                handleFileChange
              }
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setError(null);
              }}
              className="shrink-0 rounded-lg p-1 text-red-600 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-slate-500" />

              <h2 className="text-sm font-semibold text-slate-900">
                Albums
              </h2>
            </div>

            {albums.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                <FolderOpen className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No albums found
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Create an album first to start managing assets.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {albums.map(
                  (album) => {
                    const active =
                      album.id ===
                      selectedAlbumId;

                    return (
                      <button
                        key={
                          album.id
                        }
                        type="button"
                        onClick={() => {
                          setSelectedAlbumId(
                            album.id,
                          );
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >
                        <FolderOpen className="h-4 w-4 shrink-0" />

                        <span className="min-w-0 flex-1 truncate">
                          {
                            album.title
                          }
                        </span>

                        {album.code ? (
                          <span
                            className={`text-[10px] ${
                              active
                                ? "text-slate-300"
                                : "text-slate-400"
                            }`}
                          >
                            {
                              album.code
                            }
                          </span>
                        ) : null}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </aside>

          <main className="min-w-0">
            <div
              onDragOver={(
                event,
              ) => {
                event.preventDefault();

                if (
                  selectedAlbumId
                ) {
                  setDragActive(true);
                }
              }}
              onDragLeave={() => {
                setDragActive(false);
              }}
              onDrop={
                handleDrop
              }
              className={`rounded-2xl border p-5 transition ${
                dragActive
                  ? "border-slate-950 bg-slate-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <ImageIcon className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-950">
                      {
                        selectedAlbum?.title ??
                        "Select an album"
                      }
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {assets.length} assets
                      {" · "}
                      {imageCount} images
                      {" · "}
                      {videoCount} videos
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={search}
                      onChange={(
                        event,
                      ) => {
                        setSearch(
                          event.target.value,
                        );
                      }}
                      placeholder="Search assets..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode(
                          "grid",
                        );
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        viewMode ===
                        "grid"
                          ? "bg-slate-950 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setViewMode(
                          "list",
                        );
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        viewMode ===
                        "list"
                          ? "bg-slate-950 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    [
                      "all",
                      "All",
                      assets.length,
                    ],
                    [
                      "image",
                      "Images",
                      imageCount,
                    ],
                    [
                      "video",
                      "Videos",
                      videoCount,
                    ],
                    [
                      "other",
                      "Files",
                      otherCount,
                    ],
                  ] as const
                ).map(
                  ([
                    value,
                    label,
                    count,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setFilter(
                          value,
                        );
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        filter ===
                        value
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                      {" "}
                      ({count})
                    </button>
                  ),
                )}
              </div>

              {uploadError ? (
                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">
                    {uploadError}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(
                        null,
                      );
                    }}
                    className="rounded-lg p-1 text-red-600 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              <div
                className={`mt-6 rounded-2xl border border-dashed p-5 text-center transition ${
                  dragActive
                    ? "border-slate-950 bg-slate-50"
                    : "border-slate-200"
                }`}
              >
                <Upload className="mx-auto h-6 w-6 text-slate-400" />

                <p className="mt-2 text-sm font-medium text-slate-700">
                  Drag and drop files here
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Upload photos, videos or files directly into the selected album.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                  disabled={
                    uploading ||
                    !selectedAlbumId
                  }
                  className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Choose Files
                </button>
              </div>

              <div className="mt-6">
                {filteredAssets.length ===
                0 ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <FileImage className="h-12 w-12 text-slate-300" />

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                      No assets found
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      {selectedAlbumId
                        ? "Upload photos, videos or files to start building your asset library."
                        : "Select an album from the sidebar to view its assets."}
                    </p>
                  </div>
                ) : viewMode ===
                  "grid" ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {filteredAssets.map(
                      (
                        asset,
                      ) => {
                        const AssetIcon =
                          getAssetIcon(
                            asset,
                          );

                        const preview =
                          asset.preview_url;

                        const deleting =
                          deletingAssetId ===
                          asset.id;

                        return (
                          <div
                            key={
                              asset.id
                            }
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <div className="relative aspect-square overflow-hidden bg-slate-100">
                              {preview &&
                              getAssetCategory(
                                asset,
                              ) ===
                                "image" ? (
                                <img
                                  src={
                                    preview
                                  }
                                  alt={
                                    asset.original_filename
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <AssetIcon className="h-10 w-10 text-slate-300" />
                                </div>
                              )}

                              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handlePreview(
                                      asset,
                                    );
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm hover:bg-white"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleDownload(
                                      asset,
                                    );
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm hover:bg-white"
                                >
                                  <Download className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleDelete(
                                      asset,
                                    );
                                  }}
                                  disabled={
                                    deleting
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:opacity-60"
                                >
                                  {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>

                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-10">
                                <p className="truncate text-xs font-medium text-white">
                                  {asset.processing_status ??
                                    asset.status}
                                </p>
                              </div>
                            </div>

                            <div className="p-3">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {
                                  asset.original_filename
                                }
                              </p>

                              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                                <span>
                                  {formatBytes(
                                    asset.file_size,
                                  )}
                                </span>

                                <span>
                                  {asset.width &&
                                  asset.height
                                    ? `${asset.width}×${asset.height}`
                                    : getAssetCategory(
                                        asset,
                                      )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px_130px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">
                      <span>
                        Asset
                      </span>

                      <span>
                        Type
                      </span>

                      <span>
                        Size
                      </span>

                      <span>
                        Uploaded
                      </span>

                      <span>
                        Actions
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredAssets.map(
                        (
                          asset,
                        ) => {
                          const AssetIcon =
                            getAssetIcon(
                              asset,
                            );

                          const deleting =
                            deletingAssetId ===
                            asset.id;

                          return (
                            <div
                              key={
                                asset.id
                              }
                              className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_120px_110px_130px_120px] md:items-center md:px-5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                  {asset.preview_url &&
                                  getAssetCategory(
                                    asset,
                                  ) ===
                                    "image" ? (
                                    <img
                                      src={
                                        asset.preview_url
                                      }
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <AssetIcon className="h-4 w-4 text-slate-600" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">
                                    {
                                      asset.original_filename
                                    }
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {
                                      asset.mime_type
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="text-xs text-slate-500">
                                {getAssetCategory(
                                  asset,
                                )}
                              </div>

                              <div className="text-xs text-slate-500">
                                {formatBytes(
                                  asset.file_size,
                                )}
                              </div>

                              <div className="text-xs text-slate-500">
                                {formatDate(
                                  asset.created_at,
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handlePreview(
                                      asset,
                                    );
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleDownload(
                                      asset,
                                    );
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                                >
                                  <Download className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleDelete(
                                      asset,
                                    );
                                  }}
                                  disabled={
                                    deleting
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-60"
                                >
                                  {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {previewAsset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {
                    previewAsset.original_filename
                  }
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {formatBytes(
                    previewAsset.file_size,
                  )}
                  {" · "}
                  {
                    previewAsset.mime_type
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void handleDownload(
                      previewAsset,
                    );
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <Download className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewAsset(null);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-slate-950 p-4">
              {previewAsset.preview_url &&
              getAssetCategory(
                previewAsset,
              ) === "image" ? (
                <img
                  src={
                    previewAsset.preview_url
                  }
                  alt={
                    previewAsset.original_filename
                  }
                  className="max-h-[75vh] max-w-full object-contain"
                />
              ) : previewAsset.preview_url &&
                getAssetCategory(
                  previewAsset,
                ) === "video" ? (
                <video
                  src={
                    previewAsset.preview_url
                  }
                  controls
                  className="max-h-[75vh] max-w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-white">
                  <File className="h-16 w-16 text-slate-400" />

                  <p className="mt-4 text-sm font-medium">
                    Preview is not available for this file.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void handleDownload(
                        previewAsset,
                      );
                    }}
                    className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}