"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import type { MarketplaceStudio } from "@/app/api/marketplace/studios/route";

interface JustdialMarketplaceProps {
  currentStudioName?: string;
  currentStudioCity?: string;
}

const DEFAULT_CITIES = [
  "All Cities",
  "Pune",
  "Mumbai",
  "Nashik",
  "Kolhapur",
  "Nagpur",
  "Aurangabad",
  "Satara",
  "Goa",
];

export default function JustdialMarketplace({
  currentStudioName,
  currentStudioCity,
}: JustdialMarketplaceProps) {
  const [studios, setStudios] = useState<MarketplaceStudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<string[]>(DEFAULT_CITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [quoteModalStudio, setQuoteModalStudio] = useState<MarketplaceStudio | null>(null);
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteEventDate, setQuoteEventDate] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const fetchStudios = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== "All Cities") {
        params.append("city", selectedCity);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const res = await fetch(`/api/marketplace/studios?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.studios)) {
          setStudios(json.studios);
          if (Array.isArray(json.cities) && json.cities.length > 0) {
            const merged = Array.from(
              new Set(["All Cities", ...json.cities, ...DEFAULT_CITIES])
            );
            setAvailableCities(merged);
          }
        }
      }
    } catch (err) {
      console.warn("[JustdialMarketplace] Error fetching studios:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStudios();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStudios]);

  const handleCall = (phone?: string | null) => {
    if (!phone) return;
    const clean = phone.replace(/\D/g, "");
    window.open(`tel:${clean}`, "_self");
  };

  const handleWhatsApp = (studio: MarketplaceStudio) => {
    const phone = studio.phone ? studio.phone.replace(/\D/g, "") : "919822012345";
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const text = encodeURIComponent(
      `Hello ${studio.brand_name || studio.name},\nI saw your profile on PhotoOS Marketplace and would like to inquire about availability and package pricing for an upcoming event.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalStudio) return;

    const phone = quoteModalStudio.phone ? quoteModalStudio.phone.replace(/\D/g, "") : "919822012345";
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const message = encodeURIComponent(
      `*New Quote Request via PhotoOS Marketplace*\n\n` +
      `Studio: ${quoteModalStudio.brand_name || quoteModalStudio.name}\n` +
      `Client Name: ${quoteName}\n` +
      `Client Phone: ${quotePhone}\n` +
      `Event Date: ${quoteEventDate || "To be decided"}\n\n` +
      `Please share your package details and availability.`
    );

    // Save lead to capture endpoint
    void fetch("/api/events/guest-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studioId: quoteModalStudio.id,
        guestName: quoteName,
        guestPhone: quotePhone,
        role: "marketplace_quote_lead",
      }),
    });

    setQuoteSubmitted(true);
    setTimeout(() => {
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
      setQuoteModalStudio(null);
      setQuoteSubmitted(false);
      setQuoteName("");
      setQuotePhone("");
      setQuoteEventDate("");
    }, 800);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Marketplace Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3F61]/80 via-slate-900 to-[#071f31] p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-[#EF8619]">
          <Building2 className="h-5 w-5" />
          <span className="text-[11px] font-bold tracking-wider uppercase">
            PhotoOS Marketplace Directory
          </span>
        </div>
        <h2 className="mt-2 text-xl font-extrabold text-white">
          Find & Book Verified Studios
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Area-wise local wedding photographers, cinematographers, and premium photobook designers.
        </p>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area, studio name, or service (e.g. Kothrud, Pune, Drone)..."
            className="w-full rounded-2xl border border-white/15 bg-white/10 py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md focus:border-[#EF8619] focus:bg-white/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* City & Area Scroll Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {availableCities.map((city) => {
          const isActive = selectedCity === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "bg-[#EF8619] text-black shadow-md shadow-orange-500/20"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {city === "All Cities" ? "All Locations" : `📍 ${city}`}
            </button>
          );
        })}
      </div>

      {/* Results Count & Filter bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{studios.length}</strong> studios
          {selectedCity !== "All Cities" && ` in ${selectedCity}`}
        </span>
        <div className="flex items-center gap-1 text-[11px] text-sky-400">
          <Sparkles className="h-3.5 w-3.5 text-[#EF8619]" />
          <span>Verified Studios (Free & Pro)</span>
        </div>
      </div>

      {/* Studios List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : studios.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-white">No Studios Found</h3>
          <p className="mt-1 text-xs text-slate-400">
            No photography studios matched your search in {selectedCity}. Try selecting &apos;All Locations&apos;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCity("All Cities");
              setSearchQuery("");
            }}
            className="mt-4 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-bold text-white hover:bg-[#08344f]"
          >
            Show All Studios
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {studios.map((studio) => {
            const isPro = studio.plan_tier === "pro" || studio.plan_tier === "enterprise";
            return (
              <div
                key={studio.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-xl transition duration-200 hover:border-white/20"
              >
                {/* Top Section */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white truncate">
                          {studio.brand_name || studio.name}
                        </h3>
                        {studio.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            isPro
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {isPro ? "PRO STUDIO" : "PARTNER"}
                        </span>
                      </div>

                      {/* Location Badge */}
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-[#EF8619] shrink-0" />
                        <span className="truncate">{studio.area}, {studio.city}</span>
                      </div>

                      {/* Ratings & Price */}
                      <div className="mt-2.5 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 rounded-lg bg-emerald-600/30 px-2 py-0.5 text-emerald-300 font-bold">
                          <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                          <span>{studio.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-emerald-400/80 font-normal">
                            ({studio.review_count})
                          </span>
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-400 text-[11px]">Starts from </span>
                          <span className="font-extrabold text-white">
                            ₹{studio.starting_price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {studio.description}
                  </p>

                  {/* Service Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {studio.services.slice(0, 4).map((service, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        {service}
                      </span>
                    ))}
                    {studio.services.length > 4 && (
                      <span className="rounded-lg bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">
                        +{studio.services.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Justdial 3-Action Bottom Row */}
                <div className="grid grid-cols-3 border-t border-white/10 bg-black/40 text-center">
                  {/* Call Now */}
                  <button
                    type="button"
                    onClick={() => handleCall(studio.phone)}
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-sky-400 transition hover:bg-white/5 border-r border-white/10 active:bg-white/10"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Now</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleWhatsApp(studio)}
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-emerald-400 transition hover:bg-white/5 border-r border-white/10 active:bg-white/10"
                  >
                    <span>WhatsApp</span>
                  </button>

                  {/* Book / Get Quote */}
                  <button
                    type="button"
                    onClick={() => setQuoteModalStudio(studio)}
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-extrabold text-[#EF8619] transition hover:bg-white/5 active:bg-white/10"
                  >
                    <span>Get Quote</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quote / Inquire Modal */}
      {quoteModalStudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Get Free Quote
                </h3>
                <p className="text-xs text-[#EF8619]">
                  {quoteModalStudio.brand_name || quoteModalStudio.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuoteModalStudio(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h4 className="mt-3 text-base font-bold text-white">Quote Request Sent!</h4>
                <p className="mt-1 text-xs text-slate-300">
                  Connecting to studio on WhatsApp...
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-[#EF8619]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-[#EF8619]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tentative Event Date
                  </label>
                  <input
                    type="date"
                    value={quoteEventDate}
                    onChange={(e) => setQuoteEventDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-2.5 text-xs text-white outline-none focus:border-[#EF8619]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#EF8619] to-amber-500 py-3 text-xs font-bold text-black shadow-lg shadow-orange-500/20 hover:brightness-110"
                >
                  Request Quote & Chat on WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

