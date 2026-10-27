import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";

import {
  UploadService,
} from "@/services/events/upload";

import type {
  UploadItem,
  UploadManagerState,
} from "@/types/events/upload";

import {
  validateFiles,
  validateUploadLimit,
} from "@/services/events/upload/uploadValidator";


type UploadAction =
  | {
      type: "ADD_FILES";
      payload: UploadItem[];
    }
  | {
      type: "REMOVE";
      payload: string;
    }
  | {
      type: "CLEAR_COMPLETED";
    }
  | {
      type: "START_UPLOAD";
      payload: string;
    }
  | {
      type: "UPDATE_PROGRESS";
      payload: {
        id: string;
        progress: number;
        transferredBytes: number;
        totalBytes: number;
      };
    }
  | {
      type: "SET_PROCESSING";
      payload: {
        id: string;
        processingStatus: string;
      };
    }
  | {
      type: "UPLOAD_SUCCESS";
      payload: {
        id: string;
        assetId?: string;
        storagePath?: string;
        processingStatus?: string;
      };
    }
  | {
      type: "UPLOAD_FAILED";
      payload: {
        id: string;
        error: string;
      };
    }
  | {
      type: "RESET_FOR_RETRY";
      payload: string;
    }
  | {
      type: "UPLOAD_CANCELLED";
      payload: string;
    };


const initialState: UploadManagerState = {
  items: [],
  isUploading: false,
  overallProgress: 0,
};


function shouldBlockDuplicate(
  item: UploadItem,
) {
  return (
    item.status === "queued" ||
    item.status === "uploading" ||
    item.status === "processing" ||
    item.status === "completed"
  );
}


function revokePreviewUrl(
  item: UploadItem,
) {
  if (
    item.previewUrl &&
    item.previewUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(
      item.previewUrl,
    );
  }
}


function reducer(
  state: UploadManagerState,
  action: UploadAction,
): UploadManagerState {
  switch (action.type) {
    case "ADD_FILES":
      return {
        ...state,
        items: [
          ...state.items,
          ...action.payload,
        ],
      };


    case "REMOVE": {
      const item =
        state.items.find(
          (value) =>
            value.id === action.payload,
        );

      if (item) {
        revokePreviewUrl(item);
      }

      return {
        ...state,
        items: state.items.filter(
          (item) =>
            item.id !== action.payload,
        ),
      };
    }


    case "CLEAR_COMPLETED": {
      const remaining =
        state.items.filter(
          (item) => {
            const shouldRemove =
              item.status === "completed" ||
              item.status === "cancelled";

            if (shouldRemove) {
              revokePreviewUrl(item);
            }

            return !shouldRemove;
          },
        );

      return {
        ...state,
        items: remaining,
      };
    }


    case "START_UPLOAD":
      return {
        ...state,
        isUploading: true,
        items: state.items.map(
          (item) =>
            item.id === action.payload
              ? {
                  ...item,
                  status: "uploading",
                  error: undefined,
                }
              : item,
        ),
      };


    case "UPDATE_PROGRESS":
      return {
        ...state,
        items: state.items.map(
          (item) =>
            item.id ===
            action.payload.id
              ? {
                  ...item,
                  progress:
                    action.payload.progress,
                  transferredBytes:
                    action.payload
                      .transferredBytes,
                  totalBytes:
                    action.payload
                      .totalBytes,
                }
              : item,
        ),
      };


    case "SET_PROCESSING":
      return {
        ...state,
        items: state.items.map(
          (item) =>
            item.id ===
            action.payload.id
              ? {
                  ...item,
                  status: "processing",
                  processingStatus:
                    action.payload
                      .processingStatus,
                }
              : item,
        ),
      };


    case "UPLOAD_SUCCESS": {
      const updatedItems =
        state.items.map(
          (item) =>
            item.id ===
            action.payload.id
              ? {
                  ...item,
                  status: "completed" as const,
                  progress: 100,
                  transferredBytes:
                    item.totalBytes,
                  assetId:
                    action.payload.assetId,
                  storagePath:
                    action.payload.storagePath,
                  processingStatus:
                    action.payload
                      .processingStatus,
                  error: undefined,
                }
              : item,
        );

      const stillUploading =
        updatedItems.some(
          (item) =>
            item.status ===
              "uploading" ||
            item.status ===
              "processing",
        );

      return {
        ...state,
        isUploading:
          stillUploading,
        items:
          updatedItems,
      };
    }


    case "UPLOAD_FAILED": {
      const updatedItems =
        state.items.map(
          (item) =>
            item.id ===
            action.payload.id
              ? {
                  ...item,
                  status: "failed" as const,
                  error:
                    action.payload.error,
                }
              : item,
        );

      const stillUploading =
        updatedItems.some(
          (item) =>
            item.status ===
              "uploading" ||
            item.status ===
              "processing",
        );

      return {
        ...state,
        isUploading:
          stillUploading,
        items:
          updatedItems,
      };
    }


    case "RESET_FOR_RETRY":
      return {
        ...state,
        items: state.items.map(
          (item) =>
            item.id === action.payload
              ? {
                  ...item,
                  status: "queued",
                  progress: 0,
                  transferredBytes: 0,
                  totalBytes:
                    item.file.size,
                  assetId: undefined,
                  storagePath: undefined,
                  processingStatus:
                    undefined,
                  error: undefined,
                }
              : item,
        ),
      };


    case "UPLOAD_CANCELLED": {
      const updatedItems =
        state.items.map(
          (item) =>
            item.id === action.payload
              ? {
                  ...item,
                  status: "cancelled" as const,
                }
              : item,
        );

      const stillUploading =
        updatedItems.some(
          (item) =>
            item.status ===
              "uploading" ||
            item.status ===
              "processing",
        );

      return {
        ...state,
        isUploading:
          stillUploading,
        items:
          updatedItems,
      };
    }


    default:
      return state;
  }
}


