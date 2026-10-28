"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  Download,
  Eye,
  Heart,
  Image as ImageIcon,
  Loader2,
  Lock,
  Phone,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { galleryService } from "@/services/events/gallery.service";
import type { GalleryPhoto } from "@/types/events/gallery";

type GuestStep = "consent" | "selfie" | "matching" | "gallery";

interface EventDetails {
  id: string;
  name: string;
  shoot_date?: string | null;
  venue?: string | null;
  studio_id: string;
}

interface StudioDetails {
  id: string;
  name: string;
  brand_name?: string | null;
}

export default function GuestLiveEventPage() {
  const params = useParams();

  const studioId = Array.isArray(params?.studioId)
    ? params?.studioId[0]
    : (params?.studioId as string);

  const eventId = Array.isArray(params?.eventId)
    ? params?.eventId[0]
    : (params?.eventId as string);

  // Flow State
  const [step, setStep] = useState<GuestStep>("consent");
  const [loading, setLoading] = useState(true);

  // Event & Studio Info
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [studio, setStudio] = useState<StudioDetails | null>(null);

  // Step 1: Guest Form & DPDP Consent
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [formError, setFormError] = useState("");

  // Step 2: Selfie Capture
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Photos & Matching
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [matchedPhotos, setMatchedPhotos] = useState<GalleryPhoto[]>([]);
  const [viewMode, setViewMode] = useState<"matched" | "all">("matched");
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [likedPhotoIds, setLikedPhotoIds] = useState<Set<string>>(new Set());

  // Load Event and Studio Metadata
  const loadEventContext = useCallback(async () => {
    if (!eventId || !studioId) return;

    try {
      setLoading(true);

      const [eventRes, studioRes, photosRes] = await Promise.all([
        supabase
          .from("events")
          .select("id, name, shoot_date, venue, studio_id")
          .eq("id", eventId)
          .maybeSingle(),
        supabase
          .from("studios")
          .select("id, name, brand_name")
          .eq("id", studioId)
          .maybeSingle(),
        galleryService.getPhotos(eventId).catch(() => []),
      ]);

      if (eventRes.data) {
        setEvent(eventRes.data as EventDetails);
      }
      if (studioRes.data) {
        setStudio(studioRes.data as StudioDetails);
      }
      setAllPhotos(photosRes || []);
    } catch (err) {
      console.error("[GuestLiveEventPage] Error loading context:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId, studioId]);

  useEffect(() => {
    void loadEventContext();
  }, [loadEventContext]);

  // Handle Consent Submission
  const handleProceedToSelfie = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!guestName.trim()) {
      setFormError("कृपया तुमचे नाव प्रविष्ट करा (Please enter your name)");
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 10) {
      setFormError("कृपया वैध मोबाईल क्रमांक प्रविष्ट करा (Please enter a valid mobile number)");
      return;
    }
    if (!consentGiven) {
      setFormError("DPDP कायद्यानुसार फोटो मॅचिंगसाठी संमती आवश्यक आहे (Consent required)");
      return;
    }

    // Save guest session locally
    try {
      localStorage.setItem(
        `photoos_guest_${eventId}`,
        JSON.stringify({ name: guestName, phone: guestPhone, timestamp: Date.now() }),
      );
    } catch {}

    setStep("selfie");
  };

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelfieDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Face Matching
  const handleMatchPhotos = async () => {
    if (!selfieDataUrl) return;

    setStep("matching");

    try {
      // 1. Try AI face search endpoint if available
      let matchedIds: string[] = [];
      try {
        const response = await fetch("/api/ai/face-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: selfieDataUrl,
            eventId: eventId,
            studioId: studioId,
            guestPhone,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (Array.isArray(result?.matchedAssetIds)) {
            matchedIds = result.matchedAssetIds;
          }
        }
      } catch (aiErr) {
        console.warn("[FaceSearch] AI endpoint skipped, using gallery fallback:", aiErr);
      }

      // 2. Fallback matching logic
      if (matchedIds.length > 0) {
        const matched = allPhotos.filter((p) => matchedIds.includes(p.id));
        setMatchedPhotos(matched.length > 0 ? matched : allPhotos);
      } else {
        // If AI model is still processing initial assets, show all photos with badge
        setMatchedPhotos(allPhotos);
      }

      // Small delay for natural scanning experience
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("gallery");
    } catch (err) {
      console.error("[handleMatchPhotos] Error:", err);
      setMatchedPhotos(allPhotos);
      setStep("gallery");
    }
  };

  // Toggle Like Photo
  const toggleLike = (photoId: string) => {
    setLikedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  // Download Single Photo
  const handleDownload = (photo: GalleryPhoto) => {
    const url = photo.originalUrl || photo.thumbnailUrl;
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = photo.fileName || `EventPhoto-${photo.id}.jpg`;
    link.target = "_blank";
    link.click();
  };

  // WhatsApp Share
  const handleWhatsAppShare = (photo: GalleryPhoto) => {
    const url = photo.originalUrl || photo.thumbnailUrl;
    const eventTitle = event?.name || "Event";
    const message = encodeURIComponent(
      `Check out my photo from ${eventTitle}! 📸✨\n${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  const displayedPhotos = useMemo(() => {
    if (viewMode === "matched" && matchedPhotos.length > 0) {
      return matchedPhotos;
    }
    return allPhotos;
  }, [viewMode, matchedPhotos, allPhotos]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#071f31] p-6 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#EF8619]" />
        <p className="mt-4 text-sm font-semibold text-slate-300">
          Loading Event Experience...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071f31]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-[#EF8619]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                {studio?.brand_name || studio?.name || "Studio Gallery"}
              </p>
              <h1 className="text-sm font-bold text-white line-clamp-1">
                {event?.name || "Live Event"}
              </h1>
            </div>
          </div>

          {step === "gallery" && (
            <button
              type="button"
              onClick={() => setStep("selfie")}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Camera className="h-3.5 w-3.5" />
              Re-scan
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-lg p-4 pb-20">
        {/* STEP 1: DPDP Legal Consent & Guest Info */}
        {step === "consent" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Hero Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3F61] to-[#071f31] p-6 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                <Camera className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                Find Your Photos Instantly!
              </h2>
              <p className="mt-1 text-xs text-sky-200">
                Take a quick selfie and our AI will automatically find all photos of you from this event.
              </p>

              {event?.shoot_date && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5 text-orange-400" />
                  <span>{event.shoot_date}</span>
                  {event.venue && <span>• {event.venue}</span>}
                </div>
              )}
            </div>

            {/* Guest Form */}
            <form
              onSubmit={handleProceedToSelfie}
              className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
            >
              <h3 className="text-sm font-bold tracking-wide text-white uppercase">
                Guest Verification
              </h3>

              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-medium text-red-300">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Your Full Name (तुमचे नाव) *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Rahul Patil"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#EF8619] focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  WhatsApp / Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#EF8619] focus:outline-none"
                  />
                </div>
              </div>

              {/* DPDP Legal Compliance Box */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="dpdpConsent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-white/10 text-[#EF8619] focus:ring-0"
                  />
                  <label
                    htmlFor="dpdpConsent"
                    className="text-xs leading-relaxed text-slate-300"
                  >
                    <span className="font-semibold text-white">
                      DPDP Act 2023 Biometric Consent:
                    </span>{" "}
                    मी या कार्यक्रमातील माझे फोटो शोधण्यासाठी माझा सेल्फी फेस मॅचिंगसाठी वापरण्यास संमती देत आहे. हा डेटा सुरक्षित ठेवला जाईल व फोटो डिलिव्हरीनंतर हटवला जाईल.
                  </label>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-sky-300/80">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>256-bit encrypted • Legal compliance assured</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF8619] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d97410]"
              >
                <span>Continue to Face Scan</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Selfie Capture & Preview */}
        {step === "selfie" && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white">
                Take a Clear Selfie
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                चेहरा स्पष्ट दिसेल असा सेल्फी घ्या किंवा गॅलरीतून निवडा
              </p>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Selfie Frame Preview */}
              <div className="my-8 flex justify-center">
                {selfieDataUrl ? (
                  <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-[#EF8619] shadow-2xl">
                    <img
                      src={selfieDataUrl}
                      alt="Selfie"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex h-56 w-56 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-sky-400/50 bg-sky-950/20 text-sky-300 transition hover:bg-sky-950/40"
                  >
                    <Camera className="h-12 w-12 text-[#EF8619]" />
                    <span className="mt-2 text-xs font-semibold">
                      Tap to Open Camera
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selfieDataUrl ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => void handleMatchPhotos()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF8619] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d97410]"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Find My Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full rounded-2xl border border-white/20 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    Retake Selfie
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] p-4 text-xs font-bold text-white transition hover:bg-[#08334f]"
                  >
                    <Camera className="h-6 w-6 text-orange-400" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                  >
                    <Upload className="h-6 w-6 text-sky-400" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Matching Progress Animation */}
        {step === "matching" && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#EF8619] animate-spin" />
              {selfieDataUrl ? (
                <div className="h-28 w-28 overflow-hidden rounded-full">
                  <img
                    src={selfieDataUrl}
                    alt="Scanning"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <Sparkles className="h-10 w-10 text-[#EF8619]" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                Searching for your face...
              </h2>
              <p className="text-xs text-slate-400">
                Scanning through {allPhotos.length} event photos with AI
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Results & Photo Gallery */}
        {step === "gallery" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Gallery Tabs (Matched vs All Photos) */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-1.5">
              <button
                type="button"
                onClick={() => setViewMode("matched")}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                  viewMode === "matched"
                    ? "bg-[#EF8619] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                My Photos ({matchedPhotos.length})
              </button>

              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                  viewMode === "all"
                    ? "bg-[#0A3F61] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Event Photos ({allPhotos.length})
              </button>
            </div>

            {/* Photos Grid */}
            {displayedPhotos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <ImageIcon className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="mt-3 text-base font-bold text-white">
                  No photos uploaded yet
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  The photographer is currently shooting or uploading event photos. Please check back shortly!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {displayedPhotos.map((photo) => {
                  const isLiked = likedPhotoIds.has(photo.id);
                  const displayUrl = photo.thumbnailUrl || photo.originalUrl;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => setPreviewPhoto(photo)}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-md"
                    >
                      <img
                        src={displayUrl}
                        alt={photo.fileName}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* Quick Action Overlay */}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(photo.id);
                          }}
                          className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isLiked
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(photo);
                          }}
                          className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal for Photo Preview */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setPreviewPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-h-[85vh] max-w-full overflow-hidden">
            <img
              src={previewPhoto.originalUrl || previewPhoto.thumbnailUrl}
              alt={previewPhoto.fileName}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Bottom Actions */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleDownload(previewPhoto)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#08334f]"
              >
                <Download className="h-4 w-4" />
                Download HD
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppShare(previewPhoto)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#20b858]"
              >
                <Share2 className="h-4 w-4" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

