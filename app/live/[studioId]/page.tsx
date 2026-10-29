"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, Loader2, QrCode, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface StudioInfo {
  id: string;
  name: string;
  brand_name?: string | null;
  logo_url?: string | null;
}

export default function LiveStandeeResolverPage() {
  const params = useParams();
  const router = useRouter();

  const studioId = Array.isArray(params?.studioId)
    ? params?.studioId[0]
    : (params?.studioId as string);

  const [loading, setLoading] = useState(true);
  const [studio, setStudio] = useState<StudioInfo | null>(null);
  const [noEventMessage, setNoEventMessage] = useState(false);

  const resolveStandee = async () => {
    if (!studioId) return;

    try {
      setLoading(true);

      // Fetch studio details
      const { data: studioData } = await supabase
        .from("studios")
        .select("id, name, brand_name, logo_url")
        .eq("id", studioId)
        .maybeSingle();

      if (studioData) {
        setStudio(studioData as StudioInfo);
      }

      // Fetch active standee record
      const { data: standeeData, error } = await supabase
        .from("studio_standees")
        .select("active_event_id")
        .eq("studio_id", studioId)
        .maybeSingle();

      if (!error && standeeData?.active_event_id) {
        // Active event exists -> Redirect immediately
        router.replace(`/live/${studioId}/event/${standeeData.active_event_id}`);
        return;
      }

      // No active event linked
      setNoEventMessage(true);
    } catch (err) {
      console.error("[LiveStandeeResolver] Error resolving standee:", err);
      setNoEventMessage(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studioId) {
      void resolveStandee();
    }
  }, [studioId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#071f31] via-[#0A3F61] to-[#041522] p-6 text-white">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-white/20 border-t-[#EF8619] animate-spin" />
            <Camera className="absolute inset-0 m-auto h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide">Connecting to Live Event...</h2>
            <p className="mt-1 text-sm text-sky-200">Retrieving today&apos;s event photos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#071f31] via-[#0A3F61] to-[#041522] p-6 text-white">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-8 text-center shadow-2xl backdrop-blur-xl">
        {/* Studio Branding */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-orange-400 shadow-inner">
          <QrCode className="h-10 w-10" />
        </div>

        <div className="mt-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            OFFICIAL STANDEE
          </div>

          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            {studio?.brand_name || studio?.name || "Photo Studio"}
          </h1>
        </div>

        {/* Status Message */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-base font-semibold text-sky-200">
            No Event Currently Active
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            This QR code is active, but no event is currently linked to this standee.
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            If you are attending a live event, please ask the photography team to link this event, or click Refresh below.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void resolveStandee()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF8619] py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#d97410]"
        >
          <RefreshCw className="h-4 w-4" />
          Check Again / Refresh
        </button>

        <p className="mt-6 text-[11px] text-slate-400">
          Powered by PhotoOS Intelligent Photography System
        </p>
      </div>
    </div>
  );
}

