'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  STATUS_FLOW,
  canMoveToStatus,
  getStatusColor,
} from "@/lib/events/status";
import { useToast } from "@/hooks/useToast";
import EventWorkspaceHeader from "@/components/events/workspace/EventWorkspaceHeader";
import FinancialLedgerCard from "@/components/events/workspace/FinancialLedgerCard";
import {
  ArrowLeft, Image as ImageIcon, UploadCloud, Users, Sparkles, QrCode,
  CheckCircle2, Download, ExternalLink, X, Heart, SlidersHorizontal,
  Trash2, Share2, FolderPlus, Camera, Info, LayoutDashboard,
  IndianRupee, Phone, ShieldAlert, Award, Layers, Clock, Loader2, Star,
  Calendar, MapPin, RefreshCw, PlusCircle, FileText, Printer, CheckCircle, MessageSquare
} from "lucide-react";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = (supabaseUrl && publishableKey)
  ? createClient(supabaseUrl, publishableKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

interface Photo {
  id: string;
  public_url: string;
  file_name: string;
  faces_count?: number;
  tag_color?: string;
  is_favorite?: boolean;
  client_note?: string;
  client_comment?: string;
  client_reacted?: boolean;
}

interface EventDetail {
  id: string;
  title: string;
  clientName: string;
  phone: string;
  eventType: string;
  venue: string;
  date: string;
  totalPhotos: number;
  status: string;
  packageSelected: string;
  budget: number;
  advancePaid: number;
  notes?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_id?: string;
}

export default function EventWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  
  const eventId = params?.eventId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'gallery'>('overview');
  const [gallerySubTab, setGallerySubTab] = useState<'all' | 'selected'>('all');
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const [isAiFiltered, setIsAiFiltered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const { toast, setToast, showToast } = useToast();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<Photo | null>(null);

  const [newAmount, setNewAmount] = useState("");
  const [newMode, setNewMode] = useState("UPI");
  const [newRefId, setNewRefId] = useState("");

  const resetAiFilter = () => {
    setFilteredPhotos(photos);
    setIsAiFiltered(false);
  };

  const refreshGalleryState = (latestPhotos: Photo[], preserveSelection = true) => {
    setPhotos(latestPhotos);

    if (gallerySubTab === "selected") {
      setFilteredPhotos(latestPhotos.filter((p) => p.is_favorite));
    } else {
      setFilteredPhotos(latestPhotos);
    }

    if (!preserveSelection) {
      if (latestPhotos.length > 0) {
        setSelectedPhotoForPreview(latestPhotos[0]);
      } else {
        setSelectedPhotoForPreview(null);
      }
      return;
    }

    if (selectedPhotoForPreview) {
      const updated = latestPhotos.find((p) => p.id === selectedPhotoForPreview.id);
      if (updated) {
        setSelectedPhotoForPreview(updated);
      } else if (latestPhotos.length > 0) {
        setSelectedPhotoForPreview(latestPhotos[0]);
      } else {
        setSelectedPhotoForPreview(null);
      }
    } else if (latestPhotos.length > 0) {
      setSelectedPhotoForPreview(latestPhotos[0]);
    }
  };

  async function loadWorkspaceData() {
    if (!eventId || !supabase) {
      setLoading(false);
      showToast("Invalid event id.", "error");
      return;
    }

    try {
      const { data: eventData, error: eventErr } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (eventErr) throw eventErr;

      if (!eventData) {
        showToast("Event not found.", "error");
        router.replace("/dashboard/events");
        setLoading(false);
        return;
      }

      const { data: photosData, error: photosErr } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", eventId)
        .order("id", { ascending: false });

      if (photosErr) throw photosErr;

      const { data: paymentsData, error: paymentsErr } = await supabase
        .from("event_payments")
        .select("*")
        .eq("event_id", eventId)
        .order("payment_date", { ascending: false });

      if (paymentsErr) throw paymentsErr;

      const loadedPhotos: Photo[] = photosData ? photosData.map((p: any) => ({
        id: p.id,
        public_url: p.public_url,
        file_name: p.file_name,
        faces_count: p.faces_count || 0,
        tag_color: p.tag_color || "Session Asset",
        is_favorite: !!p.is_favorite,
        client_note: p.client_note || "",
        client_comment: p.client_comment || p.comment || "",
        client_reacted: !!p.is_favorite
      })) : [];

      const loadedPayments: PaymentRecord[] = paymentsData ? paymentsData.map((pm: any) => {
        const dateObj = new Date(pm.payment_date);
        return {
          id: pm.id,
          amount: Number(pm.amount),
          payment_date: dateObj.toLocaleDateString('en-GB') + ' ' + dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          payment_mode: pm.payment_mode,
          reference_id: pm.reference_id
        };
      }) : [];

      const totalPaidViaLedger = loadedPayments.reduce((sum, item) => sum + item.amount, 0);

      setEvent({
        id: eventData.id,
        title: eventData.title || "Naik Event",
        clientName: eventData.client_name || "Shiva Bhau",
        phone: eventData.client_phone || "N/A",
        eventType: eventData.event_type || "Wedding",
        venue: eventData.venue || "TBD",
        date: eventData.event_date ? new Date(eventData.event_date).toLocaleDateString('en-GB') : "TBD",
        totalPhotos: loadedPhotos.length,
        status: eventData.status || "active",
        packageSelected: eventData.package_selected || "Premium Package",
        budget: Number(eventData.budget) || 150000,
        advancePaid: totalPaidViaLedger,
        notes: eventData.notes || ""
      });

      refreshGalleryState(loadedPhotos);
      setPayments(loadedPayments);
    } catch (err) {
      console.error(err);
      showToast("Unable to load event workspace.", "error");
      router.replace("/dashboard/events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await loadWorkspaceData();
    };

    init();

    return () => {
      mounted = false;
    };
  }, [eventId, gallerySubTab]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!event || !supabase) return;
    if (updatingStatus) return;

    if (!canMoveToStatus(event.status, newStatus)) {
      showToast("Invalid lifecycle transition.", "error");
      return;
    }

    setUpdatingStatus(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({ status: newStatus })
        .eq("id", event.id);

      if (error) throw error;

      setEvent(prev => prev ? { ...prev, status: newStatus } : prev);
      showToast("Lifecycle updated.", "success");
      await loadWorkspaceData();
    } catch (err) {
      console.error(err);
      showToast("Unable to update lifecycle.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPayment || !supabase) return;

    console.log("STEP 1");
    const amount = Number(newAmount);
    if (!amount || amount <= 0) {
      showToast("Enter valid payment amount", "error");
      return;
    }

    setSavingPayment(true);

    try {
      const paymentPayload = {
        event_id: eventId,
        amount,
        payment_mode: newMode,
        reference_id: newRefId.trim() || null,
        payment_date: new Date().toISOString()
      };
      console.log("STEP 2", paymentPayload);

      const { error: paymentError } = await supabase
        .from("event_payments")
        .insert(paymentPayload);
      
      console.log("STEP 3", paymentError);
      if (paymentError) throw paymentError;

      const currentAdvance = Number(event?.advancePaid ?? 0);
      const updatedAdvance = currentAdvance + amount;

      const { error: eventError } = await supabase
        .from("events")
        .update({ advance_paid: updatedAdvance })
        .eq("id", eventId);
      
      console.log("STEP 4", eventError);
      if (eventError) throw eventError;

      setNewAmount("");
      setNewMode("UPI");
      setNewRefId("");
      setIsPaymentModalOpen(false);

      await loadWorkspaceData();
      showToast("Payment recorded successfully.", "success");
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      showToast(String(err), "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const openUploadTrigger = () => {
    setIsUploadModalOpen(true);
  };

  const openQrTrigger = () => {
    const liveGalleryUrl = `https://narayanifilms-client.net/gallery/${eventId}/access`;
    const generatedQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveGalleryUrl)}&color=0A3F61`;
    setQrCodeUrl(generatedQr);
    setIsQrModalOpen(true);
  };

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !supabase) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const extension = file.name.split(".").pop();
        const storagePath = `${eventId}/${crypto.randomUUID()}.${extension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(storagePath, file);

        if (uploadError) {
          console.error("UPLOAD ERROR", uploadError);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(storagePath);

        const { data, error } = await supabase
          .from("event_photos")
          .insert({
            event_id: eventId,
            public_url: publicUrlData.publicUrl,
            file_name: file.name,
            is_favorite: false,
          })
          .select();

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      await loadWorkspaceData();
      showToast(`Upload completed successfully.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Upload failed.", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setIsUploadModalOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggleFavorite = async (photoId: string, currentFav: boolean) => {
    if (!supabase) return;
    try {
      const newValue = !currentFav;
      const { error } = await supabase
        .from("event_photos")
        .update({ is_favorite: newValue })
        .eq("id", photoId);

      if (error) throw error;

      const updatedPhotos = photos.map(photo => {
        if (photo.id !== photoId) return photo;
        return {
          ...photo,
          is_favorite: newValue,
          client_reacted: newValue
        };
      });

      setPhotos(updatedPhotos);
      if (gallerySubTab === "selected") {
        setFilteredPhotos(updatedPhotos.filter(photo => photo.is_favorite));
      } else {
        setFilteredPhotos(updatedPhotos);
      }

      if (selectedPhotoForPreview && selectedPhotoForPreview.id === photoId) {
        setSelectedPhotoForPreview(prev => prev ? { ...prev, is_favorite: newValue, client_reacted: newValue } : null);
      }

      showToast(newValue ? "Client Selection Updated" : "Selection Removed", "success");
    } catch (err) {
      console.error(err);
      showToast("Unable to update selection.", "error");
    }
  };

  const handlePrintInvoice = () => { window.print(); };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center font-bold text-[#0A3F61] bg-slate-50 flex-col gap-3">
        <Loader2 size={36} className="animate-spin text-[#0A3F61]" />
        <span className="text-sm tracking-widest uppercase animate-pulse">Initializing Production workspace...</span>
      </div>
    );
  }

  const budgetNum = event?.budget || 0;
  const advanceNum = event?.advancePaid || 0;
  const remainingAmount = Math.max(0, budgetNum - advanceNum).toLocaleString("en-IN");
  const favoritePhotosCount = photos.reduce((total, photo) => photo.is_favorite ? total + 1 : total, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-900 print:bg-white print:p-0 relative">
      <input type="file" ref={fileInputRef} onChange={handleRealUpload} multiple accept="image/*" className="hidden" />

      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in text-white font-bold text-xs ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-[1700px] mx-auto space-y-6 print:hidden">
        <EventWorkspaceHeader
          activeTab={activeTab}
          eventTitle={event?.title}
          onBack={() => router.push("/dashboard/events")}
          onOverview={() => setActiveTab("overview")}
          onGallery={() => setActiveTab("gallery")}
        />

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-[#0A3F61] rounded-2xl"><ImageIcon size={22} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ingested Media</p>
                  <h4 className="text-xl font-bold text-slate-900">{photos.length} RAW Assets</h4>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Star size={22} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Client Selected</p>
                  <h4 className="text-xl font-bold text-slate-900">{favoritePhotosCount} Favorites</h4>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Users size={22} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Delivery Nodes</p>
                  <h4 className="text-xl font-bold text-slate-900">QR Sync Active</h4>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={22} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Curation Status</p>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-max">{event?.status?.replace("_", " ")}</h4>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-[#0A3F61]" />
                    <span>Album Selection Lifecycle Control</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("selection_started")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'selection_started' ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      🕒 Selection Started
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("selected")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'selected' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      ✓ Selection Confirmed
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("editing")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'editing' ? 'bg-[#0A3F61] border-[#0A3F61] text-white shadow-md' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      🚀 Editing Suite
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("editing_completed")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'editing_completed' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      ✨ Editing Completed
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("album_ready")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'album_ready' ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      📖 Album Ready
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("delivered")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'delivered' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      📦 Delivered
                    </button>
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus("completed")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${event?.status === 'completed' ? 'bg-green-600 border-green-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      🎉 Completed
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">🎬 Production Slate</h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                      <Users size={16} className="text-[#0A3F61]" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Principal Client</span>
                        <strong className="text-slate-800 text-sm">{event?.clientName}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                      <Phone size={16} className="text-[#0A3F61]" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Secure Contact</span>
                        <strong className="text-slate-800 text-sm">{event?.phone}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                      <Calendar size={16} className="text-[#0A3F61]" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Production Date</span>
                        <strong className="text-slate-800 text-sm">{event?.date}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                      <MapPin size={16} className="text-[#0A3F61]" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Venue</span>
                        <strong className="text-slate-800 text-sm line-clamp-1">{event?.venue}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${getStatusColor(event?.status || "")}`}>
                      {event?.status?.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">📜 Recent Ledger Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b text-slate-400 uppercase">
                          <th className="pb-2">Date & Time</th>
                          <th className="pb-2">Mode</th>
                          <th className="pb-2">Transaction ID / Ref ID</th>
                          <th className="pb-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length > 0 ? (
                          [...payments]
                            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                            .map((p) => (
                              <tr key={p.id} className="border-b last:border-0 text-slate-700">
                                <td className="py-2.5 font-medium">{p.payment_date}</td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded-md font-bold text-slate-600">{p.payment_mode}</span>
                                </td>
                                <td className="py-2.5 text-slate-500 font-mono">{p.reference_id || "N/A"}</td>
                                <td className="py-2.5 text-right font-bold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                              </tr>
                            ))
                        ) : (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-400">No transaction rows captured yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <FinancialLedgerCard
                budget={budgetNum}
                advancePaid={advanceNum}
                remainingAmount={remainingAmount}
                onAddPayment={() => setIsPaymentModalOpen(true)}
                onGenerateInvoice={() => setIsInvoiceModalOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0A3F61] text-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
                <button onClick={() => setGallerySubTab('all')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${gallerySubTab === 'all' ? 'bg-white text-[#0A3F61] shadow-sm' : 'text-white/80'}`}>All Studio Media ({photos.length})</button>
                <button onClick={() => setGallerySubTab('selected')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${gallerySubTab === 'selected' ? 'bg-amber-500 text-white shadow-sm border-amber-500' : 'text-white/80'}`}>
                  <Star size={12} fill={gallerySubTab === 'selected' ? "white" : "none"} />
                  <span>Client Selected ({favoritePhotosCount})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isAiFiltered && <button onClick={resetAiFilter} className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"><RefreshCw size={12} /> Reset AI Filter</button>}
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#0A3F61] hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"><FolderPlus size={14} /> Create Album</button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">{gallerySubTab === 'selected' ? "🔑 Locked Client Favorites Bucket" : "Photo Gallery Workspace"}</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPhotos.length > 0 ? (
                    filteredPhotos.map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        onClick={() => setSelectedPhotoForPreview(photo)}
                        className={`border rounded-2xl overflow-hidden bg-slate-50 relative group aspect-square flex flex-col justify-between cursor-pointer transition-all ${selectedPhotoForPreview?.id === photo.id ? 'border-2 border-[#0A3F61] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(photo.id, !!photo.is_favorite);
                          }}
                          className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg border backdrop-blur-md transition-all ${photo.is_favorite ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white/80 border-slate-200 text-slate-400 hover:text-amber-500'}`}
                        >
                          <Star size={12} fill={photo.is_favorite ? "currentColor" : "none"} />
                        </button>

                        <div className="p-3 w-full flex items-center justify-between z-10">
                          <span className="text-[10px] font-bold text-white drop-shadow bg-black/40 px-2 py-0.5 rounded-md line-clamp-1">{photo.file_name}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-5"></div>

                        <img
                          src={photo.public_url}
                          alt={photo.file_name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        <div className="p-3 w-full space-y-2 z-10 mt-auto">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-white flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                              {photo.tag_color || "Session Asset"}
                            </span>
                            <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                              👥 {photo.faces_count || 1} Faces
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {photo.is_favorite && (
                              <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-bold">
                                ⭐ Selected
                              </span>
                            )}
                            {photo.client_comment && (
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-bold">
                                💬 Comment
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-16 text-center text-slate-400 text-xs font-medium">No active assets found in grid. Upload images to see thumbnails.</div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-md font-bold text-slate-900 border-b pb-2">Event Quick Actions</h3>
                  <div className="space-y-2.5">
                    <div onClick={openUploadTrigger} className="flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer group transition-all">
                      <div className="flex items-center gap-3">
                        <UploadCloud size={16} className="text-blue-500" />
                        <h5 className="text-xs font-bold text-slate-700">Upload Photos</h5>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-[#0A3F61] font-semibold transition-colors">Open →</span>
                    </div>
                    <div onClick={openQrTrigger} className="flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer group transition-all">
                      <div className="flex items-center gap-3">
                        <QrCode size={16} className="text-emerald-500" />
                        <h5 className="text-xs font-bold text-slate-700">Generate QR</h5>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 font-semibold transition-colors">Open →</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-bold text-slate-900">Photo Details</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{selectedPhotoForPreview ? selectedPhotoForPreview.file_name : "No photo selected"}</p>
                    </div>
                  </div>
                  <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center text-slate-400 shadow-inner">
                    {selectedPhotoForPreview ? (
                      <img
                        src={selectedPhotoForPreview.public_url}
                        alt="Preview Target"
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={32} className="mx-auto mb-2 text-slate-300" />
                        <span className="text-xs font-medium block">Select a photo to review</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-2 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={12} className="text-[#0A3F61]" />
                      <span>Client Instruction / Note</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                        {selectedPhotoForPreview?.client_note ? `"${selectedPhotoForPreview.client_note}"` : "No special instructions or comments added by client on this asset yet."}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selectedPhotoForPreview?.is_favorite && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                            ⭐ Client Selected
                          </span>
                        )}
                        {selectedPhotoForPreview?.client_reacted && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            ❤️ Client Reacted
                          </span>
                        )}
                      </div>

                      {selectedPhotoForPreview?.client_comment && (
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 shadow-sm">
                          <div className="text-[10px] uppercase font-bold text-blue-600 mb-1">
                            Client Comment
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            {selectedPhotoForPreview.client_comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:z-0">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl mx-4 space-y-6 border border-slate-100 print:border-0 print:p-0 print:shadow-none animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Production Billing Summary</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintInvoice} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A3F61] hover:bg-[#072f49] text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                  <Printer size={13} />Print / Save PDF
                </button>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start border-b pb-5 border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-[#0A3F61] tracking-tight">NARAYANI FILMS</h2>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Films & Photography Studio</p>
                </div>
                <div className="text-right text-xs">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-bold tracking-wide uppercase">Statement of Account</span>
                  <p className="text-[10px] text-slate-400 mt-2">Date: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To:</span>
                  <strong className="text-slate-900 text-sm block">{event?.clientName}</strong>
                  <span className="text-slate-500 block mt-0.5">📞 {event?.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Project Details:</span>
                  <strong className="text-slate-800 block">{event?.title}</strong>
                  <span className="text-slate-500 block mt-0.5">📍 {event?.venue} • {event?.date}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400">Financial Breakdown</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-50 p-3 border-b font-bold text-slate-500 uppercase text-[10px]">
                    <span>Description</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                    <span>Photography Package ({event?.packageSelected})</span>
                    <span className="text-center text-blue-600 font-bold uppercase text-[10px]">{event?.status.replace("_", " ")}</span>
                    <span className="text-right font-semibold">₹{budgetNum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-b border-slate-100 bg-emerald-50/20">
                    <span className="text-emerald-700 font-medium">Total Received Credit</span>
                    <span className="text-center text-emerald-600 font-bold text-[10px]">Paid</span>
                    <span className="text-right font-black text-emerald-700">₹{advanceNum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 bg-rose-50/20 font-bold">
                    <span className="text-rose-800">Outstanding Balance Due</span>
                    <span className="text-center text-rose-600 uppercase text-[10px]">Pending</span>
                    <span className="text-right font-black text-rose-700">₹{remainingAmount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400">Ledger Credit Receipts</h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-slate-400 uppercase text-[10px]">
                        <th className="pb-1.5">Date</th>
                        <th className="pb-1.5">Mode</th>
                        <th className="pb-1.5">Transaction ID</th>
                        <th className="pb-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...payments]
                        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                        .map((p) => (
                          <tr key={p.id} className="border-b border-slate-100 text-slate-700 last:border-0">
                            <td className="py-2">{p.payment_date}</td>
                            <td className="py-2">{p.payment_mode}</td>
                            <td className="py-2 font-mono text-slate-400">{p.reference_id || "-"}</td>
                            <td className="py-2 text-right font-bold">₹{p.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-800">Thank you for choosing Narayani Films & Photography!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form onSubmit={handleRecordPayment} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl mx-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Record New Payment Entry</h3>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Amount Received (₹)</label>
              <input type="number" required value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. 20000" className="w-full border px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-[#0A3F61]" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Payment Method</label>
              <select value={newMode} onChange={(e) => setNewMode(e.target.value)} className="w-full border px-3 py-2 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0A3F61]">
                <option value="UPI">UPI / GooglePay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank NetBanking</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Transaction ID / Ref ID</label>
              <input type="text" value={newRefId} onChange={(e) => setNewRefId(e.target.value)} placeholder="e.g. TXN9832410" className="w-full border px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-[#0A3F61]" />
            </div>
            <button
              type="submit"
              disabled={savingPayment}
              className="w-full py-2.5 bg-[#0A3F61] hover:bg-[#072f49] text-white text-xs font-bold rounded-xl shadow disabled:opacity-50 transition-colors"
            >
              {savingPayment ? "Saving..." : "Save Transaction"}
            </button>
          </form>
        </div>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl mx-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-md font-bold text-slate-900">Media Ingestion</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all p-12 flex flex-col items-center justify-center gap-3 cursor-pointer text-center rounded-2xl">
              {uploading ? (
                <div className="space-y-2">
                  <Loader2 className="animate-spin text-[#0A3F61] mx-auto" size={24} />
                  <p className="text-sm font-bold text-[#0A3F61]">Uploading Cloud Buffers... {uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud size={32} className="text-[#0A3F61] mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Click to Select and Upload Images</p>
                  <p className="text-xs text-slate-400">PNG, JPG, JPEG or WEBP formats supported</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl mx-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Live Access QR</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border mb-4">
              <img src={qrCodeUrl} alt="Live QR" className="w-44 h-44 mx-auto mix-blend-multiply" />
            </div>
            <button
              onClick={() => {
                const liveUrl = `https://narayanifilms-client.net/gallery/${eventId}/access`;
                navigator.clipboard.writeText(liveUrl);
                showToast("Access link successfully copied to clipboard!", "success");
              }}
              className="w-full py-2 bg-[#0A3F61] hover:bg-[#072f49] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Copy Access Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}