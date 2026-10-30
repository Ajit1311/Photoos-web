"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Download,
  Heart,
  Home as HomeIcon,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
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
  loadFaceRecognitionModels,
  MATCH_THRESHOLD,
} from "@/lib/ai/face-recognition";
import type { GalleryPhoto } from "@/types/events/gallery";
import JustdialMarketplace from "@/components/gallery/marketplace/JustdialMarketplace";
import StudioClientChat from "@/components/gallery/chat/StudioClientChat";

type UserRole = "bride_groom" | "guest" | null;
type GuestStep = "role_select" | "guest_consent" | "selfie" | "matching" | "gallery";
type AppTab = "home" | "marketplace" | "camera" | "chat" | "profile";

interface EventData {
  id: string;
  name: string;
  shoot_date?: string | null;
  venue?: string | null;
  studio_id: string;
}

interface StudioData {
  id: string;
  name: string;
  brand_name?: string | null;
  contact_phone?: string | null;
}

interface GuestWish {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export default function ClientAccessGalleryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = Array.isArray(params?.eventId)
    ? params?.eventId[0]
    : (params?.eventId as string);

  // 7 Days Expiry check
  const expParam = searchParams.get("exp");
  const isExpired = useMemo(() => {
    if (!expParam) return false;
    const expTime = Number(expParam);
    if (isNaN(expTime)) return false;
    return Date.now() > expTime;
  }, [expParam]);

  // App Tabs State
  const [activeAppTab, setActiveAppTab] = useState<AppTab>("home");

  // Loading & Data
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  // User Role & Step
  const [role, setRole] = useState<UserRole>(null);
  const [step, setStep] = useState<GuestStep>("role_select");

  // Guest Details & DPDP Consent
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [formError, setFormError] = useState("");

  // Selfie & Face Scan
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [matchedPhotos, setMatchedPhotos] = useState<GalleryPhoto[]>([]);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>("Scanning your face...");
  const [faceScanNotice, setFaceScanNotice] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Gallery View State
  const [galleryTab, setGalleryTab] = useState<"all" | "matched" | "selected" | "favorites">("all");
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Local Interactive State Sets
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [photoCommentsMap, setPhotoCommentsMap] = useState<Map<string, PhotoComment[]>>(new Map());

  // Active Comment Modal
  const [commentingPhoto, setCommentingPhoto] = useState<GalleryPhoto | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Download Security & Settings
  const [allowDownloads, setAllowDownloads] = useState<boolean>(false);
  const [lockDownloadsUntilPayment, setLockDownloadsUntilPayment] = useState<boolean>(false);
  const [downloadLockNotice, setDownloadLockNotice] = useState<string | null>(null);

  // Live Wishes in Chat Tab
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [newWishMessage, setNewWishMessage] = useState("");

