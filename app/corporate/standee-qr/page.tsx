"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Check,
  Copy,
  Download,
  ExternalLink,
  Info,
  Palette,
  Printer,
  QrCode,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { CorporateShell } from "@/components/corporate/CorporateShell";
import {
  getCorporateCompany,
  getCorporateEvents,
  type CorporateCompany,
  type CorporateEvent,
} from "@/lib/corporate/corporate-service";

export default function CorporateStandeeQRPage() {
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get("eventId");

  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [theme, setTheme] = useState<"navy" | "slate" | "indigo" | "dark">("navy");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const comp = await getCorporateCompany();
      setCompany(comp);
      const evs = await getCorporateEvents(comp.id);
      setEvents(evs);

      if (urlEventId && evs.some((e) => e.id === urlEventId)) {
        setSelectedEventId(urlEventId);
      } else if (evs.length > 0) {
        setSelectedEventId(evs[0].id);
      }
    }
    void load();
  }, [urlEventId]);

  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  // Construct target live URL for scanning
  const qrTargetUrl = useMemo(() => {
    const clientAppUrl =
      process.env.NEXT_PUBLIC_CLIENT_APP_URL ||
      "https://ajit1311.github.io/photoos-app";
    const evId = selectedEventId || activeEvent?.id || "corp-event";
    const evName = activeEvent?.name || "Corporate Event";
    const compName = company?.name || "Corporate Office";
    return `${clientAppUrl}/?event=${encodeURIComponent(evId)}&name=${encodeURIComponent(evName)}&studio=${encodeURIComponent(compName)}&type=corporate`;
  }, [selectedEventId, activeEvent, company?.name]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadStandee = () => {
    // Find canvas in DOM
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a higher resolution standee export canvas
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1200;
    exportCanvas.height = 1600;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Fill Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1600);
    if (theme === "navy") {
      bgGradient.addColorStop(0, "#071D2E");
      bgGradient.addColorStop(0.5, "#0A3F61");
      bgGradient.addColorStop(1, "#041421");
    } else if (theme === "indigo") {
      bgGradient.addColorStop(0, "#1E1B4B");
      bgGradient.addColorStop(0.5, "#312E81");
      bgGradient.addColorStop(1, "#0F172A");
    } else if (theme === "slate") {
      bgGradient.addColorStop(0, "#0F172A");
      bgGradient.addColorStop(0.5, "#1E293B");
      bgGradient.addColorStop(1, "#020617");
    } else {
      bgGradient.addColorStop(0, "#000000");
      bgGradient.addColorStop(0.5, "#111827");
      bgGradient.addColorStop(1, "#000000");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 1600);

    // Header: Company Name
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((company?.name || "ENTERPRISE").toUpperCase(), 600, 140);

    // Event Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 52px sans-serif";
    ctx.fillText(activeEvent?.name || "Corporate Event 2026", 600, 220);

    // Subtitle
    ctx.fillStyle = "#94A3B8";
    ctx.font = "28px sans-serif";
    ctx.fillText(
      `📍 ${activeEvent?.location || "Corporate Office"} · ${activeEvent?.date || "Event Date"}`,
      600,
      270
    );

    // White QR Container Card
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(300, 360, 600, 600, 32);
    ctx.fill();

    // Draw QR image centered inside white card
    ctx.drawImage(canvas, 350, 410, 500, 500);

    // Badge underneath QR
    ctx.fillStyle = "#E0F2FE";
    ctx.beginPath();
    ctx.roundRect(380, 990, 440, 50, 25);
    ctx.fill();
    ctx.fillStyle = "#0369A1";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("✨ AI FACE MATCHING ENABLED", 600, 1023);

    // 3 Instructions
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("How to Get Your Event Photos:", 600, 1120);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText("1. Open phone camera & scan this QR code", 600, 1180);
    ctx.fillText("2. Take a quick 2-second selfie", 600, 1230);
    ctx.fillText("3. AI instantly finds all your candid photos", 600, 1280);

    // Footer
    ctx.fillStyle = "#64748B";
    ctx.font = "20px sans-serif";
    ctx.fillText("Powered by PhotoOS Enterprise · DPDP Compliant Biometric Delivery", 600, 1480);

    // Download trigger
    const link = document.createElement("a");
    link.download = `Standee_QR_${(activeEvent?.name || "Corporate_Event").replace(/\s+/g, "_")}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <CorporateShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Reception & Stage Standee
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Corporate Standee QR Generator
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Generate ready-to-print reception posters. Employees scan with their mobile camera to find their photos via instant AI selfie matching.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadStandee}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#072c44] transition-all"
            >
              <Download className="h-4 w-4" />
              Download Standee (PNG)
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Event Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                1. Select Corporate Event
              </h2>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.date})
                  </option>
                ))}
              </select>

              {activeEvent && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Event Type:</strong> {activeEvent.event_type}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Venue / City:</strong> {activeEvent.location}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Photos:</strong> {activeEvent.photos_count} captures
                  </p>
                </div>
              )}
            </div>

            {/* Standee Theme Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-sky-500" />
                2. Choose Poster Theme
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "navy", label: "Executive Navy", color: "bg-[#0A3F61]" },
                  { id: "indigo", label: "Corporate Indigo", color: "bg-[#312E81]" },
                  { id: "slate", label: "Modern Slate", color: "bg-[#1E293B]" },
                  { id: "dark", label: "Minimal Black", color: "bg-[#111827]" },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as any)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      theme === th.id
                        ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50 dark:bg-sky-950/30 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${th.color} shrink-0 border border-white/20`} />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Link & Share */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Direct Employee Access Link
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={qrTargetUrl}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <Link
                href={qrTargetUrl}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-50/50 py-2.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-950/60 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Live Employee View (Mobile Experience)
              </Link>
            </div>
          </div>

          {/* Standee Poster Live Visual Preview */}
          <div className="lg:col-span-7 flex justify-center">
            <div
              ref={qrRef}
              className={`w-full max-w-[440px] rounded-3xl p-7 shadow-2xl text-center relative overflow-hidden transition-all ${
                theme === "navy"
                  ? "bg-gradient-to-b from-[#071D2E] via-[#0A3F61] to-[#041421] text-white"
                  : theme === "indigo"
                  ? "bg-gradient-to-b from-[#1E1B4B] via-[#312E81] to-[#0F172A] text-white"
                  : theme === "slate"
                  ? "bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#020617] text-white"
                  : "bg-gradient-to-b from-[#000000] via-[#111827] to-[#000000] text-white"
              }`}
            >
              {/* Top Company Badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur border border-white/20">
                  <Building2 className="h-4 w-4 text-sky-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  {company?.name || "ENTERPRISE"}
                </span>
              </div>

              {/* Event Name */}
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {activeEvent?.name || "Corporate Event"}
              </h2>

              <p className="mt-1 text-xs text-slate-300">
                📍 {activeEvent?.location || "Corporate Office"} · {activeEvent?.date || "2026"}
              </p>

              {/* QR Container White Card */}
              <div className="my-6 mx-auto w-64 rounded-3xl bg-white p-5 shadow-2xl flex flex-col items-center">
                <QRCodeCanvas
                  value={qrTargetUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-800">
                  <Sparkles className="h-3 w-3 text-sky-600" />
                  AI Face Match Ready
                </div>
              </div>

              {/* 3 Step Instructions */}
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur text-left space-y-2 mb-4">
                <p className="text-xs font-bold text-sky-300 text-center uppercase tracking-wider">
                  How to Get Your Event Photos
                </p>
                <div className="text-xs text-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
                      1
                    </span>
                    <span>Scan this QR code with your phone camera</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
                      2
                    </span>
                    <span>Snap a quick 2-second selfie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
                      3
                    </span>
                    <span>AI instantly finds all your photos</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>PhotoOS Enterprise · 100% DPDP Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CorporateShell>
  );
}

