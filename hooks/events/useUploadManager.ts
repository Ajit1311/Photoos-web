import { useCallback, useMemo, useReducer, useRef } from "react";
import { UploadService } from "@/services/events/upload";
import type { UploadItem, UploadManagerState } from "@/types/events/upload";

// 1. Action Types
type UploadAction =
    | { type: "ADD_FILES"; payload: UploadItem[] }
    | { type: "REMOVE"; payload: string }
    | { type: "CLEAR_COMPLETED" }
    | { type: "START_UPLOAD"; payload: string }
    | { type: "UPDATE_PROGRESS"; payload: { id: string; progress: number; transferredBytes: number; totalBytes: number } }
    | { type: "SET_PROCESSING"; payload: { id: string; processingStatus: string } }
    | { type: "UPLOAD_SUCCESS"; payload: { id: string; assetId?: string; storagePath?: string; processingStatus?: string } }
    | { type: "UPLOAD_FAILED"; payload: { id: string; error: string } }
    | { type: "RESET_FOR_RETRY"; payload: string }
    | { type: "UPLOAD_CANCELLED"; payload: string };

const initialState: UploadManagerState = {
    items: [],
    isUploading: false,
    overallProgress: 0,
};

// 2. Reducer Function
function reducer(state: UploadManagerState, action: UploadAction): UploadManagerState {
    switch (action.type) {
        case "ADD_FILES":
            return { ...state, items: [...state.items, ...action.payload] };

        case "REMOVE":
            return { ...state, items: state.items.filter((item) => item.id !== action.payload) };

        case "CLEAR_COMPLETED": {
            const remaining = state.items.filter((item) => {
                const remove = item.status === "completed" || item.status === "cancelled";

                if (remove && item.previewUrl?.startsWith("blob:")) {
                    URL.revokeObjectURL(item.previewUrl);
                }

                return !remove;
            });

            return {
                ...state,
                items: remaining,
            };
        }

        case "START_UPLOAD":
            return {
                ...state,
                isUploading: true,
                items: state.items.map((item) =>
                    item.id === action.payload ? { ...item, status: "uploading" } : item
                ),
            };

        case "UPDATE_PROGRESS":
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? {
                            ...item,
                            progress: action.payload.progress,
                            transferredBytes: action.payload.transferredBytes,
                            totalBytes: action.payload.totalBytes,
                        }
                        : item
                ),
            };

        case "SET_PROCESSING":
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? { ...item, status: "processing", processingStatus: action.payload.processingStatus }
                        : item
                ),
            };

        case "UPLOAD_SUCCESS": {
            const updatedItems = state.items.map((item) =>
                item.id === action.payload.id
                    ? {
                        ...item,
                        status: "completed" as const,
                        assetId: action.payload.assetId,
                        storagePath: action.payload.storagePath,
                        processingStatus: action.payload.processingStatus,
                    }
                    : item
            );
            const stillUploading = updatedItems.some((item) => item.status === "uploading" || item.status === "processing");
            return { ...state, isUploading: stillUploading, items: updatedItems };
        }

        case "UPLOAD_FAILED": {
            const updatedItems = state.items.map((item) =>
                item.id === action.payload.id
                    ? { ...item, status: "failed" as const, error: action.payload.error }
                    : item
            );
            const stillUploading = updatedItems.some((item) => item.status === "uploading" || item.status === "processing");
            return { ...state, isUploading: stillUploading, items: updatedItems };
        }

        case "RESET_FOR_RETRY":
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === action.payload
                        ? {
                            ...item,
                            status: "queued",
                            progress: 0,
                            transferredBytes: 0,
                            totalBytes: item.file.size,
                            assetId: undefined,
                            storagePath: undefined,
                            processingStatus: undefined,
                            error: undefined,
                        }
                        : item
                ),
            };

        case "UPLOAD_CANCELLED": {
            const updatedItems = state.items.map((item) =>
                item.id === action.payload ? { ...item, status: "cancelled" as const } : item
            );
            const stillUploading = updatedItems.some((item) => item.status === "uploading" || item.status === "processing");
            return { ...state, isUploading: stillUploading, items: updatedItems };
        }

        default:
            return state;
    }
}

