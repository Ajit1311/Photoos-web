"use client";

import {
  CalendarDays,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  QRCodeCanvas,
} from "qrcode.react";

export interface GalleryQRCodeModalProps {
  eventId: string;
  eventName?: string;
  studioName?: string;
  onClose: () => void;
}

export default function GalleryQRCodeModal({
  eventId,
  eventName = "Event Gallery",
  studioName = "Photo Studio",
  onClose,
}: GalleryQRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 7-day expiration timestamp
  const [expiresAt, setExpiresAt] = useState<number>(() => {
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
  });

  const formattedExpiry = useMemo(() => {
    const d = new Date(expiresAt);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [expiresAt]);

  const galleryUrl = useMemo(() => {
    if (typeof window === "undefined" || !eventId) {
      return "";
    }

    return `${window.location.origin}/gallery/${encodeURIComponent(
      eventId,
    )}/access?exp=${expiresAt}`;
  }, [eventId, expiresAt]);

  const handleCopy = async () => {
    if (!galleryUrl) return;

    try {
      await navigator.clipboard.writeText(galleryUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy gallery URL:", error);
    }
  };

  // Regenerate QR with a fresh 7 days validity
  const handleRegenerate = () => {
    const nextExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    setExpiresAt(nextExpiry);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res 1000x1400 printable card
    const posterCanvas = document.createElement("canvas");
    posterCanvas.width = 1000;
    posterCanvas.height = 1400;
    const ctx = posterCanvas.getContext("2d");
    if (!ctx) return;

    // Deep Navy Gradient Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1400);
    gradient.addColorStop(0, "#071f31");
    gradient.addColorStop(0.4, "#0A3F61");
    gradient.addColorStop(1, "#041522");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 1400);

    // Accent line
    ctx.fillStyle = "#EF8619";
    ctx.fillRect(380, 50, 240, 6);

    // Studio & Event Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(studioName.toUpperCase(), 500, 120);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.fillText(eventName, 500, 180);

    // Header Call to Action
    ctx.fillStyle = "#EF8619";
    ctx.font = "bold 52px Inter, sans-serif";
    ctx.fillText("SCAN TO VIEW EVENT PHOTOS", 500, 280);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px Inter, sans-serif";
    ctx.fillText("AI Face Search • Bride & Groom Album Selection", 500, 325);

    // QR Card Container
    const cardX = 200;
    const cardY = 380;
    const cardSize = 600;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardSize, cardSize, 32);
    ctx.fill();

    // Draw QR Code
    const qrPad = 40;
    ctx.drawImage(canvas, cardX + qrPad, cardY + qrPad, cardSize - qrPad * 2, cardSize - qrPad * 2);

    // 7-Day Validity Pill on Card
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.roundRect(300, 1020, 400, 55, 28);
    ctx.fill();

    ctx.fillStyle = "#92400e";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.fillText(`⏳ 7 Days Validity: Until ${formattedExpiry}`, 500, 1056);

    // Instructions
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "22px Inter, sans-serif";
    ctx.fillText("1. Scan with Phone Camera  •  2. AI Face Scan  •  3. Download HD Photos", 500, 1140);
    ctx.fillText("👑 Bride & Groom: Select photos directly for Album printing", 500, 1180);

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "20px Inter, sans-serif";
    ctx.fillText("Powered by PhotoOS Intelligent Photography System", 500, 1330);

    // Download PNG
    const link = document.createElement("a");
    link.download = `Gallery-QR-${eventName.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.href = posterCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61] dark:bg-sky-950 dark:text-sky-400">
              <QrCode className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Event Gallery QR
                </h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  7-Day Validity
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Share with Bride, Groom, Family & Guests
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6">
          {/* QR Canvas Box */}
          <div className="flex justify-center">
            <div className="rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-md dark:border-slate-800">
              {galleryUrl ? (
                <QRCodeCanvas
                  ref={canvasRef}
                  value={galleryUrl}
                  size={240}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#0A3F61"
                />
              ) : (
                <div className="flex h-[240px] w-[240px] items-center justify-center text-sm text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Validity Indicator */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Valid for 7 Days (Until {formattedExpiry})</span>
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1 rounded-xl bg-amber-200/60 px-2.5 py-1 text-[11px] font-bold text-amber-900 transition hover:bg-amber-300/60 dark:bg-amber-900/50 dark:text-amber-200"
              title="Reset validity for 7 more days"
            >
              <RefreshCw className="h-3 w-3" />
              Renew
            </button>
          </div>

          {/* URL Box */}
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Access Link (With 7-Day Expiry)
            </p>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
              <div
                className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-slate-600 dark:text-slate-400"
                title={galleryUrl}
              >
                {galleryUrl}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0A3F61] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#08334f]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>

              <a
                href={galleryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                title="Open live gallery"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Download & Notice */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!galleryUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF8619] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#d97410]"
            >
              <Download className="h-4 w-4" />
              Download Printable QR Poster
            </button>

            <p className="text-center text-[11px] text-slate-400">
              🛡️ ७ दिवसांनंतर हा QR आपोआप एक्स्पायर होईल. गरज भासल्यास तुम्ही वरून &apos;Renew&apos; करू शकता.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
