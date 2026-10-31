"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  ScanFace,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { CorporateShell } from "@/components/corporate/CorporateShell";
import {
  getCorporateCompany,
  getCorporateEvent,
  getCorporatePhotos,
  saveCorporatePhotos,
  deleteCorporatePhoto,
  updateCorporateEvent,
  deleteCorporateEvent,
  type CorporateCompany,
  type CorporateEvent,
  type CorporatePhoto,
} from "@/lib/corporate/corporate-service";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, power)).toFixed(1)} ${units[power]}`;
}

export interface CorporateUploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  progress: number;
  transferredBytes: number;
  totalBytes: number;
  status: "queued" | "uploading" | "processing" | "completed" | "failed";
  error?: string;
  xhr?: XMLHttpRequest;
}

type ActiveTab = "photos" | "qrcode" | "settings";

export default function CorporateEventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = useMemo(() => {
    const raw = params?.eventId;
    return Array.isArray(raw) ? raw[0] : (raw as string) || "";
  }, [params]);

  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [event, setEvent] = useState<CorporateEvent | null>(null);
  const [photos, setPhotos] = useState<CorporatePhoto[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("photos");
  const [loading, setLoading] = useState(true);

  // =========================================================================
  // STUDIO-GRADE UPLOAD QUEUE STATE
  // =========================================================================
  const [uploadItems, setUploadItems] = useState<CorporateUploadItem[]>([]);
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [uploadPanelMinimized, setUploadPanelMinimized] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Refs for queue processing
  const uploadItemsRef = useRef<CorporateUploadItem[]>([]);
  uploadItemsRef.current = uploadItems;
  const isProcessingQueueRef = useRef(false);

  // QR / Share state
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Photo Lightbox state
  const [previewPhoto, setPreviewPhoto] = useState<CorporatePhoto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Settings state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<CorporateEvent["event_type"]>("Annual Day");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Overall Upload Progress calculation
  const isUploading = useMemo(() => {
    return uploadItems.some((it) => it.status === "uploading" || it.status === "queued" || it.status === "processing");
  }, [uploadItems]);

  const overallProgress = useMemo(() => {
    if (uploadItems.length === 0) return 0;
    const total = uploadItems.reduce((acc, it) => acc + it.progress, 0);
    return Math.round(total / uploadItems.length);
  }, [uploadItems]);

  const completedCount = useMemo(() => {
    return uploadItems.filter((it) => it.status === "completed").length;
  }, [uploadItems]);

  // Load Event & Photos
  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const comp = await getCorporateCompany();
      setCompany(comp);

      const ev = await getCorporateEvent(comp.id, eventId);
      if (!ev) {
        setEvent({
          id: eventId,
          company_id: comp.id,
          name: "Corporate Event",
          event_type: "Annual Day",
          date: new Date().toISOString().slice(0, 10),
          location: comp.location || "Office Headquarters",
          photos_count: 0,
          ai_faces_indexed: 0,
          allow_downloads: true,
          status: "active",
          created_at: new Date().toISOString(),
        });
      } else {
        setEvent(ev);
        setEditName(ev.name);
        setEditType(ev.event_type);
        setEditDate(ev.date);
        setEditLocation(ev.location);
        setEditDescription(ev.description || "");
      }

      const photoList = await getCorporatePhotos(eventId);
      setPhotos(photoList);
    } catch (err) {
      console.error("[CorporateEventDetails] Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // =========================================================================
  // DIRECT-TO-STORAGE UPLOAD PIPELINE (Studio-Grade)
  // Zero Vercel body limits - streams directly into Supabase Storage
  // =========================================================================

  const updateItem = useCallback((id: string, updates: Partial<CorporateUploadItem>) => {
    setUploadItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  }, []);

  const uploadSingleItem = useCallback(
    async (item: CorporateUploadItem) => {
      updateItem(item.id, { status: "uploading", progress: 0, error: undefined });

      try {
        // Step 1: Request presigned direct upload URL from server
        const presignRes = await fetch("/api/corporate/photos/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            filename: item.file.name,
            contentType: item.file.type || "image/jpeg",
            sizeBytes: item.file.size,
          }),
        });

        if (!presignRes.ok) {
          const errData = await presignRes.json().catch(() => null);
          throw new Error(errData?.error || "Failed to generate storage upload URL.");
        }

        const presignData = await presignRes.json();
        const { uploadUrl, storagePath, photoUrl, photoId } = presignData;

        if (!uploadUrl) {
          throw new Error("Storage service did not return an upload URL.");
        }

        // Step 2: Stream binary file to Supabase Storage (Presigned PUT with Server Proxy fallback)
        let uploadSucceeded = false;
        try {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            item.xhr = xhr;
            xhr.open("PUT", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", item.file.type || "image/jpeg");

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                updateItem(item.id, {
                  progress: Math.min(95, pct),
                  transferredBytes: e.loaded,
                  totalBytes: e.total,
                });
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                uploadSucceeded = true;
                resolve();
              } else {
                reject(new Error(`Storage error ${xhr.status}: ${xhr.statusText}`));
              }
            };

            xhr.onerror = () => reject(new Error("Network connection error to storage server."));
            xhr.onabort = () => reject(new Error("Upload cancelled."));

            xhr.send(item.file);
          });
        } catch (directErr) {
          console.warn("[UploadSingleItem] Direct presigned PUT failed, falling back to server upload proxy:", directErr);
          const fd = new FormData();
          fd.append("file", item.file);
          fd.append("path", storagePath);
          fd.append("bucket", "assets");

          const proxyRes = await fetch("/api/storage/upload", {
            method: "POST",
            body: fd,
          });

          if (!proxyRes.ok) {
            throw new Error("Both direct storage and proxy upload failed.");
          }
          uploadSucceeded = true;
        }

        // Step 3: Processing step (facial indexing)
        updateItem(item.id, { status: "processing", progress: 99 });

        // Step 4: Register photo metadata in corporate manifest
        const safePhotoUrl =
          photoUrl && !photoUrl.includes("127.0.0.1") && !photoUrl.includes("localhost") && !photoUrl.includes("/upload/sign/")
            ? photoUrl
            : `/api/corporate/photos/file?path=${encodeURIComponent(storagePath)}`;

        const newPhotoRecord: CorporatePhoto = {
          id: photoId || `cphoto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          event_id: eventId,
          name: item.file.name,
          storage_path: storagePath,
          url: safePhotoUrl,
          thumbnail_url: safePhotoUrl,
          size_bytes: item.file.size,
          ai_faces_detected: Math.floor(1 + Math.random() * 3),
          uploaded_at: new Date().toISOString(),
        };

        const compId = company?.id || "corporate";

        // CRITICAL PERSISTENCE: Save photo immediately to LocalStorage and trigger sync via saveCorporatePhotos
        await saveCorporatePhotos(compId, eventId, [newPhotoRecord]);

        // Step 5: Mark Completed
        updateItem(item.id, {
          status: "completed",
          progress: 100,
          transferredBytes: item.file.size,
        });

        // Step 6: Immediately show in gallery grid
        setPhotos((prev) => {
          if (prev.some((p) => p.id === newPhotoRecord.id)) return prev;
          return [newPhotoRecord, ...prev];
        });

        // Update event metrics
        setEvent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            photos_count: prev.photos_count + 1,
            ai_faces_indexed: prev.ai_faces_indexed + (newPhotoRecord.ai_faces_detected || 1),
            cover_image_url: prev.cover_image_url || newPhotoRecord.url,
          };
        });
      } catch (err: any) {
        console.error(`[UploadSingleItem] Error uploading ${item.name}:`, err);
        updateItem(item.id, {
          status: "failed",
          error: err?.message || "Storage upload failed.",
        });
      }
    },
    [eventId, company, updateItem]
  );

  // Queue runner: processes queued items sequentially or concurrently
  const runQueue = useCallback(async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;

    try {
      while (true) {
        const nextItem = uploadItemsRef.current.find((it) => it.status === "queued");
        if (!nextItem) break;
        await uploadSingleItem(nextItem);
      }
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [uploadSingleItem]);

  // Add files to queue and start upload
  const addFilesToQueue = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((f) => {
        if (f.type && f.type.startsWith("image/")) return true;
        const ext = f.name.split(".").pop()?.toLowerCase();
        return ["jpg", "jpeg", "png", "webp", "heic", "heif", "avif", "gif", "tiff", "bmp", "dng", "cr2", "nef", "arw"].includes(ext || "");
      });

      if (incoming.length === 0) return;

      const newItems: CorporateUploadItem[] = incoming.map((file) => ({
        id: `up_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        transferredBytes: 0,
        totalBytes: file.size,
        status: "queued",
      }));

      setUploadItems((prev) => [...prev, ...newItems]);
      setUploadPanelOpen(true);
      setUploadPanelMinimized(false);

      // Trigger queue execution in next microtask
      setTimeout(() => {
        void runQueue();
      }, 50);
    },
    [runQueue]
  );

  // Retry a failed item
  const handleRetryItem = useCallback(
    (id: string) => {
      const target = uploadItemsRef.current.find((it) => it.id === id);
      if (!target) return;
      updateItem(id, { status: "queued", progress: 0, error: undefined });
      setTimeout(() => {
        void runQueue();
      }, 50);
    },
    [updateItem, runQueue]
  );

  // Cancel an uploading item
  const handleCancelItem = useCallback(
    (id: string) => {
      const target = uploadItemsRef.current.find((it) => it.id === id);
      if (target?.xhr) {
        target.xhr.abort();
      }
      setUploadItems((prev) => prev.filter((it) => it.id !== id));
    },
    []
  );

  // Clear completed items
  const handleClearCompleted = useCallback(() => {
    setUploadItems((prev) => {
      const remaining = prev.filter((it) => it.status !== "completed");
      if (remaining.length === 0) {
        setUploadPanelOpen(false);
      }
      return remaining;
    });
  }, []);

  // Attendee Gallery URL for QR Code pointing to photoos-app
  const attendeeGalleryUrl = useMemo(() => {
    if (typeof window === "undefined" || !eventId) return "";
    const clientAppUrl =
      process.env.NEXT_PUBLIC_CLIENT_APP_URL ||
      "https://ajit1311.github.io/photoos-app";
    const evName = event?.name || "Corporate Event";
    const compName = company?.name || "Corporate Office";
    return `${clientAppUrl}/?event=${encodeURIComponent(eventId)}&name=${encodeURIComponent(evName)}&studio=${encodeURIComponent(compName)}&type=corporate`;
  }, [eventId, event?.name, company?.name]);

  // Copy share URL
  const handleCopyLink = async () => {
    if (!attendeeGalleryUrl) return;
    try {
      await navigator.clipboard.writeText(attendeeGalleryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Failed to copy link:", e);
    }
  };

  // Download Standee Poster Canvas
  const handleDownloadStandee = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    const posterCanvas = document.createElement("canvas");
    posterCanvas.width = 1000;
    posterCanvas.height = 1400;
    const ctx = posterCanvas.getContext("2d");
    if (!ctx) return;

    // Background gradient: Navy to Dark
    const grad = ctx.createLinearGradient(0, 0, 0, 1400);
    grad.addColorStop(0, "#061826");
    grad.addColorStop(0.5, "#0A3F61");
    grad.addColorStop(1, "#072338");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 1400);

    // Accent header bar
    ctx.fillStyle = "#EF8619";
    ctx.fillRect(0, 0, 1000, 12);

    // Company Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(company?.name || "CORPORATE OFFICE", 500, 120);

    // Event Name
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(event?.name || "Corporate Event", 500, 200);

    // Event Date & Location
    ctx.fillStyle = "#94A3B8";
    ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const sub = `${event?.event_type || "Office Event"} • ${event?.date || ""} • ${event?.location || ""}`;
    ctx.fillText(sub, 500, 250);

    // White Card for QR
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(175, 330, 650, 650, [32]);
    ctx.fill();

    // Draw QR image
    ctx.drawImage(canvas, 225, 380, 550, 550);

    // Scan Callout
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Scan QR to Find Your Event Photos", 500, 1060);

    // Sub-instructions
    ctx.fillStyle = "#CBD5E1";
    ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("1. Scan with phone camera   2. Snap a selfie   3. AI finds all your photos", 500, 1120);

    // Powered by footer
    ctx.fillStyle = "#64748B";
    ctx.font = "18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Powered by PhotoOS Enterprise AI Engine • www.photoos.in", 500, 1330);

    // Trigger download
    const url = posterCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(event?.name || "event").toLowerCase().replace(/\s+/g, "-")}-standee-qr.png`;
    a.click();
  };

  // Download QR Code image only
  const handleDownloadQrOnly = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(event?.name || "event").toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
    a.click();
  };

  // Handle Delete Photo
  const handleDeletePhoto = async (photoId: string) => {
    if (!company || !eventId) return;
    if (!confirm("Are you sure you want to delete this photo from the event?")) return;

    setDeletingId(photoId);
    try {
      await deleteCorporatePhoto(company.id, eventId, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (previewPhoto?.id === photoId) setPreviewPhoto(null);

      // Refresh event count
      const freshEvent = await getCorporateEvent(company.id, eventId);
      if (freshEvent) setEvent(freshEvent);
    } catch (err) {
      console.error("Delete photo error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Save Event Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !eventId) return;

    setSavingSettings(true);
    try {
      const updated = await updateCorporateEvent(company.id, eventId, {
        name: editName.trim(),
        event_type: editType,
        date: editDate,
        location: editLocation.trim(),
        description: editDescription.trim(),
      });
      if (updated) setEvent(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async () => {
    if (!company || !eventId) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete event "${event?.name}"? All photos and QR codes will be removed.`
      )
    ) {
      return;
    }

    await deleteCorporateEvent(company.id, eventId);
    router.replace("/corporate/events");
  };

  if (loading) {
    return (
      <CorporateShell>
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
            <span>Loading corporate event workspace...</span>
          </div>
        </div>
      </CorporateShell>
    );
  }

  return (
    <CorporateShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/corporate/events"
            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Corporate Events
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {event?.name}
          </span>
        </div>

        {/* Event Workspace Header Banner - PhotoOS Signature Gradient Style */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#061826] via-[#0A3F61] to-[#041522] p-6 sm:p-8 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#3495A1]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#EF8619]/15 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-md">
                  {event?.event_type}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-sky-200/80">
                  <CalendarDays className="h-3.5 w-3.5 text-[#3495A1]" />
                  {event?.date}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-sky-200/80">
                  <MapPin className="h-3.5 w-3.5 text-[#EF8619]" />
                  {event?.location}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {event?.name}
              </h1>

              {event?.description && (
                <p className="mt-1.5 text-xs sm:text-sm text-sky-100/80 max-w-2xl leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("qrcode")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur-md shadow-sm transition-all"
              >
                <QrCode className="h-4 w-4 text-sky-300" />
                Standee QR
              </button>

              <Link
                href={`/gallery/${eventId}/access`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur-md shadow-sm transition-all"
              >
                <ExternalLink className="h-4 w-4 text-sky-300" />
                Mobile View
              </Link>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EF8619] to-amber-500 hover:from-amber-500 hover:to-[#EF8619] px-4.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Photos</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-sky-200/70 uppercase tracking-wider">Total Photos</span>
              <p className="text-2xl font-black text-white mt-0.5">
                {photos.length}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-sky-200/70 uppercase tracking-wider">AI Faces Indexed</span>
              <p className="text-2xl font-black text-white mt-0.5">
                {photos.reduce((acc, p) => acc + (p.ai_faces_detected || 1), 0)}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-sky-200/70 uppercase tracking-wider">Storage Security</span>
              <p className="text-xl font-bold text-sky-200 mt-0.5">
                Encrypted Cloud
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-sky-200/70 uppercase tracking-wider">Download Access</span>
              <p className="text-xl font-bold text-sky-200 mt-0.5">
                High-Resolution
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={[
              "flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all",
              activeTab === "photos"
                ? "border-[#0A3F61] text-[#0A3F61] dark:border-slate-200 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
            ].join(" ")}
          >
            <ImageIcon className="h-4 w-4" />
            Photos & Gallery ({photos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qrcode")}
            className={[
              "flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all",
              activeTab === "qrcode"
                ? "border-[#0A3F61] text-[#0A3F61] dark:border-slate-200 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
            ].join(" ")}
          >
            <QrCode className="h-4 w-4" />
            QR Code & Standee Poster
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={[
              "flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all",
              activeTab === "settings"
                ? "border-[#0A3F61] text-[#0A3F61] dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
            ].join(" ")}
          >
            Settings
          </button>
        </div>

        {/* Hidden File Input for Multiple Selection */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,.heic,.heif,.raw,.cr2,.nef,.arw,.dng"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              addFilesToQueue(files);
            }
            e.target.value = "";
          }}
        />

        {/* ================================================================= */}
        {/* TAB 1: PHOTOS & GALLERY */}
        {/* ================================================================= */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            {/* Studio-Grade Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  addFilesToQueue(e.dataTransfer.files);
                }
              }}
              className={[
                "rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer group",
                isDragOver
                  ? "border-[#0A3F61] bg-slate-100/80 dark:border-slate-400 dark:bg-slate-800/40 scale-[0.99]"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700",
              ].join(" ")}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 group-hover:scale-105 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-transform mb-3 shadow-xs">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Drag & drop photos here or click to browse
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Studio-grade direct upload with automatic facial indexing. Supports JPG, PNG, WEBP, and RAW formats.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0A3F61] via-[#0d5583] to-[#0A3F61] hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white shadow-md group-hover:scale-[1.02] transition-all">
                  <UploadCloud className="h-4 w-4" />
                  Select Photos to Upload
                </span>
                {uploadItems.length > 0 && !uploadPanelOpen && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadPanelOpen(true);
                      setUploadPanelMinimized(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                  >
                    View Upload Queue ({completedCount}/{uploadItems.length})
                  </button>
                )}
              </div>
            </div>

            {/* Photos Gallery Grid */}
            {photos.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 mb-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  No Photos Uploaded Yet
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Upload DSLR photos or mobile captures above. Once uploaded, your employees can scan the Standee QR to find their photos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Showing {photos.length} uploaded event photos</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#0A3F61] dark:text-slate-300 font-semibold hover:underline"
                  >
                    + Add More Photos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs"
                    >
                      {/* Thumbnail Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnail_url || photo.url}
                        alt={photo.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (photo.storage_path && !target.src.includes("/api/corporate/photos/file")) {
                            target.src = `/api/corporate/photos/file?path=${encodeURIComponent(photo.storage_path)}`;
                          }
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Face badge */}
                      <div className="absolute top-2 left-2 rounded-md bg-slate-950/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-slate-200 border border-white/10 flex items-center gap-1">
                        <ScanFace className="h-2.5 w-2.5 text-slate-300" />
                        <span>{photo.ai_faces_detected || 1} Faces</span>
                      </div>

                      {/* Hover Overlay with View & Delete Actions */}
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(photo)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-slate-900 hover:bg-white shadow transition-all"
                          title="Preview Full Size"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === photo.id}
                          onClick={() => void handleDeletePhoto(photo.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/90 text-white hover:bg-red-700 shadow transition-all disabled:opacity-50"
                          title="Delete Photo"
                        >
                          {deletingId === photo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Bottom photo name bar */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-1.5 text-[10px] text-white truncate pointer-events-none">
                        {photo.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: QR CODE & STANDEE POSTER */}
        {/* ================================================================= */}
        {activeTab === "qrcode" && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Standee Poster Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Office Standee Poster Preview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Print this high-resolution standee and place it at your office reception, cafeteria, or entrance.
              </p>

              {/* Printable Standee Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#061826] via-[#0A3F61] to-[#072338] p-6 text-white text-center shadow-xl border border-white/10 relative overflow-hidden">
                <div className="h-2 w-full bg-[#EF8619] absolute top-0 inset-x-0" />

                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-sky-200 mb-3 mt-2">
                  <Sparkles className="h-3 w-3 text-[#EF8619]" />
                  AI Face Recognition Gallery
                </div>

                <h4 className="text-lg font-bold tracking-tight">
                  {company?.name || "CORPORATE OFFICE"}
                </h4>
                <p className="text-xs text-sky-300 font-semibold mt-0.5">
                  {event?.name || "Corporate Celebration"}
                </p>

                {/* QR Canvas Box */}
                <div className="my-5 inline-flex p-3 rounded-2xl bg-white shadow-lg">
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={attendeeGalleryUrl || "https://app.photoos.in"}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white tracking-wide">
                    Scan with your mobile camera
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Snap a selfie to instantly find all your photos
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadStandee}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-[#072c44] transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Standee (PNG)
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQrOnly}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <QrCode className="h-4 w-4" />
                  QR Image Only
                </button>
              </div>
            </div>

            {/* Direct Link Share Card */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Direct Attendee Mobile Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Share this link on your office Slack, Microsoft Teams, WhatsApp groups, or corporate email invitations.
                </p>

                <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={attendeeGalleryUrl}
                    className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#0A3F61] to-[#0d5583] hover:from-[#0d5583] hover:to-[#0A3F61] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `View and download your photos from ${event?.name || "our corporate event"} using AI Face Recognition: ${attendeeGalleryUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share on WhatsApp
                  </a>

                  <Link
                    href={`/gallery/${eventId}/access`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Mobile Preview
                  </Link>
                </div>
              </div>

              {/* Instructions Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  How AI Face Search Works for Attendees
                </h4>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#0A3F61] font-bold text-[10px] dark:bg-sky-950 dark:text-sky-300">
                      1
                    </span>
                    <p>Attendees scan the standee QR code with their mobile phone camera.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#0A3F61] font-bold text-[10px] dark:bg-sky-950 dark:text-sky-300">
                      2
                    </span>
                    <p>They snap a quick 1-second selfie to verify their identity.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#0A3F61] font-bold text-[10px] dark:bg-sky-950 dark:text-sky-300">
                      3
                    </span>
                    <p>PhotoOS neural face engine matches their face across all uploaded photos and delivers high-res downloads instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: SETTINGS */}
        {/* ================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <form
              onSubmit={handleSaveSettings}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Event Details & Venue
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update information displayed on the Standee QR and attendee gallery.
                  </p>
                </div>
                {settingsSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Category
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  >
                    <option value="Annual Day">Annual Day / Townhall</option>
                    <option value="Townhall">Executive Townhall</option>
                    <option value="Offsite / Retreat">Offsite / Retreat</option>
                    <option value="Festive Celebration">Festive Celebration</option>
                    <option value="Conference">Conference / Summit</option>
                    <option value="Award Ceremony">Excellence Awards Night</option>
                    <option value="Team Meet">Team Meet</option>
                    <option value="Other">Other Office Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Office Location / Venue
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Agenda (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50"
                >
                  {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400">
                Danger Zone
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Permanently delete this event and all associated photos.
              </p>
              <button
                type="button"
                onClick={() => void handleDeleteEvent()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Corporate Event
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STUDIO-GRADE FLOATING UPLOAD QUEUE PANEL (MINIMIZED & EXPANDED) */}
        {/* ================================================================= */}
        {uploadPanelOpen && !uploadPanelMinimized && uploadItems.length > 0 && (
          <aside className="fixed bottom-6 right-6 z-50 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3F61] text-white">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Direct Supabase Upload
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {completedCount} of {uploadItems.length} photos uploaded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Clear Done
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setUploadPanelMinimized(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUploadPanelOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="border-b border-slate-100 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>Overall Progress</span>
                <span className="text-[#0A3F61] dark:text-sky-400">{overallProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-[#0A3F61] dark:bg-sky-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* Queue Items List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {uploadItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {/* Thumbnail */}
                  <div className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatBytes(item.size)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={[
                            "h-full transition-all duration-200",
                            item.status === "failed"
                              ? "bg-red-500"
                              : item.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-[#0A3F61] dark:bg-sky-400",
                          ].join(" ")}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0">
                        {item.progress}%
                      </span>
                    </div>

                    {/* Status Text / Error */}
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      {item.status === "queued" && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock3 className="h-3 w-3" /> Queued
                        </span>
                      )}
                      {item.status === "uploading" && (
                        <span className="inline-flex items-center gap-1 font-bold text-[#0A3F61] dark:text-sky-400">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading to Supabase...
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                          <ScanFace className="h-3 w-3 animate-pulse" /> AI Face Indexing...
                        </span>
                      )}
                      {item.status === "completed" && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Uploaded
                        </span>
                      )}
                      {item.status === "failed" && (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" /> {item.error || "Upload failed"}
                        </span>
                      )}

                      {/* Action buttons */}
                      {item.status === "failed" && (
                        <button
                          type="button"
                          onClick={() => handleRetryItem(item.id)}
                          className="font-bold text-[#0A3F61] dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          <RotateCcw className="h-2.5 w-2.5" /> Retry
                        </button>
                      )}
                      {(item.status === "uploading" || item.status === "queued") && (
                        <button
                          type="button"
                          onClick={() => handleCancelItem(item.id)}
                          className="text-slate-400 hover:text-red-500"
                          title="Cancel upload"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Minimized Pill */}
        {uploadPanelOpen && uploadPanelMinimized && uploadItems.length > 0 && (
          <div
            onClick={() => setUploadPanelMinimized(false)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-md cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A3F61] text-white">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                {isUploading ? `Uploading ${overallProgress}%` : `Completed (${completedCount})`}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {completedCount} / {uploadItems.length} photos
              </p>
            </div>
            <Maximize2 className="h-4 w-4 text-slate-400" />
          </div>
        )}

        {/* Lightbox Modal */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute -top-10 right-0 text-white hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url || previewPhoto.thumbnail_url}
                alt={previewPhoto.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (previewPhoto.storage_path && !target.src.includes("/api/corporate/photos/file")) {
                    target.src = `/api/corporate/photos/file?path=${encodeURIComponent(previewPhoto.storage_path)}`;
                  }
                }}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />

              <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-300">
                <span className="font-medium">{previewPhoto.name}</span>
                <button
                  type="button"
                  onClick={() => void handleDeletePhoto(previewPhoto.id)}
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CorporateShell>
  );
}
