"use client";

import {
  Check,
  Eye,
  ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  deleteAlbumAsset,
  listAlbumAssets,
  type AlbumAsset,
} from "@/lib/api/assets";

import {
  supabase,
} from "@/lib/supabase/client";

interface AlbumWorkspaceProps {
  albumId: string;
}

type AssetPreview = {
  asset: AlbumAsset;
  url: string | null;
};

type AssetUrlMap = Record<
  string,
  string | null
>;

function getAssetDisplayName(
  asset: AlbumAsset,
): string {
  return (
    asset.original_filename ||
    asset.storage_filename ||
    "Untitled asset"
  );
}

function isImageAsset(
  asset: AlbumAsset,
): boolean {
  return (
    typeof asset.mime_type === "string" &&
    asset.mime_type.startsWith(
      "image/",
    )
  );
}

function isVideoAsset(
  asset: AlbumAsset,
): boolean {
  return (
    typeof asset.mime_type === "string" &&
    asset.mime_type.startsWith(
      "video/",
    )
  );
}

function getStorageBucket(
  asset: AlbumAsset,
): string {
  if (
    typeof asset.storage_bucket === "string" &&
    asset.storage_bucket.trim().length > 0
  ) {
    return asset.storage_bucket.trim();
  }

  return "assets";
}

function normalizeStoragePath(
  path: string,
  bucket: string,
): string {
  let normalized =
    path.trim();

  if (
    normalized.startsWith(
      `${bucket}/`,
    )
  ) {
    normalized =
      normalized.slice(
        bucket.length + 1,
      );
  }

  normalized =
    normalized.replace(
      /^\/+/,
      "",
    );

  return normalized;
}

function getAssetPathCandidates(
  asset: AlbumAsset,
): string[] {
  const bucket =
    getStorageBucket(
      asset,
    );

  const candidates = [
    asset.thumbnail_path,
    asset.preview_path,
    asset.storage_path,
  ]
    .filter(
      (
        path,
      ): path is string =>
        typeof path === "string" &&
        path.trim().length > 0,
    )
    .map(
      (
        path,
      ) =>
        normalizeStoragePath(
          path,
          bucket,
        ),
    )
    .filter(
      (
        path,
      ) =>
        path.length > 0,
    );

  return Array.from(
    new Set(
      candidates,
    ),
  );
}

async function createSignedAssetUrl(
  bucket: string,
  path: string,
): Promise<string | null> {
  try {
    const {
      data,
      error,
    } = await supabase.storage
      .from(
        bucket,
      )
      .createSignedUrl(
        path,
        60 * 60,
      );

    if (
      error ||
      !data?.signedUrl
    ) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}

function createPublicAssetUrl(
  bucket: string,
  path: string,
): string | null {
  try {
    const {
      data,
    } = supabase.storage
      .from(
        bucket,
      )
      .getPublicUrl(
        path,
      );

    if (
      typeof data?.publicUrl === "string" &&
      data.publicUrl.length > 0
    ) {
      return data.publicUrl;
    }

    return null;
  } catch {
    return null;
  }
}

async function createAssetUrl(
  asset: AlbumAsset,
): Promise<string | null> {
  const bucket =
    getStorageBucket(
      asset,
    );

  const paths =
    getAssetPathCandidates(
      asset,
    );

  if (
    paths.length === 0
  ) {
    console.warn(
      "Asset has no usable storage path",
      {
        assetId:
          asset.id,
      },
    );

    return null;
  }

  for (
    const path of paths
  ) {
    const signedUrl =
      await createSignedAssetUrl(
        bucket,
        path,
      );

    if (
      signedUrl
    ) {
      return signedUrl;
    }
  }

  for (
    const path of paths
  ) {
    const publicUrl =
      createPublicAssetUrl(
        bucket,
        path,
      );

    if (
      publicUrl
    ) {
      return publicUrl;
    }
  }

  console.warn(
    "Unable to create URL for asset",
    {
      assetId:
        asset.id,
      bucket,
      paths,
    },
  );

  return null;
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const value =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof value.message ===
      "string"
    ) {
      return value.message;
    }

    try {
      const serialized =
        JSON.stringify(
          value,
        );

      if (
        serialized &&
        serialized !== "{}"
      ) {
        return serialized;
      }
    } catch {
      return "Unknown error.";
    }
  }

  return "Something went wrong.";
}