  // Load Event, Studio, and Photos
  const loadGalleryData = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Public API endpoint bypasses RLS for guest QR scans
      try {
        const res = await fetch(`/api/gallery/${encodeURIComponent(eventId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.event) setEvent(json.event as EventData);
            if (json.studio) setStudio(json.studio as StudioData);

            const canDownload = typeof json.allowDownloads === "boolean" ? json.allowDownloads : false;
            setAllowDownloads(canDownload);
            if (typeof json.lockDownloadsUntilPayment === "boolean") {
              setLockDownloadsUntilPayment(json.lockDownloadsUntilPayment);
            }

            if (Array.isArray(json.photos)) {
              setPhotos(json.photos);
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
        console.warn("[ClientAccessGallery] API fetch notice:", apiErr);
      }

      // Fallback direct query
      const { data: eventData } = await supabase
        .from("events")
        .select("id, name, shoot_date, venue, studio_id, metadata")
        .eq("id", eventId)
        .maybeSingle();

      if (eventData) {
        setEvent(eventData as EventData);
        const { data: studioData } = await supabase
          .from("studios")
          .select("id, name, brand_name, contact_phone")
          .eq("id", eventData.studio_id)
          .maybeSingle();

        if (studioData) {
          setStudio(studioData as StudioData);
        }
      }

      // Check corporate storage fallback for corporate events
      if (typeof window !== "undefined") {
        try {
          const rawCorp = window.localStorage.getItem(`photoos_corporate_photos_${eventId}`);
          if (rawCorp) {
            const corpPhotos = JSON.parse(rawCorp);
            if (Array.isArray(corpPhotos) && corpPhotos.length > 0) {
              const mapped: GalleryPhoto[] = corpPhotos.map((cp: any) => ({
                id: cp.id,
                eventId,
                fileName: cp.name,
                thumbnailUrl: cp.thumbnail_url || cp.url,
                originalUrl: cp.url,
                width: cp.width || 1200,
                height: cp.height || 800,
                fileSize: cp.size_bytes || 500000,
                mimeType: "image/jpeg",
                uploadedBy: "Corporate Office",
                uploadedAt: cp.uploaded_at,
                status: "ready",
                visibility: "visible",
                rating: 0,
                likes: 0,
                comments: 0,
                isFavorite: false,
                isSelected: false,
                aiProcessed: true,
              }));
              setPhotos(mapped);
              setAllowDownloads(true);

              const rawComp = window.localStorage.getItem("photoos_corporate_company");
              if (rawComp) {
                const comp = JSON.parse(rawComp);
                setStudio({
                  id: comp.id || "corp_office",
                  name: comp.name || "Corporate Office",
                  brand_name: comp.name || "Corporate Office",
                });
              }
              return;
            }
          }
        } catch (e) {
          console.warn("[ClientAccessGallery] corp photos fallback error:", e);
        }
      }
    } catch (err) {
      console.error("[ClientAccessGallery] Failed to load gallery data:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId, supabase]);

  useEffect(() => {
    void loadGalleryData();
    void loadFaceRecognitionModels();
  }, [loadGalleryData]);

  // Handle Guest Details Form & Sync to Admin CRM
  const handleProceedGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!guestName.trim()) {
      setFormError("Please enter your full name");
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!consentGiven) {
      setFormError("Facial recognition consent is required to match your photos");
      return;
    }

    // Connect guest lead data directly to studio's admin panel!
    void fetch("/api/events/guest-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studioId: event?.studio_id,
        eventId,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        role: role || "guest",
      }),
    });

    setStep("selfie");
  };

  // Handle Selfie Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelfieDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // AI Face Matching Engine (99%+ Accuracy)
  const handleMatchPhotos = async () => {
    if (!selfieDataUrl) return;
    setStep("matching");
    setFormError("");
    setScanStatusMessage("Loading AI face recognition model...");

    try {
      setScanStatusMessage("Detecting face with 99%+ accuracy...");
      const selfieResult = await extractSelfieFaceDescriptor(selfieDataUrl);

      if (!selfieResult.success || !selfieResult.descriptor) {
        // If models had difficulty loading on slow connection, attempt server-side or open gallery gracefully
        if (selfieResult.error?.includes("models could not be loaded")) {
          setScanStatusMessage("Processing selfie via cloud AI engine...");
          try {
            const response = await fetch("/api/ai/face-search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: selfieDataUrl,
                eventId,
                studioId: event?.studio_id,
                guestPhone,
                consentGranted: true,
              }),
            });
            if (response.ok) {
              const res = await response.json();
              if (Array.isArray(res?.matchedAssetIds) && res.matchedAssetIds.length > 0) {
                const matches = photos.filter((p) => res.matchedAssetIds.includes(p.id));
                setMatchedPhotos(matches);
                setGalleryTab("matched");
                setFaceScanNotice(`🎉 Found ${matches.length} photos matching your face.`);
                setStep("gallery");
                setActiveAppTab("camera");
                return;
              }
            }
          } catch (e) {
            console.warn("[GalleryAccess] Fallback face search notice:", e);
          }

          // Non-blocking fallback
          setGalleryTab("all");
          setFaceScanNotice("Selfie saved! You can browse and download all event photos below.");
          setStep("gallery");
          setActiveAppTab("camera");
          return;
        }

        setFormError(selfieResult.error || "Face not clearly detected. Please take a selfie in good lighting.");
        setStep("selfie");
        return;
      }

      const selfieDescriptor = selfieResult.descriptor;
      setScanStatusMessage("Matching against event photos...");
      let matchedIds: string[] = [];
      const studioId = event?.studio_id;

      if (studioId) {
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
            const res = await response.json();
            if (Array.isArray(res?.matchedAssetIds)) {
              matchedIds = res.matchedAssetIds;
            }
          }
        } catch (backendErr) {
          console.warn("[GalleryAccess] Backend face-search fallback:", backendErr);
        }
      }

      if (matchedIds.length === 0 && photos.length > 0) {
        setScanStatusMessage(`Analyzing gallery photos (0/${photos.length})...`);
        const clientMatches: GalleryPhoto[] = [];

        const CHUNK_SIZE = 3;
        for (let i = 0; i < photos.length; i += CHUNK_SIZE) {
          const chunk = photos.slice(i, i + CHUNK_SIZE);
          const currentProgress = Math.min(i + chunk.length, photos.length);
          setScanStatusMessage(`Analyzing gallery photos (${currentProgress}/${photos.length})...`);

          await Promise.all(
            chunk.map(async (photo) => {
              const photoUrl = photo.originalUrl || photo.thumbnailUrl;
              if (!photoUrl) return;

              const photoFaces = await extractPhotoFacesDescriptors(photoUrl);

              if (photoFaces.length > 0) {
                const match = compareTargetFace(
                  selfieDescriptor,
                  photoFaces.map((f) => f.descriptor),
                  MATCH_THRESHOLD
                );

                if (match.isMatch) {
                  clientMatches.push(photo);
                }
              }
            })
          );
        }

        setMatchedPhotos(clientMatches);
        if (clientMatches.length > 0) {
          setGalleryTab("matched");
          setFaceScanNotice(`🎉 Great! Found ${clientMatches.length} photos matching your face.`);
        } else {
          setGalleryTab("all");
          setFaceScanNotice("No photos matched your face yet. You can browse all event photos above.");
        }
      } else {
        const matches = photos.filter((p) => matchedIds.includes(p.id));
        setMatchedPhotos(matches);
        if (matches.length > 0) {
          setGalleryTab("matched");
          setFaceScanNotice(`🎉 Great! Found ${matches.length} photos matching your face.`);
        } else {
          setGalleryTab("all");
          setFaceScanNotice("No photos matched your face yet. You can browse all event photos above.");
        }
      }

      setStep("gallery");
      setActiveAppTab("camera");
    } catch (err) {
      console.error("[handleMatchPhotos] AI matching error:", err);
      setFormError("An error occurred during matching. Please try again.");
      setStep("selfie");
    }
  };

  // Interactions: Favorite, Selection, Comments
  const handleToggleFavorite = async (photoId: string) => {
    const isCurrentlyFav = favoriteIds.has(photoId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFav) next.delete(photoId);
      else next.add(photoId);
      return next;
    });

    try {
      await togglePhotoFavorite(photoId, !isCurrentlyFav);
    } catch (err) {
      console.warn("[handleToggleFavorite] Server sync notice:", err);
    }
  };

  const handleToggleSelection = async (photoId: string) => {
    const isCurrentlySelected = selectedIds.has(photoId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySelected) next.delete(photoId);
      else next.add(photoId);
      return next;
    });

    try {
      await togglePhotoSelection(photoId, !isCurrentlySelected);
    } catch (err) {
      console.warn("[handleToggleSelection] Server sync notice:", err);
    }
  };

  const handlePostComment = async () => {
    if (!commentingPhoto || !newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const author = guestName.trim() || (role === "bride_groom" ? "Bride & Groom" : "Guest");
      const res = await addPhotoComment(commentingPhoto.id, author, newCommentText.trim());
      if (res.success && res.comment) {
        setPhotoCommentsMap((prev) => {
          const next = new Map(prev);
          const existing = next.get(commentingPhoto.id) || [];
          next.set(commentingPhoto.id, [...existing, res.comment!]);
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

  // Download Photo (Strictly adheres to settings)
  const handleDownloadPhoto = (photo: GalleryPhoto) => {
    if (!allowDownloads) return;

    if (lockDownloadsUntilPayment) {
      setDownloadLockNotice(
        role === "bride_groom"
          ? "Payment Pending: Please clear the remaining studio balance to unlock high-resolution HD downloads."
          : "Direct downloads are currently restricted for guests. Please contact the bride or groom."
      );
      return;
    }

    const url = photo.originalUrl || photo.thumbnailUrl;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = photo.fileName || `Photo-${photo.id}.jpg`;
    link.target = "_blank";
    link.click();
  };

  const handleWhatsAppShare = (photo: GalleryPhoto) => {
    const url = photo.originalUrl || photo.thumbnailUrl;
    const msg = encodeURIComponent(
      `Check out this photo from ${event?.name || "Event"}! 📸✨\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  // Send Event Wish in Chat
  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishMessage.trim()) return;

    const newWish: GuestWish = {
      id: `w-${Date.now()}`,
      sender: guestName.trim() || (role === "bride_groom" ? "Bride & Groom" : "Guest"),
      message: newWishMessage.trim(),
      timestamp: "Just now",
    };

    setWishes((prev) => [newWish, ...prev]);
    setNewWishMessage("");
  };

