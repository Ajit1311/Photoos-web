'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Calendar, MapPin, Users, ArrowUpRight, Plus, Search, X, Camera, IndianRupee, Phone, Briefcase, RotateCcw, Loader2, FileText } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-url.supabase.co";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

interface EventItem {
  id: string;
  title: string;
  clientName: string;
  phone: string;
  date: string;
  venue: string;
  totalPhotos: number;
  status: 'active' | 'completed' | 'draft';
  eventType: string;
  packageSelected: string;
  budget: string;
  advancePaid: string;
}

export default function EventsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // फॉर्म स्टेट
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    phone: "",
    date: "",
    venue: "",
    eventType: "Wedding",
    packageSelected: "Premium Package",
    budget: "",
    advancePaid: "",
    notes: ""
  });

  const confirmedBookings = [
    { id: "book-101", clientName: "Rahul Deshmukh", phone: "9876543210", date: "2026-07-18", venue: "Laxmi Lawns, Pune", eventType: "Wedding", packageSelected: "Premium Package", budget: "150000", advancePaid: "50000", title: "Rahul & Priya - Traditional Wedding" },
    { id: "book-102", clientName: "Shiva Bhau", phone: "8888888888", date: "2026-07-25", venue: "Royal Palace, Mumbai", eventType: "Birthday", packageSelected: "Silver Package", budget: "75000", advancePaid: "75000", title: "Shiva Bhau - Grand Birthday Shoot" }
  ];

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted: EventItem[] = data.map(item => ({
            id: item.id,
            title: item.title,
            clientName: item.client_name,
            phone: item.client_phone || "N/A",
            date: item.event_date ? new Date(item.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "TBD",
            venue: item.venue || "TBD",
            totalPhotos: item.total_photos || 0,
            status: item.status || "active",
            eventType: item.event_type || "Wedding",
            packageSelected: item.package_selected || "Premium Package",
            budget: item.budget ? Number(item.budget).toLocaleString('en-IN') : "0",
            advancePaid: item.advance_paid ? Number(item.advance_paid).toLocaleString('en-IN') : "0"
          }));
          setEvents(formatted);
          return;
        }
      } catch (err) {
        console.warn("Supabase load failed, switching to local backup:", err);
      }

      const localData = localStorage.getItem("workspace_events");
      if (localData) {
        setEvents(JSON.parse(localData));
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    if (!bookingId) return;
    const selected = confirmedBookings.find(b => b.id === bookingId);
    if (selected) {
      setFormData({
        title: selected.title,
        clientName: selected.clientName,
        phone: selected.phone,
        date: selected.date,
        venue: selected.venue,
        eventType: selected.eventType,
        packageSelected: selected.packageSelected,
        budget: selected.budget,
        advancePaid: selected.advancePaid,
        notes: `Auto-fetched booking ref: ${selected.id}`
      });
    }
  };

  const handleClearForm = () => {
    setSelectedBookingId("");
    setFormData({ title: "", clientName: "", phone: "", date: "", venue: "", eventType: "Wedding", packageSelected: "Premium Package", budget: "", advancePaid: "", notes: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName) return;
    setIsSubmitting(true);

    const temporaryId = `event-${Date.now()}`;
    const localNewEvent: EventItem = {
      id: temporaryId,
      title: formData.title,
      clientName: formData.clientName,
      phone: formData.phone || "N/A",
      date: formData.date ? new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "TBD",
      venue: formData.venue || "TBD",
      totalPhotos: 0,
      status: "active",
      eventType: formData.eventType,
      packageSelected: formData.packageSelected,
      budget: formData.budget ? Number(formData.budget).toLocaleString('en-IN') : "0",
      advancePaid: formData.advancePaid ? Number(formData.advancePaid).toLocaleString('en-IN') : "0"
    };

    const updatedEvents = [localNewEvent, ...events];
    setEvents(updatedEvents);
    localStorage.setItem("workspace_events", JSON.stringify(updatedEvents));

    try {
      await supabase.from("events").insert([{
        title: formData.title,
        client_name: formData.clientName,
        client_phone: formData.phone,
        event_date: formData.date || null,
        venue: formData.venue,
        event_type: formData.eventType,
        package_selected: formData.packageSelected,
        budget: formData.budget ? parseInt(formData.budget) : 0,
        advance_paid: formData.advancePaid ? parseInt(formData.advancePaid) : 0,
        notes: formData.notes,
        status: "active",
        total_photos: 0
      }]);
    } catch (err) {
      console.error("Supabase insert skipped/failed, saved locally:", err);
    } finally {
      setIsSubmitting(false);
      handleClearForm();
      setIsModalOpen(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 relative">
      {/* Top Heading Box */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">All Events</h1>
          <p className="text-xs text-slate-500 mt-1">Access and manage all photographic events, live AI galleries, and delivery history.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0A3F61] hover:bg-[#0A3F61]/95 text-white text-sm font-bold shadow-md transition-all whitespace-nowrap">
          <Plus size={18} />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search events by name or client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0A3F61] text-sm text-slate-800" />
        </div>
      </div>

      {/* Events Grid List */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold bg-slate-100 text-[#0A3F61] px-2.5 py-1 rounded-md border border-slate-200">{event.eventType} • {event.packageSelected}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">{event.status}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0A3F61] transition-colors line-clamp-1">{event.title}</h3>
              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2.5 text-xs text-slate-600"><Users size={14} className="text-slate-400" /><span>Client: <strong className="text-slate-800">{event.clientName}</strong></span></div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600"><Calendar size={14} className="text-slate-400" /><span>{event.date}</span></div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600"><MapPin size={14} className="text-slate-400" /><span className="line-clamp-1">{event.venue}</span></div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-0.5"><IndianRupee size={12} /> {event.budget} Budget</span>
              <span className="font-bold text-[#0A3F61] bg-slate-50 px-2.5 py-1 rounded-md">{event.totalPhotos.toLocaleString()} Items</span>
            </div>
          </Link>
        ))}
      </div>

      {/* CREATE EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-xl border border-slate-100 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Event Workspace</h3>
                <p className="text-xs text-slate-400 mt-0.5">Link an existing confirmed customer booking or initialize manually.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); handleClearForm(); }} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"><X size={18} /></button>
            </div>

            <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#0A3F61] uppercase tracking-wider">⚡ Link Confirmed Booking</label>
                {selectedBookingId && (
                  <button type="button" onClick={handleClearForm} className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100 transition-colors shadow-sm"><RotateCcw size={12} /><span>Reset Form</span></button>
                )}
              </div>
              <select value={selectedBookingId} onChange={(e) => handleBookingSelect(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none">
                <option value="">-- Select a Client Booking --</option>
                {confirmedBookings.map((b) => (<option key={b.id} value={b.id}>{b.clientName} - {b.eventType}</option>))}
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Workspace Title</label>
                <input type="text" required placeholder="Event Name" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Client Name</label>
                  <input type="text" required placeholder="Name" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Type</label>
                  <select value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none">
                    <option value="Wedding">Wedding Shoot</option>
                    <option value="Pre-Wedding">Pre-Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday">Birthday Celebration</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Half Saree">Half Saree Function</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Selected Package</label>
                  <select value={formData.packageSelected} onChange={(e) => setFormData({...formData, packageSelected: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none">
                    <option value="Basic Package">Basic Package</option>
                    <option value="Silver Package">Silver Package</option>
                    <option value="Premium Package">Premium Package</option>
                    <option value="Custom Package">Custom Package</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Venue</label>
                  <input type="text" placeholder="Venue" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Budget</label>
                  <input type="number" placeholder="₹" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Advance Paid</label>
                  <input type="number" placeholder="₹" value={formData.advancePaid} onChange={(e) => setFormData({...formData, advancePaid: e.target.value})} className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61]" />
                </div>
              </div>

              {/* Requirement Notes Block */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <FileText size={14} className="text-slate-400" />
                  <span>Special Requirements / Client Notes</span>
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Need raw delivery within 2 days, high-end color grading required..." 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0A3F61] text-slate-800 resize-none" 
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setIsModalOpen(false); handleClearForm(); }} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-[#0A3F61] hover:bg-[#0A3F61]/95 text-white text-sm font-semibold shadow flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                  <span>Initialize Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}