export default function AlbumWorkspace({
  albumId,
}: AlbumWorkspaceProps) {
  const [
    assets,
    setAssets,
  ] = useState<
    AlbumAsset[]
  >([]);

  const [
    assetUrls,
    setAssetUrls,
  ] = useState<
    AssetUrlMap
  >({});

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<
    Set<string>
  >(
    new Set(),
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(
    false,
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(
    null,
  );

  const [
    preview,
    setPreview,
  ] = useState<
    AssetPreview | null
  >(
    null,
  );

  const loadAssets =
    useCallback(
      async (
        options?: {
          refresh?: boolean;
        },
      ) => {
        if (
          !albumId
        ) {
          setAssets(
            [],
          );

          setAssetUrls(
            {},
          );

          setSelectedIds(
            new Set(),
          );

          setPreview(
            null,
          );

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );

          return;
        }

        try {
          setError(
            null,
          );

          if (
            options?.refresh
          ) {
            setRefreshing(
              true,
            );
          } else {
            setLoading(
              true,
            );
          }

          const result =
            await listAlbumAssets(
              albumId,
              {
                limit:
                  200,
                offset:
                  0,
              },
            );

          const nextAssets =
            Array.isArray(
              result.assets,
            )
              ? result.assets
              : [];

          setAssets(
            nextAssets,
          );

          setSelectedIds(
            (
              current,
            ) => {
              const availableIds =
                new Set(
                  nextAssets.map(
                    (
                      asset,
                    ) =>
                      asset.id,
                  ),
                );

              const next =
                new Set<string>();

              current.forEach(
                (
                  assetId,
                ) => {
                  if (
                    availableIds.has(
                      assetId,
                    )
                  ) {
                    next.add(
                      assetId,
                    );
                  }
                },
              );

              return next;
            },
          );

          const entries =
            await Promise.all(
              nextAssets.map(
                async (
                  asset,
                ) => {
                  try {
                    const url =
                      await createAssetUrl(
                        asset,
                      );

                    return [
                      asset.id,
                      url,
                    ] as const;
                  } catch (
                    urlError
                  ) {
                    console.warn(
                      "Failed to resolve asset URL",
                      {
                        assetId:
                          asset.id,
                        error:
                          urlError,
                      },
                    );

                    return [
                      asset.id,
                      null,
                    ] as const;
                  }
                },
              ),
            );

          setAssetUrls(
            Object.fromEntries(
              entries,
            ),
          );
        } catch (
          loadError
        ) {
          console.error(
            "Failed to load album assets",
            loadError,
          );

          setError(
            getErrorMessage(
              loadError,
            ),
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [
        albumId,
      ],
    );

  useEffect(
    () => {
      void loadAssets();
    },
    [
      loadAssets,
    ],
  );

  const handleToggleSelection =
    useCallback(
      (
        assetId: string,
      ) => {
        setSelectedIds(
          (
            current,
          ) => {
            const next =
              new Set(
                current,
              );

            if (
              next.has(
                assetId,
              )
            ) {
              next.delete(
                assetId,
              );
            } else {
              next.add(
                assetId,
              );
            }

            return next;
          },
        );
      },
      [],
    );

  const handleSelectAll =
    useCallback(
      () => {
        setSelectedIds(
          (
            current,
          ) => {
            if (
              current.size ===
              assets.length
            ) {
              return new Set();
            }

            return new Set(
              assets.map(
                (
                  asset,
                ) =>
                  asset.id,
              ),
            );
          },
        );
      },
      [
        assets,
      ],
    );

  const handleOpenPreview =
    useCallback(
      (
        asset: AlbumAsset,
      ) => {
        setPreview(
          {
            asset,
            url:
              assetUrls[
                asset.id
              ] ??
              null,
          },
        );
      },
      [
        assetUrls,
      ],
    );

  const handleDeleteSelected =
    useCallback(
      async () => {
        if (
          selectedIds.size === 0
        ) {
          return;
        }

        const ids =
          Array.from(
            selectedIds,
          );

        const confirmed =
          window.confirm(
            `Delete ${ids.length} selected ${
              ids.length === 1
                ? "photo"
                : "photos"
            }?`,
          );

        if (
          !confirmed
        ) {
          return;
        }

        try {
          setDeleting(
            true,
          );

          setError(
            null,
          );

          const results =
            await Promise.allSettled(
              ids.map(
                (
                  assetId,
                ) =>
                  deleteAlbumAsset(
                    assetId,
                  ),
              ),
            );

          const failedMessages =
            results
              .filter(
                (
                  result,
                ) =>
                  result.status ===
                  "rejected",
              )
              .map(
                (
                  result,
                ) => {
                  if (
                    result.status ===
                    "rejected"
                  ) {
                    return getErrorMessage(
                      result.reason,
                    );
                  }

                  return "";
                },
              )
              .filter(
                Boolean,
              );

          if (
            failedMessages.length > 0
          ) {
            throw new Error(
              failedMessages.join(
                "\n",
              ),
            );
          }

          const deletedIds =
            new Set(
              ids,
            );

          setAssets(
            (
              current,
            ) =>
              current.filter(
                (
                  asset,
                ) =>
                  !deletedIds.has(
                    asset.id,
                  ),
              ),
          );

          setAssetUrls(
            (
              current,
            ) => {
              const next = {
                ...current,
              };

              deletedIds.forEach(
                (
                  assetId,
                ) => {
                  delete next[
                    assetId
                  ];
                },
              );

              return next;
            },
          );

          setSelectedIds(
            new Set(),
          );

          setPreview(
            (
              current,
            ) => {
              if (
                current &&
                deletedIds.has(
                  current.asset.id,
                )
              ) {
                return null;
              }

              return current;
            },
          );
        } catch (
          deleteError
        ) {
          console.error(
            "Failed to delete selected assets",
            deleteError,
          );

          setError(
            getErrorMessage(
              deleteError,
            ),
          );
        } finally {
          setDeleting(
            false,
          );
        }
      },
      [
        selectedIds,
      ],
    );

  if (
    loading
  ) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0A3F61]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading album photos...
          </p>

        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Album Photos
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {assets.length}{" "}
              {assets.length === 1
                ? "photo"
                : "photos"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {assets.length > 0 && (
              <button
                type="button"
                onClick={
                  handleSelectAll
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {selectedIds.size ===
                assets.length ? (
                  <>
                    <X className="h-4 w-4" />
                    Clear selection
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Select all
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                void loadAssets(
                  {
                    refresh:
                      true,
                  },
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

          </div>

        </div>

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadAssets(
                  {
                    refresh:
                      true,
                  },
                )
              }
              className="shrink-0 text-sm font-medium text-red-700 hover:text-red-900"
            >
              Try again
            </button>

          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="sticky top-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm font-medium text-slate-700">
              {selectedIds.size}{" "}
              {selectedIds.size === 1
                ? "photo selected"
                : "photos selected"}
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setSelectedIds(
                    new Set(),
                  )
                }
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={() =>
                  void handleDeleteSelected()
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Delete selected
              </button>

            </div>

          </div>
        )}

        {assets.length === 0 ? (
          <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No photos in this album
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Photos uploaded to this album will appear here.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">

            {assets.map(
              (
                asset,
              ) => {
                const isSelected =
                  selectedIds.has(
                    asset.id,
                  );

                const url =
                  assetUrls[
                    asset.id
                  ] ??
                  null;

                return (
                  <div
                    key={
                      asset.id
                    }
                    className={`group relative aspect-square overflow-hidden rounded-2xl border bg-slate-100 transition ${
                      isSelected
                        ? "border-[#0A3F61] ring-2 ring-[#0A3F61]/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSelection(
                          asset.id,
                        )
                      }
                      className={`absolute left-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                        isSelected
                          ? "border-[#0A3F61] bg-[#0A3F61] text-white"
                          : "border-white/80 bg-white/90 text-transparent shadow-sm hover:border-[#0A3F61]"
                      }`}
                      aria-label={
                        isSelected
                          ? "Unselect photo"
                          : "Select photo"
                      }
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenPreview(
                          asset,
                        )
                      }
                      className="absolute inset-0 h-full w-full text-left"
                      aria-label={`Preview ${getAssetDisplayName(
                        asset,
                      )}`}
                    >
                      {url &&
                      isImageAsset(
                        asset,
                      ) ? (
                        <img
                          src={
                            url
                          }
                          alt={getAssetDisplayName(
                            asset,
                          )}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : url &&
                        isVideoAsset(
                          asset,
                        ) ? (
                        <video
                          src={
                            url
                          }
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">

                          <ImageIcon className="h-10 w-10 text-slate-400" />

                          <span className="mt-3 max-w-[80%] truncate text-xs text-slate-500">
                            {getAssetDisplayName(
                              asset,
                            )}
                          </span>

                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenPreview(
                          asset,
                        )
                      }
                      className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-700 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100"
                      aria-label="Preview photo"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                  </div>
                );
              },
            )}

          </div>
        )}

      </section>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          onClick={() =>
            setPreview(
              null,
            )
          }
        >

          <button
            type="button"
            onClick={() =>
              setPreview(
                null,
              )
            }
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative flex max-h-full max-w-full items-center justify-center"
            onClick={
              (
                event,
              ) =>
                event.stopPropagation()
            }
          >

            {preview.url &&
            isImageAsset(
              preview.asset,
            ) ? (
              <img
                src={
                  preview.url
                }
                alt={getAssetDisplayName(
                  preview.asset,
                )}
                className="max-h-[88vh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
              />
            ) : preview.url &&
              isVideoAsset(
                preview.asset,
              ) ? (
              <video
                src={
                  preview.url
                }
                controls
                autoPlay
                className="max-h-[88vh] max-w-[94vw] rounded-xl shadow-2xl"
              />
            ) : (
              <div className="rounded-3xl bg-white p-10 text-center">

                <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />

                <p className="mt-4 text-sm text-slate-600">
                  Preview is not available for this file.
                </p>

              </div>
            )}

          </div>

          <div className="absolute bottom-5 left-1/2 max-w-[90vw] -translate-x-1/2 rounded-xl bg-black/50 px-4 py-2 text-center text-sm text-white backdrop-blur">
            {getAssetDisplayName(
              preview.asset,
            )}
          </div>

        </div>
      )}
    </>
  );
}