  const displayedPhotos = useMemo(() => {
    switch (galleryTab) {
      case "matched":
        return matchedPhotos;
      case "selected":
        return photos.filter((p) => selectedIds.has(p.id));
      case "favorites":
        return photos.filter((p) => favoriteIds.has(p.id));
      case "all":
      default:
        return photos;
    }
  }, [galleryTab, matchedPhotos, photos, selectedIds, favoriteIds]);

  // 1. EXPIRED LINK SCREEN (7 Days)
  if (isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#071f31] via-[#0A3F61] to-[#041522] p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.08] p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-white">Gallery Link Expired</h1>
          <p className="mt-1 text-xs text-amber-300">7-Day Validity Limit Reached</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs leading-relaxed text-slate-300">
            <p>This gallery access QR link was valid for 7 days for security and privacy reasons, and has now expired.</p>
            <p className="mt-2 text-slate-400">Please contact your studio photographer to renew this link or request a new QR code.</p>
          </div>
          <p className="mt-6 text-[11px] text-slate-400">
            {studio?.brand_name || studio?.name || "Photo Studio"} &bull; Powered by PhotoOS
          </p>
        </div>
      </div>
    );
  }

  // 2. LOADING SCREEN
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#071f31] p-6 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#EF8619]" />
        <p className="mt-4 text-sm font-semibold text-slate-300">Loading PhotoOS Event App...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* App Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071f31]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-[#EF8619]">
              {role === "bride_groom" ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  {studio?.brand_name || studio?.name || "Photo Studio"}
                </span>
                {role === "bride_groom" && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.2 text-[9px] font-bold text-amber-300">
                    VIP HOST
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold text-white line-clamp-1">
                {event?.name || "Wedding Event"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-sky-300">
              {activeAppTab}
            </span>
          </div>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="mx-auto w-full max-w-md flex-1 p-4 pb-28">
        {/* =================================================================== */}
        {/* TAB 1: HOME */}
        {/* =================================================================== */}
        {activeAppTab === "home" && (
          <div className="space-y-5 animate-in fade-in">
            {/* Event Hero Cover Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3F61] via-[#071f31] to-[#041522] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-[10px] font-bold tracking-wider text-[#EF8619] uppercase">
                  Official Wedding Gallery
                </span>
                <span className="text-xs text-sky-200">
                  {photos.length} Photos Live
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black text-white">
                {event?.name || "Welcome to Wedding"}
              </h2>

              <p className="mt-1 text-xs text-sky-200 leading-relaxed">
                Celebrating love & memories &bull; Captured with perfection by {studio?.brand_name || studio?.name || "Studio"}.
              </p>

              {event?.shoot_date && (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-black/40 px-3.5 py-1.5 text-xs text-slate-300">
                  <CalendarDays className="h-4 w-4 text-orange-400" />
                  <span>{event.shoot_date}</span>
                  {event.venue && <span>&bull; {event.venue}</span>}
                </div>
              )}

              {/* Big Face Scan CTA */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAppTab("camera");
                    if (step === "role_select") setStep("guest_consent");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#EF8619] to-amber-500 py-3.5 text-sm font-extrabold text-black shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-[0.99]"
                >
                  <Camera className="h-5 w-5" />
                  Scan Face to Find Your Photos (AI Face Scan)
                </button>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveAppTab("camera")}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-orange-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">Event Gallery</h4>
                <p className="mt-0.5 text-[11px] text-slate-400">{photos.length} HD Photos</p>
              </div>

              {role === "bride_groom" ? (
                <div
                  onClick={() => setActiveAppTab("chat")}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-orange-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-white">Studio Desk</h4>
                  <p className="mt-0.5 text-[11px] text-slate-400">Direct Studio Chat</p>
                </div>
              ) : (
                <div
                  onClick={() => setActiveAppTab("marketplace")}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-orange-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-white">Marketplace</h4>
                  <p className="mt-0.5 text-[11px] text-slate-400">Find & Book Studios</p>
                </div>
              )}
            </div>

            {/* Studio Info Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Official Photography Partner
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {studio?.brand_name || studio?.name || "PhotoOS Studio"}
                  </h3>
                </div>
                <div className="rounded-2xl bg-orange-500/20 p-2.5 text-[#EF8619]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Equipped with AI Face Recognition & Digital Cloud Album Delivery powered by PhotoOS.
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: MARKETPLACE (Justdial-style Area-Wise Directory) */}
        {/* =================================================================== */}
        {activeAppTab === "marketplace" && (
          <JustdialMarketplace
            currentStudioName={studio?.brand_name || studio?.name}
          />
        )}

        {/* =================================================================== */}
        {/* TAB 3: CAMERA / GALLERY */}
        {/* =================================================================== */}
        {activeAppTab === "camera" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Step: Role Select or Guest Form if not done */}
            {step === "role_select" && (
              <div className="space-y-4 text-center">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-bold text-white">Select Gallery Access</h3>
                  <p className="text-xs text-slate-400 mt-1">Select your profile to view photos</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRole("bride_groom");
                        setStep("gallery");
                      }}
                      className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-center hover:bg-amber-500/20"
                    >
                      <Crown className="mx-auto h-6 w-6 text-amber-400" />
                      <span className="mt-2 block text-xs font-bold text-white">Bride & Groom</span>
                      <span className="text-[10px] text-amber-300">VIP Host</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole("guest");
                        setStep("guest_consent");
                      }}
                      className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-4 text-center hover:bg-sky-500/20"
                    >
                      <Camera className="mx-auto h-6 w-6 text-sky-400" />
                      <span className="mt-2 block text-xs font-bold text-white">Event Guest</span>
                      <span className="text-[10px] text-sky-300">AI Face Scan</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Guest Details Form (Synced to Admin CRM) */}
            {step === "guest_consent" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-sky-500/20 p-2.5 text-sky-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Enter Your Details</h3>
                    <p className="text-xs text-slate-400">Enter details to match your event photos</p>
                  </div>
                </div>

                <form onSubmit={handleProceedGuest} className="mt-5 space-y-4">
                  {formError && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kadam"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, ""))}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      id="consent-check"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded accent-[#0A3F61]"
                    />
                    <label htmlFor="consent-check" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                      I consent to facial recognition processing strictly to find my photos in this gallery as per DPDP Act 2023.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-[#0A3F61] to-[#08344f] py-3 text-xs font-bold text-white shadow hover:brightness-110"
                  >
                    Proceed to Selfie
                  </button>
                </form>
              </div>
            )}

            {/* Step: Selfie Capture */}
            {step === "selfie" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EF8619]/20 text-[#EF8619]">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">Take a Selfie or Upload Photo</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Take a clear selfie to instantly match your photos (99%+ Accuracy)
                </p>

                {formError && (
                  <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                    {formError}
                  </div>
                )}

                {selfieDataUrl ? (
                  <div className="mt-4 space-y-4">
                    <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-[#EF8619] shadow-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selfieDataUrl} alt="Selfie" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={handleMatchPhotos}
                      className="w-full rounded-2xl bg-[#EF8619] py-3.5 text-xs font-extrabold text-black shadow-lg shadow-orange-500/20 hover:brightness-110"
                    >
                      Match My Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelfieDataUrl(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Take Another Selfie
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col gap-3">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] py-3.5 text-xs font-bold text-white shadow hover:bg-[#08344f]"
                    >
                      <Camera className="h-4 w-4" />
                      Take Selfie (Camera)
                    </button>

                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="rounded-2xl border border-white/20 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10"
                    >
                      Upload from Gallery
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step: Matching Animation */}
            {step === "matching" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#EF8619]" />
                <h3 className="mt-5 text-base font-bold text-white">AI Face Matching</h3>
                <p className="mt-2 text-xs text-sky-200">{scanStatusMessage}</p>
              </div>
            )}

            {/* Step: Gallery View */}
            {step === "gallery" && (
              <div className="space-y-4">
                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
                  <button
                    type="button"
                    onClick={() => setGalleryTab("all")}
                    className={`flex-1 rounded-xl py-2 px-2.5 text-xs font-bold transition ${
                      galleryTab === "all" ? "bg-[#0A3F61] text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({photos.length})
                  </button>

                  {matchedPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setGalleryTab("matched")}
                      className={`flex-1 rounded-xl py-2 px-2.5 text-xs font-bold transition ${
                        galleryTab === "matched" ? "bg-[#EF8619] text-white shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      My Photos ({matchedPhotos.length})
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setGalleryTab("selected")}
                    className={`flex-1 rounded-xl py-2 px-2.5 text-xs font-bold transition ${
                      galleryTab === "selected" ? "bg-amber-500 text-black shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ⭐ Selected ({selectedIds.size})
                  </button>

                  <button
                    type="button"
                    onClick={() => setGalleryTab("favorites")}
                    className={`flex-1 rounded-xl py-2 px-2.5 text-xs font-bold transition ${
                      galleryTab === "favorites" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ❤️ ({favoriteIds.size})
                  </button>
                </div>

                {/* Photo Grid */}
                {displayedPhotos.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-slate-500" />
                    <p className="mt-3 text-xs text-slate-400">No photos available in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {displayedPhotos.map((photo) => {
                      const url = photo.thumbnailUrl || photo.originalUrl;
                      const isFav = favoriteIds.has(photo.id);
                      const isSel = selectedIds.has(photo.id);

                      return (
                        <div
                          key={photo.id}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="Photo"
                            onClick={() => setPreviewPhoto(photo)}
                            className="h-full w-full object-cover cursor-pointer transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Watermark overlay when QR download is disabled */}
                          {!allowDownloads && (
                            <div
                              onClick={() => setPreviewPhoto(photo)}
                              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden"
                            >
                              <div className="transform -rotate-25 rounded-lg border border-white/20 bg-black/35 px-2.5 py-1 text-center font-black tracking-widest text-[11px] sm:text-xs uppercase text-white/55 backdrop-blur-[1px] shadow-lg">
                                © {studio?.brand_name || studio?.name || "PhotoOS Studio"}
                              </div>
                            </div>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                            <button
                              type="button"
                              onClick={() => void handleToggleFavorite(photo.id)}
                              className="rounded-full bg-black/40 p-1.5 text-white hover:text-red-500"
                            >
                              <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleToggleSelection(photo.id)}
                              className="rounded-full bg-black/40 p-1.5 text-white hover:text-amber-400"
                            >
                              <Star className={`h-4 w-4 ${isSel ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setCommentingPhoto(photo)}
                              className="rounded-full bg-black/40 p-1.5 text-white hover:text-sky-400"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>

                            {allowDownloads && (
                              <button
                                type="button"
                                onClick={() => handleDownloadPhoto(photo)}
                                className="rounded-full bg-black/40 p-1.5 text-white hover:text-[#EF8619]"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: CHAT (1-on-1 Studio & Client Desk — Bride & Groom Only) */}
        {/* =================================================================== */}
        {activeAppTab === "chat" && (
          <StudioClientChat
            studioId={studio?.id}
            studioName={studio?.brand_name || studio?.name || "PhotoOS Studio Team"}
            studioPhone={studio?.contact_phone || undefined}
            eventName={event?.name || "Your Wedding Event"}
            clientName={guestName || "Bride & Groom"}
            isBrideOrGroom={role === "bride_groom"}
            eventId={eventId}
          />
        )}

        {/* =================================================================== */}
        {/* TAB 5: PROFILE */}
        {/* =================================================================== */}
        {activeAppTab === "profile" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A3F61] text-white">
                <User className="h-8 w-8" />
              </div>
              <h3 className="mt-3 text-base font-bold text-white">
                {guestName || (role === "bride_groom" ? "Bride & Groom" : "Guest User")}
              </h3>
              {guestPhone && <p className="text-xs text-slate-400 font-mono mt-0.5">+91 {guestPhone}</p>}

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                <div>
                  <p className="text-lg font-bold text-[#EF8619]">{matchedPhotos.length}</p>
                  <p className="text-[10px] text-slate-400">Matched</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{favoriteIds.size}</p>
                  <p className="text-[10px] text-slate-400">Liked</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-400">{selectedIds.size}</p>
                  <p className="text-[10px] text-slate-400">Selected</p>
                </div>
              </div>
            </div>

            {/* DPDP Compliance Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">DPDP 2023 Compliant & Safe</h4>
                <p className="text-[11px] text-slate-300">Your biometric data is encrypted and used only for photo matching.</p>
              </div>
            </div>

            {/* Re-scan Selfie Button */}
            <button
              type="button"
              onClick={() => {
                setStep("selfie");
                setActiveAppTab("camera");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Rescan Face / Take New Selfie
            </button>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* FIXED MOBILE APP BOTTOM NAVIGATION BAR */}
      {/* ===================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#071f31]/95 px-3 py-2 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {/* Home */}
          <button
            type="button"
            onClick={() => setActiveAppTab("home")}
            className={`flex flex-col items-center gap-1 transition ${
              activeAppTab === "home" ? "text-[#EF8619]" : "text-slate-400 hover:text-white"
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Marketplace */}
          <button
            type="button"
            onClick={() => setActiveAppTab("marketplace")}
            className={`flex flex-col items-center gap-1 transition ${
              activeAppTab === "marketplace" ? "text-[#EF8619]" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] font-bold">Market</span>
          </button>

          {/* Center Elevated Camera Button */}
          <button
            type="button"
            onClick={() => {
              setActiveAppTab("camera");
              if (step === "role_select") setStep("guest_consent");
            }}
            className="-mt-5 flex h-13 w-13 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-[#EF8619] to-amber-400 text-black shadow-xl ring-4 ring-[#071f31] transition active:scale-95"
          >
            <Camera className="h-6 w-6" />
            <span className="text-[9px] font-black uppercase">Scan</span>
          </button>

          {/* Chat (Restricted Strictly to Bride & Groom) */}
          {role === "bride_groom" && (
            <button
              type="button"
              onClick={() => setActiveAppTab("chat")}
              className={`flex flex-col items-center gap-1 transition ${
                activeAppTab === "chat" ? "text-[#EF8619]" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] font-bold">Chat</span>
            </button>
          )}

          {/* Profile */}
          <button
            type="button"
            onClick={() => setActiveAppTab("profile")}
            className={`flex flex-col items-center gap-1 transition ${
              activeAppTab === "profile" ? "text-[#EF8619]" : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>

      {/* Lightbox Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[85vh] max-w-full">
            <div className="relative inline-block w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.originalUrl || previewPhoto.thumbnailUrl}
                alt="Preview"
                className="max-h-[75vh] max-w-full rounded-2xl object-contain mx-auto"
              />

              {!allowDownloads && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
                  <div className="transform -rotate-20 rounded-2xl border-2 border-white/30 bg-black/40 px-5 py-2.5 sm:px-7 sm:py-3.5 text-center font-black tracking-widest text-sm sm:text-2xl uppercase text-white/55 backdrop-blur-sm shadow-2xl">
                    © {studio?.brand_name || studio?.name || "PhotoOS Studio"}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => void handleToggleFavorite(previewPhoto.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold ${
                  favoriteIds.has(previewPhoto.id) ? "bg-red-600 text-white" : "bg-white/10 text-white"
                }`}
              >
                <Heart className={`h-4 w-4 ${favoriteIds.has(previewPhoto.id) ? "fill-white" : ""}`} />
                <span>Favorite</span>
              </button>

              <button
                type="button"
                onClick={() => void handleToggleSelection(previewPhoto.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold ${
                  selectedIds.has(previewPhoto.id) ? "bg-amber-400 text-black" : "bg-white/10 text-white"
                }`}
              >
                <Star className={`h-4 w-4 ${selectedIds.has(previewPhoto.id) ? "fill-black" : ""}`} />
                <span>Select for Album</span>
              </button>

              <button
                type="button"
                onClick={() => setCommentingPhoto(previewPhoto)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Comment</span>
              </button>

              {allowDownloads && (
                <button
                  type="button"
                  onClick={() => handleDownloadPhoto(previewPhoto)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  <span>Download HD</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleWhatsAppShare(previewPhoto)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-semibold text-white"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commenting Drawer */}
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

            <div className="my-4 max-h-48 space-y-2 overflow-y-auto">
              {(photoCommentsMap.get(commentingPhoto.id) || []).length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">Be the first to leave a comment or note!</p>
              ) : (
                (photoCommentsMap.get(commentingPhoto.id) || []).map((c) => (
                  <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                    <span className="font-bold text-sky-300">{c.author}</span>
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
                placeholder="Write a comment or photo edit note..."
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={() => void handlePostComment()}
                disabled={submittingComment || !newCommentText.trim()}
                className="rounded-xl bg-[#0A3F61] p-2.5 text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Lock Popup */}
      {downloadLockNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900 p-6 text-center shadow-2xl">
            <ShieldCheck className="mx-auto h-12 w-12 text-amber-400" />
            <h3 className="mt-3 text-base font-bold text-white">Download Locked</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{downloadLockNotice}</p>
            <button
              type="button"
              onClick={() => setDownloadLockNotice(null)}
              className="mt-5 w-full rounded-xl bg-[#0A3F61] py-2.5 text-xs font-bold text-white"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