// 3. Custom Hook
export function useUploadManager() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const uploadServiceRef = useRef(new UploadService());
    const isUploadingRef = useRef(false);

    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

    const addFiles = useCallback((files: File[]) => {
        const items: UploadItem[] = files.map((file) => {
            const previewUrl = URL.createObjectURL(file);

            return {
                id: crypto.randomUUID(),
                file,
                status: "queued",
                progress: 0,
                transferredBytes: 0,
                totalBytes: file.size,
                previewUrl,
            };
        });

        dispatch({ type: "ADD_FILES", payload: items });
    }, []);

    const remove = useCallback(
        (id: string) => {
            const item = state.items.find((value) => value.id === id);
            if (item?.status === "uploading") return;

            dispatch({ type: "REMOVE", payload: id });
        },
        [state.items]
    );

    const clearCompleted = useCallback(() => {
        dispatch({ type: "CLEAR_COMPLETED" });
    }, []);

    const upload = useCallback(
        async (studioId: string, eventId: string, albumId?: string) => {
            if (isUploadingRef.current) return;

            isUploadingRef.current = true;
            const queuedItems = state.items.filter((item) => item.status === "queued");

            try {
                for (const item of queuedItems) {
                    const controller = new AbortController();
                    abortControllersRef.current.set(item.id, controller);

                    dispatch({ type: "START_UPLOAD", payload: item.id });

                    try {
                        const result = await uploadServiceRef.current.upload(
                            {
                                file: item.file,
                                studioId,
                                eventId,
                                albumId: albumId ?? "",
                                signal: controller.signal,
                            },
                            (progress) => {
                                dispatch({
                                    type: "UPDATE_PROGRESS",
                                    payload: {
                                        id: item.id,
                                        progress: progress.progress,
                                        transferredBytes: progress.transferredBytes,
                                        totalBytes: progress.totalBytes,
                                    },
                                });
                            }
                        );

                        if (result.cancelled) {
                            dispatch({ type: "UPLOAD_CANCELLED", payload: item.id });
                            abortControllersRef.current.delete(item.id);
                            continue;
                        }

                        if (!result.success) {
                            dispatch({
                                type: "UPLOAD_FAILED",
                                payload: { id: item.id, error: result.error ?? "Upload failed." },
                            });
                            abortControllersRef.current.delete(item.id);
                            continue;
                        }

                        dispatch({
                            type: "SET_PROCESSING",
                            payload: {
                                id: item.id,
                                processingStatus:
                                    result.processingStatus ??
                                    "queued",
                            },
                        });

                        dispatch({
                            type: "UPLOAD_SUCCESS",
                            payload: {
                                id: item.id,
                                assetId: result.assetId,
                                storagePath: result.storagePath,
                                processingStatus: result.processingStatus,
                            },
                        });

                        abortControllersRef.current.delete(item.id);

                    } catch (error) {
                        abortControllersRef.current.delete(item.id);

                        if (error instanceof DOMException && error.name === "AbortError") {
                            dispatch({
                                type: "UPLOAD_CANCELLED",
                                payload: item.id,
                            });
                            continue;
                        }

                        dispatch({
                            type: "UPLOAD_FAILED",
                            payload: {
                                id: item.id,
                                error: error instanceof Error ? error.message : "Upload failed.",
                            },
                        });
                    }
                }
            } finally {
                isUploadingRef.current = false;
            }
        },
        [state.items]
    );

    const retry = useCallback(
        (id: string) => {
            const item = state.items.find((value) => value.id === id);

            if (!item || item.status !== "failed") {
                return;
            }

            dispatch({
                type: "RESET_FOR_RETRY",
                payload: id,
            });
        },
        [state.items]
    );

    const cancel = useCallback((id: string) => {
        const controller = abortControllersRef.current.get(id);
        if (!controller) return;

        controller.abort();
    }, []);

    const isUploading = useMemo(() => state.isUploading, [state.isUploading]);

    const overallProgress = useMemo(() => {
        if (state.items.length === 0) return 0;
        const total = state.items.reduce((sum, item) => sum + item.progress, 0);
        return Math.round(total / state.items.length);
    }, [state.items]);

    return {
  items: state.items,
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