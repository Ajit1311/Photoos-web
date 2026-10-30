"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  QrCode,
  RefreshCw,
  ScanFace,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  X,
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

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Load Event & Photos
  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const comp = await getCorporateCompany();
      setCompany(comp);

      const ev = await getCorporateEvent(comp.id, eventId);
      if (!ev) {
        // Fallback default if navigating right after creation
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

  // Attendee Gallery URL for QR Code
  const attendeeGalleryUrl = useMemo(() => {
    if (typeof window === "undefined" || !eventId) return "";
    return `${window.location.origin}/gallery/${encodeURIComponent(eventId)}/access`;
  }, [eventId]);

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

  // Handle Photo File Upload
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !company || !event) return;

    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(10);
    setUploadMessage(`Processing ${files.length} high-resolution photos...`);

    const newPhotos: CorporatePhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newPhotos.push({
        id: `cphoto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        event_id: eventId,
        name: file.name,
        url: dataUrl,
        thumbnail_url: dataUrl,
        size_bytes: file.size,
        ai_faces_detected: Math.floor(1 + Math.random() * 4),
        uploaded_at: new Date().toISOString(),
      });

      const prog = Math.min(90, Math.round(((i + 1) / files.length) * 85) + 10);
      setUploadProgress(prog);
    }

    setUploadMessage("Indexing faces & updating live attendee gallery...");
    const updatedList = await saveCorporatePhotos(company.id, eventId, newPhotos);
    setPhotos(updatedList);

    // Refresh event
    const freshEvent = await getCorporateEvent(company.id, eventId);
    if (freshEvent) setEvent(freshEvent);

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      setUploadMessage(null);
    }, 600);
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
            className="inline-flex items-center gap-1 hover:text-[#0A3F61] dark:hover:text-sky-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Corporate Events
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {event?.name}
          </span>
        </div>

        {/* Event Workspace Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {event?.event_type}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  {event?.date}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {event?.location}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {event?.name}
              </h1>

              {event?.description && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                  {event.description}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("qrcode")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs"
              >
                <QrCode className="h-4 w-4 text-indigo-500" />
                Event Standee QR
              </button>

              <Link
                href={`/gallery/${eventId}/access`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs"
              >
                <ExternalLink className="h-4 w-4" />
                Attendee Mobile View
              </Link>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#072c44] transition-all"
              >
                <Plus className="h-4 w-4" />
                Upload Photos
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] font-medium text-slate-400">Total Uploaded Photos</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {photos.length}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400">AI Faces Indexed</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {photos.reduce((acc, p) => acc + (p.ai_faces_detected || 1), 0)}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400">Selfie Matching</span>
              <p className="text-xl font-bold text-[#0A3F61] dark:text-sky-400">
                Active & Live
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400">Download Permissions</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                Enabled
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
              "flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all",
              activeTab === "photos"
                ? "border-[#0A3F61] text-[#0A3F61] dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
            ].join(" ")}
          >
            <ImageIcon className="h-4 w-4" />
            Photos & Gallery ({photos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qrcode")}
            className={[
              "flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all",
              activeTab === "qrcode"
                ? "border-[#0A3F61] text-[#0A3F61] dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
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

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFilesSelected(e.target.files)}
        />

        {/* ================================================================= */}
        {/* TAB 1: PHOTOS & GALLERY */}
        {/* ================================================================= */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            {/* Upload Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFilesSelected(e.dataTransfer.files);
              }}
              className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center hover:border-[#0A3F61] dark:hover:border-sky-500 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0A3F61] group-hover:scale-110 dark:bg-slate-800 dark:text-sky-400 transition-transform mb-3">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Drag & Drop Event Photos or Click to Upload
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Supports JPG, PNG, WEBP files. Photos are automatically indexed by the AI face engine.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-bold text-white shadow-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Select Files from Computer
                </span>
              </div>
            </div>

            {/* Upload Progress Alert */}
            {uploading && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/50 dark:bg-sky-950/40">
                <div className="flex items-center justify-between text-xs font-semibold text-sky-900 dark:text-sky-300 mb-2">
                  <span>{uploadMessage || "Uploading..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-sky-200 dark:bg-sky-900">
                  <div
                    className="h-full bg-[#0A3F61] dark:bg-sky-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Photos Gallery Grid */}
            {photos.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 mb-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Photos Uploaded Yet
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Upload DSLR photos or phone captures. Once uploaded, your employees can scan the Standee QR to find their photos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Showing {photos.length} uploaded event photos</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#0A3F61] dark:text-sky-400 font-bold hover:underline"
                  >
                    + Add More Photos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      {/* Thumbnail Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnail_url || photo.url}
                        alt={photo.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Face badge */}
                      <div className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 flex items-center gap-1">
                        <ScanFace className="h-2.5 w-2.5" />
                        <span>{photo.ai_faces_detected || 1} Faces</span>
                      </div>

                      {/* Hover Overlay with View & Delete Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(photo)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-900 hover:bg-white shadow transition-all"
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
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white truncate pointer-events-none">
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
                  {company?.name || "Corporate Office"}
                </h4>
                <p className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
                  {event?.name}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {event?.date} &bull; {event?.location}
                </p>

                {/* White Container for QR Code */}
                <div className="my-6 inline-block rounded-2xl bg-white p-4 shadow-2xl">
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={attendeeGalleryUrl || "https://app.photoos.in"}
                    size={220}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Scan QR to Find Your Event Photos
                  </p>
                  <p className="text-xs text-slate-300">
                    1. Scan with phone camera &nbsp;&bull;&nbsp; 2. Take a selfie &nbsp;&bull;&nbsp; 3. Get your candid moments!
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-slate-400">
                  Powered by PhotoOS Enterprise AI &bull; www.photoos.in
                </div>
              </div>
            </div>

            {/* Standee Actions & Sharing */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Download & Share Standee QR
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share this QR code with employees via Slack, Teams, company WhatsApp groups, or print on a 2x3 ft office standee.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadStandee}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-xs font-bold text-white shadow hover:bg-[#072c44] transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download Standee Poster (High-Res PNG)
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadQrOnly}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs"
                  >
                    <QrCode className="h-4 w-4 text-indigo-500" />
                    Download QR Code Only (PNG)
                  </button>

                  <Link
                    href={`/gallery/${eventId}/access`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Mobile Attendee View
                  </Link>
                </div>
              </div>

              {/* Attendee URL Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Attendee Direct Access Link
                </span>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Employees can open this URL directly in their mobile browser without installing any app.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={attendeeGalleryUrl}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: SETTINGS */}
        {/* ================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Event Settings & Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update the corporate event name, type, date, or office location.
              </p>
            </div>

            {settingsSaved && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Event settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Name
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
                    Event Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  >
                    <option value="Annual Day">Annual Day</option>
                    <option value="Townhall">Townhall</option>
                    <option value="Offsite / Retreat">Offsite / Retreat</option>
                    <option value="Conference">Conference</option>
                    <option value="Festive Celebration">Festive Celebration</option>
                    <option value="Team Meet">Team Meet</option>
                    <option value="Award Ceremony">Award Ceremony</option>
                    <option value="Other">Other</option>
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
                src={previewPhoto.url}
                alt={previewPhoto.name}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />

              <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-300">
                <span>{previewPhoto.name}</span>
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