export function useUploadManager() {
  const [
    state,
    dispatch,
  ] = useReducer(
    reducer,
    initialState,
  );


  const uploadServiceRef =
    useRef(
      new UploadService(),
    );


  const isUploadingRef =
    useRef(false);


  const abortControllersRef =
    useRef<
      Map<
        string,
        AbortController
      >
    >(
      new Map(),
    );


  const addFiles =
    useCallback(
      (
        files: File[],
      ) => {
        if (
          files.length === 0
        ) {
          return;
        }


        const limitResult =
          validateUploadLimit(
            state.items.length,
            files.length,
          );


        if (
          !limitResult.valid
        ) {
          console.error(
            "UPLOAD LIMIT:",
            limitResult.error
              ?.message,
          );

          return;
        }


        /*
         * Only files that are currently
         * active or already completed
         * should block another identical
         * file from being added.
         *
         * Failed and cancelled files
         * must be allowed again.
         */
        const existingFiles =
          state.items
            .filter(
              shouldBlockDuplicate,
            )
            .map(
              (item) =>
                item.file,
            );


        /*
         * validateFiles checks against
         * the existing queue.
         */
        const {
          validFiles,
          errors,
        } =
          validateFiles(
            files,
            existingFiles,
          );


        /*
         * Prevent duplicates inside the
         * same incoming file selection.
         *
         * Example:
         * User selects the same image
         * twice in one picker action.
         */
        const uniqueFiles: File[] =
          [];


        for (
          const file of validFiles
        ) {
          const alreadyAdded =
            uniqueFiles.some(
              (existing) =>
                existing.name ===
                  file.name &&
                existing.size ===
                  file.size &&
                existing.lastModified ===
                  file.lastModified,
            );


          if (!alreadyAdded) {
            uniqueFiles.push(
              file,
            );
          }
        }


        if (
          errors.length > 0
        ) {
          console.warn(
            "UPLOAD VALIDATION ERRORS:",
            errors.map(
              (item) => ({
                file:
                  item.file.name,
                code:
                  item.error.code,
                message:
                  item.error.message,
              }),
            ),
          );
        }


        const items: UploadItem[] =
          uniqueFiles.map(
            (file) => {
              const previewUrl =
                URL.createObjectURL(
                  file,
                );


              return {
                id:
                  crypto.randomUUID(),
                file,
                status:
                  "queued",
                progress: 0,
                transferredBytes: 0,
                totalBytes:
                  file.size,
                previewUrl,
              };
            },
          );


        if (
          items.length === 0
        ) {
          return;
        }


        dispatch({
          type: "ADD_FILES",
          payload: items,
        });
      },
      [
        state.items,
      ],
    );


  const remove =
    useCallback(
      (
        id: string,
      ) => {
        const item =
          state.items.find(
            (value) =>
              value.id === id,
          );


        if (
          item?.status ===
            "uploading" ||
          item?.status ===
            "processing"
        ) {
          return;
        }


        dispatch({
          type: "REMOVE",
          payload: id,
        });
      },
      [
        state.items,
      ],
    );


  const clearCompleted =
    useCallback(
      () => {
        dispatch({
          type:
            "CLEAR_COMPLETED",
        });
      },
      [],
    );


  const upload =
    useCallback(
      async (
        studioId: string,
        eventId: string,
        projectId: string,
      ) => {
        if (
          isUploadingRef.current
        ) {
          return;
        }


        const queuedItems =
          state.items.filter(
            (item) =>
              item.status ===
              "queued",
          );


        if (
          queuedItems.length === 0
        ) {
          return;
        }


        isUploadingRef.current =
          true;


        try {
          for (
            const item of queuedItems
          ) {
            const controller =
              new AbortController();


            abortControllersRef.current.set(
              item.id,
              controller,
            );


            dispatch({
              type:
                "START_UPLOAD",
              payload:
                item.id,
            });


            try {
              const result =
                await uploadServiceRef.current.upload(
                  {
                    file:
                      item.file,
                    studioId,
                    eventId,
                    projectId,
                    signal:
                      controller.signal,
                  },
                  (
                    progress,
                  ) => {
                    dispatch({
                      type:
                        "UPDATE_PROGRESS",
                      payload: {
                        id:
                          item.id,
                        progress:
                          progress.progress,
                        transferredBytes:
                          progress.transferredBytes,
                        totalBytes:
                          progress.totalBytes,
                      },
                    });
                  },
                );


              if (
                result.cancelled
              ) {
                dispatch({
                  type:
                    "UPLOAD_CANCELLED",
                  payload:
                    item.id,
                });

                abortControllersRef.current.delete(
                  item.id,
                );

                continue;
              }


              if (
                !result.success
              ) {
                dispatch({
                  type:
                    "UPLOAD_FAILED",
                  payload: {
                    id:
                      item.id,
                    error:
                      result.error ??
                      "Upload failed.",
                  },
                });

                abortControllersRef.current.delete(
                  item.id,
                );

                continue;
              }


              dispatch({
                type:
                  "SET_PROCESSING",
                payload: {
                  id:
                    item.id,
                  processingStatus:
                    result.processingStatus ??
                    "queued",
                },
              });


              dispatch({
                type:
                  "UPLOAD_SUCCESS",
                payload: {
                  id:
                    item.id,
                  assetId:
                    result.assetId,
                  storagePath:
                    result.storagePath,
                  processingStatus:
                    result.processingStatus,
                },
              });


              abortControllersRef.current.delete(
                item.id,
              );
            } catch (
              error
            ) {
              abortControllersRef.current.delete(
                item.id,
              );


              if (
                error instanceof
                  DOMException &&
                error.name ===
                  "AbortError"
              ) {
                dispatch({
                  type:
                    "UPLOAD_CANCELLED",
                  payload:
                    item.id,
                });

                continue;
              }


              dispatch({
                type:
                  "UPLOAD_FAILED",
                payload: {
                  id:
                    item.id,
                  error:
                    error instanceof
                    Error
                      ? error.message
                      : "Upload failed.",
                },
              });
            }
          }
        } finally {
          isUploadingRef.current =
            false;
        }
      },
      [
        state.items,
      ],
    );


  const retry =
    useCallback(
      (
        id: string,
      ) => {
        const item =
          state.items.find(
            (value) =>
              value.id === id,
          );


        if (
          !item ||
          item.status !==
            "failed"
        ) {
          return;
        }


        dispatch({
          type:
            "RESET_FOR_RETRY",
          payload:
            id,
        });
      },
      [
        state.items,
      ],
    );


  const cancel =
    useCallback(
      (
        id: string,
      ) => {
        const controller =
          abortControllersRef.current.get(
            id,
          );


        if (
          !controller
        ) {
          return;
        }


        controller.abort();
      },
      [],
    );


  const isUploading =
    useMemo(
      () =>
        state.isUploading,
      [
        state.isUploading,
      ],
    );


  const overallProgress =
    useMemo(
      () => {
        if (
          state.items.length === 0
        ) {
          return 0;
        }


        const total =
          state.items.reduce(
            (
              sum,
              item,
            ) =>
              sum +
              item.progress,
            0,
          );


        return Math.round(
          total /
            state.items.length,
        );
      },
      [
        state.items,
      ],
    );


  return {
    items:
      state.items,
    isUploading,
    overallProgress,
    addFiles,
    remove,
    clearCompleted,
    upload,
    retry,
    cancel,
  };
}