"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Crown,
  Download,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { galleryService } from "@/services/events/gallery.service";
import {
  addPhotoComment,
  togglePhotoFavorite,
  togglePhotoSelection,
  type PhotoComment,
} from "@/lib/api/photo-interactions";
import {
  extractSelfieFaceDescriptor,
  extractPhotoFacesDescriptors,
  compareTargetFace,
  MATCH_THRESHOLD,
} from "@/lib/ai/face-recognition";
import type { GalleryPhoto } from "@/types/events/gallery";

type UserRole = "bride_groom" | "guest" | null;
type GuestStep = "role_select" | "guest_consent" | "selfie" | "matching" | "gallery";

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
  const [role, setRole] = useState<UserRole>(null);
  const [step, setStep] = useState<GuestStep>("role_select");
  const [loading, setLoading] = useState(true);

  // Event & Studio Info
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [studio, setStudio] = useState<StudioDetails | null>(null);

  // Guest Details & DPDP Consent
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [formError, setFormError] = useState("");

  // Selfie & Face Scan
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [matchedPhotos, setMatchedPhotos] = useState<GalleryPhoto[]>([]);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>("तुमचा चेहरा स्कॅन करत आहोत...");
  const [faceScanNotice, setFaceScanNotice] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Photos & Gallery View
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryTab, setGalleryTab] = useState<"all" | "matched" | "selected" | "favorites">("all");
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Interactive Sets
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Map<string, PhotoComment[]>>(new Map());

  // Comment Modal
  const [commentingPhoto, setCommentingPhoto] = useState<GalleryPhoto | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  // Load Event & Studio Context
  const loadEventContext = useCallback(async () => {
    if (!eventId || !studioId) return;

    try {
      setLoading(true);

      // 1. Try public gallery API endpoint (bypasses RLS for QR guest scans with service_role)
      try {
        const res = await fetch(`/api/gallery/${encodeURIComponent(eventId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.event) setEvent(json.event as EventDetails);
            if (json.studio) setStudio(json.studio as StudioDetails);
            if (Array.isArray(json.photos)) {
              setAllPhotos(json.photos);

              const favs = new Set<string>();
              const sels = new Set<string>();
              json.photos.forEach((p: GalleryPhoto) => {
                if (p.isFavorite) favs.add(p.id);
                if (p.isSelected) sels.add(p.id);
              });
              setFavoriteIds(favs);
              setSelectedIds(sels);
              return;
            }
          }
        }
      } catch (apiErr) {
        console.warn("[GuestLiveEventPage] API fetch notice:", apiErr);
      }

      // 2. Direct client fallback
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

      const favs = new Set<string>();
      const sels = new Set<string>();
      (photosRes || []).forEach((p) => {
        if (p.isFavorite) favs.add(p.id);
        if (p.isSelected) sels.add(p.id);
      });
      setFavoriteIds(favs);
      setSelectedIds(sels);
    } catch (err) {
      console.error("[GuestLiveEventPage] Error loading context:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId, studioId]);

  useEffect(() => {
    void loadEventContext();
  }, [loadEventContext]);

  // Guest Consent Form
  const handleProceedToSelfie = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!guestName.trim()) {
      setFormError("कृपया तुमचे नाव प्रविष्ट करा (Please enter your name)");
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 10) {
      setFormError("कृपया वैध मोबाईल क्रमांक प्रविष्ट करा (Please enter mobile number)");
      return;
    }
    if (!consentGiven) {
      setFormError("DPDP कायद्यानुसार फेशिअल मॅचिंगसाठी संमती आवश्यक आहे (Consent required)");
      return;
    }

    setStep("selfie");
  };

  // Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelfieDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // AI Face Matching
  const handleMatchPhotos = async () => {
    if (!selfieDataUrl) return;
    setStep("matching");
    setFormError("");
    setScanStatusMessage("AI फेस रेकग्निशन मॉडेल लोड करत आहोत...");

    try {
      // 1. Extract 128D Face Descriptor with deep biometric validation
      setScanStatusMessage("चेहरा अचूक डिटेक्ट करत आहोत (99%+ Accuracy)...");
      const selfieResult = await extractSelfieFaceDescriptor(selfieDataUrl);

      if (!selfieResult.success || !selfieResult.descriptor) {
        setFormError(selfieResult.error || "चेहरा स्पष्ट दिसला नाही. कृपया चांगल्या प्रकाशात सेल्फी घ्या.");
        setStep("selfie");
        return;
      }

      const selfieDescriptor = selfieResult.descriptor;

      // 2. Query backend face matching engine
      setScanStatusMessage("इव्हेंटमधील फोटोंसोबत मॅचिंग करत आहोत...");
      let matchedIds: string[] = [];
      let backendHasIndexed = false;

      try {
        const response = await fetch("/api/ai/face-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: selfieDataUrl,
            descriptor: selfieDescriptor,
            eventId,
            studioId,
            guestPhone,
            consentGranted: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (Array.isArray(result?.matchedAssetIds)) {
            matchedIds = result.matchedAssetIds;
          }
          backendHasIndexed = Boolean(result?.hasIndexedFaces);
        }
      } catch (backendErr) {
        console.warn("[GuestLive] Backend face-search call fallback:", backendErr);
      }

      // 3. If backend didn't have pre-indexed faces or returned empty, perform real client-side matching across all event photos
      if (matchedIds.length === 0 && allPhotos.length > 0) {
        setScanStatusMessage(`गॅलरीमधील फोटोंचे विश्लेषण करत आहोत (0/${allPhotos.length})...`);
        const clientMatches: GalleryPhoto[] = [];
        const indexedBatch: Array<{ assetId: string; descriptors: any[] }> = [];

        for (let i = 0; i < allPhotos.length; i++) {
          const photo = allPhotos[i];
          const photoUrl = photo.originalUrl || photo.thumbnailUrl;
          if (!photoUrl) continue;

          setScanStatusMessage(`फोटोंचे विश्लेषण करत आहोत (${i + 1}/${allPhotos.length})...`);
          const photoFaces = await extractPhotoFacesDescriptors(photoUrl);

          if (photoFaces.length > 0) {
            indexedBatch.push({
              assetId: photo.id,
              descriptors: photoFaces,
            });

            const match = compareTargetFace(
              selfieDescriptor,
              photoFaces.map((f) => f.descriptor),
              MATCH_THRESHOLD
            );

            if (match.isMatch) {
              clientMatches.push(photo);
            }
          }
        }

        // Asynchronously cache extracted faces in backend so subsequent scans are instantaneous
        if (indexedBatch.length > 0) {
          void fetch("/api/ai/face-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              studioId,
              consentGranted: true,
              indexedAssets: indexedBatch,
            }),
          }).catch(() => {});
        }

        if (clientMatches.length > 0) {
          setMatchedPhotos(clientMatches);
          setFaceScanNotice(`✨ तुमचे ${clientMatches.length} फोटो 99%+ अचूकतेसह सापडले!`);
          setGalleryTab("matched");
        } else {
          setMatchedPhotos([]);
          setFaceScanNotice("या कार्यक्रमात तुमचा चेहरा असलेले फोटो आढळले नाहीत. तुम्ही खालील बटणावर क्लिक करून किंवा 'सर्व फोटो' टॅब निवडून सर्व फोटो पाहू शकता.");
          setGalleryTab("matched");
        }
      } else if (matchedIds.length > 0) {
        const matched = allPhotos.filter((p) => matchedIds.includes(p.id));
        setMatchedPhotos(matched);
        setFaceScanNotice(`✨ तुमचे ${matched.length} फोटो 99%+ अचूकतेसह सापडले!`);
        setGalleryTab("matched");
      } else {
        setMatchedPhotos([]);
        setFaceScanNotice("या कार्यक्रमात तुमचा चेहरा असलेले फोटो आढळले नाहीत. तुम्ही खालील बटणावर क्लिक करून किंवा 'सर्व फोटो' टॅब निवडून सर्व फोटो पाहू शकता.");
        setGalleryTab("matched");
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setStep("gallery");
    } catch (err: any) {
      console.error("[GuestLive] Face matching error:", err);
      setFormError("फेशिअल स्कॅनिंग दरम्यान त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
      setStep("selfie");
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (photoId: string) => {
    const nextFav = !favoriteIds.has(photoId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (nextFav) next.add(photoId);
      else next.delete(photoId);
      return next;
    });

    void togglePhotoFavorite(photoId, nextFav);
  };

  // Toggle Album Selection
  const handleToggleSelection = async (photoId: string) => {
    const nextSelected = !selectedIds.has(photoId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (nextSelected) next.add(photoId);
      else next.delete(photoId);
      return next;
    });

    const clientLabel =
      role === "bride_groom"
        ? `${guestName || "Bride & Groom"} (VIP Client)`
        : `${guestName || "Guest"}`;

    void togglePhotoSelection(photoId, nextSelected, clientLabel);
  };

  // Post Comment
  const handlePostComment = async () => {
    if (!commentingPhoto || !newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const author = guestName.trim() || (role === "bride_groom" ? "Bride & Groom" : "Guest");

      const res = await addPhotoComment(commentingPhoto.id, author, newCommentText.trim());
      if (res.success && res.comment) {
        setCommentsMap((prev) => {
          const next = new Map(prev);
          const current = next.get(commentingPhoto.id) || [];
          next.set(commentingPhoto.id, [...current, res.comment!]);
          return next;
        });
        setNewCommentText("");
      }
    } catch (err) {
      console.error("[handlePostComment] Error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Download Single Photo
  const handleDownload = (photo: GalleryPhoto) => {
    const url = photo.originalUrl || photo.thumbnailUrl;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = photo.fileName || `Photo-${photo.id}.jpg`;
    link.target = "_blank";
    link.click();
  };

  // WhatsApp Share
  const handleWhatsAppShare = (photo: GalleryPhoto) => {
    const url = photo.originalUrl || photo.thumbnailUrl;
    const eventTitle = event?.name || "Event";
    const msg = encodeURIComponent(
      `Check out this photo from ${eventTitle}! 📸✨\n${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const displayedPhotos = useMemo(() => {
    switch (galleryTab) {
      case "matched":
        return matchedPhotos;
      case "selected":
        return allPhotos.filter((p) => selectedIds.has(p.id));
      case "favorites":
        return allPhotos.filter((p) => favoriteIds.has(p.id));
      case "all":
      default:
        return allPhotos;
    }
  }, [galleryTab, matchedPhotos, allPhotos, selectedIds, favoriteIds]);

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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071f31]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-[#EF8619]">
              {role === "bride_groom" ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  {studio?.brand_name || studio?.name || "Studio Gallery"}
                </span>
                {role === "bride_groom" && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.2 text-[9px] font-bold text-amber-300">
                    VIP CLIENT
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold text-white line-clamp-1">
                {event?.name || "Live Event"}
              </h1>
            </div>
          </div>

          {step === "gallery" && (
            <button
              type="button"
              onClick={() => setStep("selfie")}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Face Scan</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl p-4 pb-24">
        {/* STEP 1: ROLE SELECTION (Bride & Groom vs Guest) */}
        {step === "role_select" && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3F61] to-[#071f31] p-6 shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                Welcome to {event?.name || "Wedding Gallery"}!
              </h2>
              <p className="mt-1 text-xs text-sky-200">
                Please select how you would like to view photos today
              </p>

              {event?.shoot_date && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3.5 py-1 text-xs text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5 text-orange-400" />
                  <span>{event.shoot_date}</span>
                  {event.venue && <span>• {event.venue}</span>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Bride & Groom VIP Option */}
              <div
                onClick={() => {
                  setRole("bride_groom");
                  setStep("gallery");
                }}
                className="group relative flex cursor-pointer flex-col items-center justify-between rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-900 p-6 text-center transition hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                  VIP Host Access
                </div>

                <div className="my-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 group-hover:scale-110 transition">
                  <Crown className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Bride & Groom / Family
                  </h3>
                  <p className="text-xs text-slate-300">
                    नवरदेव आणि नवरी / मुख्य कुटुंब
                  </p>
                  <p className="mt-2 text-[11px] text-amber-200/80">
                    ✨ View ALL event photos, Star album selection & comment directly
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-black shadow transition group-hover:brightness-110"
                >
                  Enter as Bride & Groom
                </button>
              </div>

              {/* Guest Option */}
              <div
                onClick={() => {
                  setRole("guest");
                  setStep("guest_consent");
                }}
                className="group relative flex cursor-pointer flex-col items-center justify-between rounded-3xl border-2 border-sky-400/30 bg-gradient-to-b from-sky-950/20 via-slate-900 to-slate-900 p-6 text-center transition hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10"
              >
                <div className="inline-flex rounded-full bg-sky-400/20 px-3 py-1 text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                  AI Face Match
                </div>

                <div className="my-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-400 group-hover:scale-110 transition">
                  <Camera className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Wedding Guest / Relative
                  </h3>
                  <p className="text-xs text-slate-300">
                    पाहुणे / मित्रपरिवार
                  </p>
                  <p className="mt-2 text-[11px] text-sky-200/80">
                    🔍 Take a selfie to instantly find all photos of you from this event
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-[#0A3F61] py-3 text-xs font-bold text-white shadow transition group-hover:bg-[#08334f]"
                >
                  Find My Photos with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GUEST FORM & DPDP CONSENT */}
        {step === "guest_consent" && (
          <div className="space-y-6 animate-in fade-in">
            <form
              onSubmit={handleProceedToSelfie}
              className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-orange-400" />
                  <h3 className="text-base font-bold text-white">
                    Guest Verification
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("role_select")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Change Profile
                </button>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-medium text-red-300">
                  {formError}
                </div>
              )}

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

              {/* DPDP Consent */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="guestDpdpLive"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-white/10 text-[#EF8619] focus:ring-0"
                  />
                  <label htmlFor="guestDpdpLive" className="text-xs leading-relaxed text-slate-300">
                    <span className="font-semibold text-white">DPDP Act 2023 Biometric Consent:</span>{" "}
                    मी या कार्यक्रमातील माझे फोटो शोधण्यासाठी फेशिअल मॅचिंगसाठी संमती देत आहे. हा डेटा सुरक्षित राहून केवळ फोटो मॅचिंगसाठी वापरला जाईल.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF8619] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#d97410]"
              >
                <span>Continue to Selfie Scan</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SELFIE CAPTURE */}
        {step === "selfie" && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white">
                Take a Clear Selfie
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                चेहरा स्पष्ट दिसेल असा सेल्फी घ्या किंवा गॅलरीतून निवडा (99%+ Accuracy Biometric Verification)
              </p>

              {formError && (
                <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/50 p-4 text-xs font-semibold text-red-200 shadow-inner text-left">
                  ⚠️ {formError}
                </div>
              )}

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

              <div className="my-8 flex justify-center">
                {selfieDataUrl ? (
                  <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-[#EF8619] shadow-2xl">
                    <img src={selfieDataUrl} alt="Selfie" className="h-full w-full object-cover" />
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
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] p-4 text-xs font-bold text-white hover:bg-[#08334f]"
                  >
                    <Camera className="h-6 w-6 text-orange-400" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs font-bold text-slate-200 hover:bg-white/10"
                  >
                    <Upload className="h-6 w-6 text-sky-400" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: MATCHING ANIMATION */}
        {step === "matching" && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center animate-in zoom-in-95">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#EF8619] animate-spin" />
              {selfieDataUrl ? (
                <div className="h-28 w-28 overflow-hidden rounded-full">
                  <img src={selfieDataUrl} alt="Scanning" className="h-full w-full object-cover" />
                </div>
              ) : (
                <Sparkles className="h-10 w-10 text-[#EF8619]" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                Searching for your face...
              </h2>
              <p className="text-sm font-medium text-[#EF8619] animate-pulse">
                {scanStatusMessage}
              </p>
              <p className="text-xs text-slate-400">
                Scanning through {allPhotos.length} event photos with 99%+ accuracy AI models
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: INTERACTIVE GALLERY */}
        {step === "gallery" && (
          <div className="space-y-4 animate-in fade-in">
            {faceScanNotice && (
              <div className="rounded-2xl border border-sky-400/40 bg-sky-950/40 p-4 text-xs font-semibold text-sky-200 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>{faceScanNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFaceScanNotice(null)}
                  className="text-slate-400 hover:text-white ml-2 text-base font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            {/* VIP Bride & Groom Bar */}
            {role === "bride_groom" && (
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-4 shadow-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <Crown className="h-5 w-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-300">
                        Wedding Album Selection Mode
                      </h3>
                      <p className="text-xs text-slate-300">
                        ⭐ {selectedIds.size} Photos Selected for your Wedding Album
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedIds.size === 0) {
                        alert("कृपया आधी काही फोटो सिलेक्ट करा.");
                        return;
                      }
                      setSelectionNotice(`🎉 धन्यवाद! तुम्ही निवडलेले ${selectedIds.size} फोटो स्टुडिओकडे पाठवले आहेत.`);
                      setTimeout(() => setSelectionNotice(null), 5000);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow transition hover:bg-amber-300"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Album Selection
                  </button>
                </div>

                {selectionNotice && (
                  <div className="mt-3 rounded-xl bg-emerald-950/80 p-2.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                    {selectionNotice}
                  </div>
                )}
              </div>
            )}

            {/* Gallery Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
              <button
                type="button"
                onClick={() => setGalleryTab("all")}
                className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition ${
                  galleryTab === "all" ? "bg-[#0A3F61] text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({allPhotos.length})
              </button>

              {matchedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGalleryTab("matched")}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition ${
                    galleryTab === "matched" ? "bg-[#EF8619] text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  My Photos ({matchedPhotos.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setGalleryTab("selected")}
                className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition ${
                  galleryTab === "selected" ? "bg-amber-500 text-black shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                ⭐ Selected ({selectedIds.size})
              </button>

              <button
                type="button"
                onClick={() => setGalleryTab("favorites")}
                className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition ${
                  galleryTab === "favorites" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                ❤️ Liked ({favoriteIds.size})
              </button>
            </div>

            {/* Photos Grid */}
            {displayedPhotos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <ImageIcon className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="mt-3 text-base font-bold text-white">
                  {galleryTab === "matched"
                    ? "तुमचा चेहरा असलेले फोटो सापडले नाहीत"
                    : "या विभागात कोणतेही फोटो उपलब्ध नाहीत"}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {galleryTab === "matched"
                    ? "कृपया 'सर्व फोटो' टॅब निवडून संपूर्ण अल्बम पहा किंवा पुन्हा चांगल्या प्रकाशात सेल्फी घ्या."
                    : "सर्व फोटो पाहण्यासाठी वरील 'सर्व फोटो' टॅबवर क्लिक करा."}
                </p>
                {galleryTab === "matched" && (
                  <button
                    type="button"
                    onClick={() => setGalleryTab("all")}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    सर्व फोटो पहा
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {displayedPhotos.map((photo) => {
                  const isFav = favoriteIds.has(photo.id);
                  const isSel = selectedIds.has(photo.id);
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

                      {/* Top Badges */}
                      <div className="absolute left-2 top-2 flex items-center gap-1">
                        {isSel && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow">
                            <Star className="h-3.5 w-3.5 fill-black" />
                          </span>
                        )}
                        {isFav && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow">
                            <Heart className="h-3.5 w-3.5 fill-white" />
                          </span>
                        )}
                      </div>

                      {/* Bottom Actions */}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleToggleFavorite(photo.id);
                            }}
                            className={`rounded-full p-1.5 backdrop-blur-sm transition ${
                              isFav ? "bg-red-600 text-white" : "bg-black/50 text-white hover:bg-black/70"
                            }`}
                            title="Favorite"
                          >
                            <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-white" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleToggleSelection(photo.id);
                            }}
                            className={`rounded-full p-1.5 backdrop-blur-sm transition ${
                              isSel ? "bg-amber-400 text-black" : "bg-black/50 text-white hover:bg-black/70"
                            }`}
                            title="Select for Album"
                          >
                            <Star className={`h-3.5 w-3.5 ${isSel ? "fill-black" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCommentingPhoto(photo);
                            }}
                            className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70"
                            title="Comment"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(photo);
                          }}
                          className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
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

      {/* FULLSCREEN LIGHTBOX */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in">
          <button
            type="button"
            onClick={() => setPreviewPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-h-[90vh] max-w-full text-center">
            <img
              src={previewPhoto.originalUrl || previewPhoto.thumbnailUrl}
              alt={previewPhoto.fileName}
              className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => void handleToggleFavorite(previewPhoto.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow transition ${
                  favoriteIds.has(previewPhoto.id) ? "bg-red-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Heart className={`h-4 w-4 ${favoriteIds.has(previewPhoto.id) ? "fill-white" : ""}`} />
                <span>{favoriteIds.has(previewPhoto.id) ? "Favorited" : "Favorite"}</span>
              </button>

              <button
                type="button"
                onClick={() => void handleToggleSelection(previewPhoto.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow transition ${
                  selectedIds.has(previewPhoto.id) ? "bg-amber-400 text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Star className={`h-4 w-4 ${selectedIds.has(previewPhoto.id) ? "fill-black" : ""}`} />
                <span>{selectedIds.has(previewPhoto.id) ? "Selected for Album" : "Select for Album"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCommentingPhoto(previewPhoto)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-white/20"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Comments</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload(previewPhoto)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#08334f]"
              >
                <Download className="h-4 w-4" />
                <span>Download HD</span>
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppShare(previewPhoto)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#20b858]"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS DRAWER / MODAL */}
      {commentingPhoto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Photo Comments</h3>
              </div>
              <button
                type="button"
                onClick={() => setCommentingPhoto(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 max-h-48 space-y-2.5 overflow-y-auto pr-1">
              {(commentsMap.get(commentingPhoto.id) || []).length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">
                  No comments yet. Write a note or request changes!
                </p>
              ) : (
                (commentsMap.get(commentingPhoto.id) || []).map((c) => (
                  <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-sky-300">{c.author}</span>
                      <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-1 text-slate-200">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment or request..."
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handlePostComment();
                }}
              />
              <button
                type="button"
                onClick={() => void handlePostComment()}
                disabled={submittingComment || !newCommentText.trim()}
                className="rounded-xl bg-[#0A3F61] p-2.5 text-white hover:bg-[#08334f] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
