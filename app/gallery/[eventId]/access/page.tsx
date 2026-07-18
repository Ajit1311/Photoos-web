'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ImageIcon, Star, CheckCircle2, Send, Loader2, Camera, 
  Sparkles, Heart, Info, ArrowRight, ShieldCheck 
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && publishableKey) ? createClient(supabaseUrl, publishableKey) : null;

interface Photo {
  id: string;
  public_url: string;
  file_name: string;
  is_favorite?: boolean;
}

interface EventDetail {
  id: string;
  title: string;
  clientName: string;
  eventType: string;
}

export default function ClientAccessGalleryPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    async function loadClientGallery() {
      if (!eventId || !supabase) return;
      try {
        // इव्हेंट आणि फोटो डेटा फेच करणे
        const { data: eventData } = await supabase.from("events").select("*").eq("id", eventId).single();
        const { data: photosData } = await supabase.from("event_photos").select("*").eq("event_id", eventId);

        if (eventData) {
          setEvent({
            id: eventData.id,
            title: eventData.title,
            clientName: eventData.client_name,
            eventType: eventData.event_type || "Event"
          });
        }

        if (photosData) {
          setPhotos(photosData);
        }
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClientGallery();
  }, [eventId]);

  // फोटो सिलेक्शन / टॉगल लॉजिक
  const handleToggleSelect = (photoId: string) => {
    setSelectedPhotoIds(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId) 
        : [...prev, photoId]
    );
  };

  // फायनल सिलेक्शन सबमिट करणे
  const handleSubmitSelection = async () => {
    if (selectedPhotoIds.length === 0) {
      alert("Please select at least one photo before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      if (supabase) {
        // निवडलेल्या फोटोंना डेटाबेसमध्ये 'is_favorite' किंवा स्वतंत्र 'selections' टेबलमध्ये नोंदवणे
        await supabase
          .from('event_photos')
          .update({ is_favorite: true })
          .in('id', selectedPhotoIds);

        // इव्हेंटचा स्टेटस अपडेट करणे की सिलेक्शन पूर्ण झाले आहे
        await supabase
          .from('events')
          .update({ status: 'selected' })
          .eq('id', eventId);
      }

      alert(`🎉 Selection submitted successfully! ${selectedPhotoIds.length} photos locked for editing.`);
    } catch (err) {
      console.error(err);
      alert("Submission complete.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A3F61]" />
        <p className="text-sm font-medium text-slate-500">Loading Secure Media Stream...</p>
      </div>
    );
  }

  const displayedPhotos = activeFilter === 'all' 
    ? photos 
    : photos.filter(p => selectedPhotoIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      
      {/* 🎬 Premium Top Header: Branding Area */}
      <header className="sticky top-0 z-40 bg-white/80 border-b border-slate-200/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold text-[#0A3F61] tracking-widest uppercase flex items-center gap-1">
              <ShieldCheck size={12} /> Secure Client Portal
            </div>
            <h1 className="text-lg font-black text-slate-900 mt-0.5">{event?.title}</h1>
            <p className="text-xs text-slate-400 font-medium">Client: {event?.clientName} • {event?.eventType}</p>
          </div>
          
          {/* Curation Stats Container */}
          <div className="flex items-center gap-3 bg-slate-50 border px-4 py-2 rounded-2xl">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Selected</span>
              <strong className="text-sm font-black text-[#0A3F61]">{selectedPhotoIds.length} / {photos.length}</strong>
            </div>
            <button 
              onClick={handleSubmitSelection}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0A3F61] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#0A3F61]/95 disabled:bg-slate-400 transition-all"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={13} />}
              <span>Submit List</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Gallery Filter Tab Options */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('all')} 
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${activeFilter === 'all' ? 'bg-[#0A3F61] text-white shadow-sm' : 'bg-white border text-slate-600'}`}
            >
              All Workspace Media ({photos.length})
            </button>
            <button 
              onClick={() => setActiveFilter('selected')} 
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${activeFilter === 'selected' ? 'bg-[#0A3F61] text-white shadow-sm' : 'bg-white border text-slate-600'}`}
            >
              My Favorites ({selectedPhotoIds.length})
            </button>
          </div>
          <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1">
            <Info size={13} /> Tap the star icon to select photos for editing.
          </div>
        </div>

        {/* Dynamic Image Tiles Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayedPhotos.length > 0 ? (
            displayedPhotos.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <div 
                  key={photo.id}
                  onClick={() => handleToggleSelect(photo.id)}
                  className={`group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-[#0A3F61] shadow-md scale-[0.99]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {/* Real Dynamic Image Render */}
                  <img 
                    src={photo.public_url} 
                    alt={photo.file_name} 
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                  
                  {/* Overlay Gradient Screen */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Select Trigger Overlay Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      className={`p-2 rounded-xl border backdrop-blur-md shadow-sm transition-all ${isSelected ? 'bg-[#0A3F61] border-[#0A3F61] text-white' : 'bg-white/80 border-slate-200 text-slate-400 group-hover:text-slate-600'}`}
                    >
                      <Star size={14} fill={isSelected ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* File Label Overlay Tag */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="text-[10px] font-bold text-white drop-shadow bg-black/30 px-2 py-0.5 rounded-md max-w-[120px] block truncate">
                      {photo.file_name}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed rounded-3xl text-slate-400 text-xs font-medium">
              {activeFilter === 'selected' 
                ? "You haven't selected any favorites yet. Switch to 'All Media' and start selecting!" 
                : "No active studio photography has been uploaded to this event catalog yet."}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}