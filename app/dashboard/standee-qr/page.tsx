"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Info,
  Loader2,
  QrCode,
  Radio,
  RefreshCw,
  Sparkles,
  Unlink,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { useBootstrapContext } from "@/context/BootstrapContext";
import { getEvents } from "@/lib/api/events";
import {
  getStudioStandee,
  linkEventToStandee,
  type StudioStandee,
} from "@/lib/api/standee";
import type { Event } from "@/types/api/event";

export default function StandeeQRPage() {
  const { data: bootstrap, loading: bootstrapLoading } = useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.studio?.id ||
    bootstrap?.workspace?.membership?.studioId ||
    "";
  const studioName =
    bootstrap?.workspace?.studio?.name || "Your Photo Studio";

  const [standee, setStandee] = useState<StudioStandee | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const standeeUrl = useMemo(() => {
    if (!studioId) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/live/${studioId}`;
    }
    return `https://app.photoos.in/live/${studioId}`;
  }, [studioId]);

  const loadData = useCallback(async () => {
    if (!studioId) return;
    try {
      setLoading(true);
      const [standeeData, eventsData] = await Promise.all([
        getStudioStandee(studioId),
        getEvents(studioId),
      ]);

      setStandee(standeeData);
      setEvents(eventsData || []);
      if (standeeData?.active_event_id) {
        setSelectedEventId(standeeData.active_event_id);
      }
    } catch (err) {
      console.error("[StandeeQRPage] Failed to load standee data:", err);
    } finally {
      setLoading(false);
    }
  }, [studioId]);

  useEffect(() => {
    if (studioId) {
      void loadData();
    }
  }, [studioId, loadData]);

  // Copy standee URL to clipboard
  const handleCopyLink = useCallback(async () => {
    if (!standeeUrl) return;
    try {
      await navigator.clipboard.writeText(standeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  }, [standeeUrl]);

  // Link selected event to the standee
  const handleLinkEvent = useCallback(
    async (eventIdToLink: string | null) => {
      if (!studioId) return;
      try {
        setSaving(true);
        setFeedbackMessage(null);

        const res = await linkEventToStandee(studioId, eventIdToLink);
        if (res.success) {
          setSelectedEventId(eventIdToLink || "");
          const updatedStandee = await getStudioStandee(studioId);
          setStandee(updatedStandee);

          const linkedEvent = events.find((e) => e.id === eventIdToLink);
          setFeedbackMessage({
            type: "success",
            text: eventIdToLink
              ? `Standee successfully linked to "${linkedEvent?.name || "Event"}"! Anyone scanning the QR will now view this event.`
              : "Standee has been unlinked. The QR is now idle.",
          });
        } else {
          setFeedbackMessage({
            type: "error",
            text: res.error || "Failed to update standee link.",
          });
        }
      } catch (err) {
        setFeedbackMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Error updating standee.",
        });
      } finally {
        setSaving(false);
      }
    },
    [studioId, events],
  );

  // Download Standee Poster image
  const handleDownloadPoster = useCallback(() => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) return;

    // Create a 1200 x 1800 high-res printable poster
    const posterCanvas = document.createElement("canvas");
    posterCanvas.width = 1200;
    posterCanvas.height = 1800;
    const ctx = posterCanvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient (Deep Navy / Brand Blue)
    const gradient = ctx.createLinearGradient(0, 0, 0, 1800);
    gradient.addColorStop(0, "#071f31");
    gradient.addColorStop(0.3, "#0A3F61");
    gradient.addColorStop(1, "#041522");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 1800);

    // Decorative Header Accent
    ctx.fillStyle = "#EF8619";
    ctx.fillRect(450, 60, 300, 8);

    // Studio Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(studioName.toUpperCase(), 600, 150);

    // Subtitle
    ctx.fillStyle = "#94a3b8";
    ctx.font = "30px Inter, sans-serif";
    ctx.fillText("OFFICIAL PHOTOGRAPHY PARTNER", 600, 205);

    // Big Catchy Title
    ctx.fillStyle = "#EF8619";
    ctx.font = "bold 66px Inter, sans-serif";
    ctx.fillText("FIND YOUR PHOTOS", 600, 340);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 44px Inter, sans-serif";
    ctx.fillText("AI Face Recognition Gallery", 600, 405);

    // White Card for QR code
    const cardX = 225;
    const cardY = 480;
    const cardSize = 750;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardSize, cardSize, 36);
    ctx.fill();

    // Draw the QR Code in the center of the card
    const qrMargin = 50;
    ctx.drawImage(
      qrCanvas,
      cardX + qrMargin,
      cardY + qrMargin,
      cardSize - qrMargin * 2,
      cardSize - qrMargin * 2,
    );

    // Instruction Steps under QR
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Inter, sans-serif";
    ctx.fillText("HOW IT WORKS", 600, 1330);

    const steps = [
      "1. Scan this QR Code with your phone camera",
      "2. Take a quick selfie for AI face matching",
      "3. Instantly view & download all your event photos!",
    ];

    ctx.font = "30px Inter, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    steps.forEach((step, index) => {
      ctx.fillText(step, 600, 1400 + index * 60);
    });

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "24px Inter, sans-serif";
    ctx.fillText("Powered by PhotoOS • Intelligent Photography System", 600, 1720);

    // Trigger download
    const link = document.createElement("a");
    link.download = `Standee-QR-${studioName.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.href = posterCanvas.toDataURL("image/png");
    link.click();
  }, [studioName]);

  const activeEvent = useMemo(() => {
    if (!standee?.active_event_id) return null;
    return (
      events.find((e) => e.id === standee.active_event_id) ||
      standee.active_event ||
      null
    );
  }, [standee, events]);

  if (bootstrapLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A3F61]" />
        <p className="text-sm font-medium text-slate-500">
          Loading Dynamic Standee QR...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-950/50">
              <QrCode className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Dynamic Standee QR
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Print once, use forever. Dynamically link any event to this standee at venue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`rounded-2xl p-4 text-sm font-medium shadow-sm transition ${
            feedbackMessage.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Standee Preview vs Event Linking */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Standee Card & QR Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Standee Poster Preview Header */}
            <div className="relative bg-gradient-to-br from-[#071f31] via-[#0A3F61] to-[#041522] p-6 text-center text-white">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-orange-300 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                OFFICIAL STANDEE QR
              </div>
              <h3 className="mt-3 text-xl font-bold uppercase tracking-wider">
                {studioName}
              </h3>
              <p className="mt-1 text-xs text-sky-200">
                AI Face Match Photo Gallery
              </p>

              {/* Status Pill */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3.5 py-1.5 text-xs font-medium">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeEvent
                      ? "animate-pulse bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />
                <span>
                  {activeEvent
                    ? `Live: ${activeEvent.name}`
                    : "Standee Idle (No Event Linked)"}
                </span>
              </div>
            </div>

            {/* QR Canvas Box */}
            <div className="flex flex-col items-center justify-center p-8">
              <div className="rounded-2xl border-4 border-slate-100 bg-white p-4 shadow-md dark:border-slate-800">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={standeeUrl || "https://app.photoos.in"}
                  size={260}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Permanent Live Standee URL:
                </p>
                <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {standeeUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08334f]"
                >
                  <Download className="h-4 w-4" />
                  Download Poster
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>

                <a
                  href={standeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  title="Open live standee page"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Event Selector & Instructions */}
        <div className="space-y-6 lg:col-span-7">
          {/* Active Event Overview Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Currently Linked Event
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              When guests scan your printed standee right now, this is where they land.
            </p>

            {activeEvent ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live on Standee
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeEvent.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      {((activeEvent as any).shoot_date || (activeEvent as any).shootDate) && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {(activeEvent as any).shoot_date || (activeEvent as any).shootDate}
                        </span>
                      )}
                      {activeEvent.venue && <span>• {activeEvent.venue}</span>}
                      <span>• Status: {activeEvent.status}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleLinkEvent(null)}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Unlink
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  No Event Currently Linked
                </p>
                <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                  Select an event from the list below and click &quot;Link to Standee&quot; to activate it.
                </p>
              </div>
            )}
          </div>

          {/* Event Switcher List */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Switch Active Event
                </h2>
                <p className="text-xs text-slate-500">
                  Choose today&apos;s live event. Old events will be detached automatically.
                </p>
              </div>

              <Link
                href="/dashboard/events"
                className="text-xs font-semibold text-[#0A3F61] hover:underline dark:text-sky-400"
              >
                + Create New Event
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No events found
                </p>
                <p className="text-xs text-slate-500">
                  Create an event in the Events page first to link it to your standee.
                </p>
                <Link
                  href="/dashboard/events"
                  className="mt-4 inline-flex items-center rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-semibold text-white shadow"
                >
                  Go to Events
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {events.map((event) => {
                  const isCurrent = standee?.active_event_id === event.id;
                  const isSelected = selectedEventId === event.id;

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                        isSelected
                          ? "border-[#0A3F61] bg-sky-50/50 shadow-sm dark:border-sky-500 dark:bg-sky-950/20"
                          : "border-slate-200 hover:border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-[#0A3F61] bg-[#0A3F61] text-white dark:border-sky-500 dark:bg-sky-500"
                              : "border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {event.name}
                            </span>
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                            {((event as any).shoot_date || (event as any).shootDate) && (
                              <span>📅 {(event as any).shoot_date || (event as any).shootDate}</span>
                            )}
                            {event.venue && <span>📍 {event.venue}</span>}
                          </div>
                        </div>
                      </div>

                      {isSelected && !isCurrent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleLinkEvent(event.id);
                          }}
                          disabled={saving}
                          className="rounded-xl bg-[#0A3F61] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#08334f]"
                        >
                          {saving ? "Linking..." : "Activate Event"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Educational Marathi & English Explainer */}
          <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="space-y-2 text-xs leading-relaxed text-blue-900 dark:text-blue-200">
                <p className="font-bold text-sm">
                  🎯 डायनॅमिक स्टँडी QR कशी काम करते? (How it works)
                </p>
                <p>
                  <strong>१. एकच QR कायमस्वरूपी प्रिंट करा:</strong> तुम्ही वरील स्टँडी पोस्टर एकदाच प्रिंट करून तुमच्या मेटल किंवा लाकडी स्टँडीवर लावू शकता. हा QR कधीही बदलत नाही.
                </p>
                <p>
                  <strong>२. दररोज इव्हेंट बदला:</strong> आज जर &apos;राहुल वेडींग&apos; असेल तर वरील यादीतून ते निवडून &apos;Activate Event&apos; दाबा. उद्या &apos;पूजा वाढदिवस&apos; असेल तर फक्त तो इव्हेंट निवडा. जुनी लिंक आपोआप काढली जाईल!
                </p>
                <p>
                  <strong>३. थेट मोबाईल वेब ॲक्सेस (No App Required):</strong> पाहुण्यांना ॲप डाऊनलोड करण्याची गरज नाही. QR स्कॅन करताच ते थेट ब्राउझरमध्ये येतील, सेल्फी काढून त्यांचे फोटो शोधू शकतील.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
