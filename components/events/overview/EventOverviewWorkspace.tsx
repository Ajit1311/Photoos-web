'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Image as ImageIcon, UploadCloud, Users, QrCode, 
  CheckCircle2, X, Star, LayoutDashboard, Clock, Loader2,
  Calendar, MapPin, RefreshCw, PlusCircle, FileText, Printer, CheckCircle, MessageSquare
} from "lucide-react";

// Router navigation hooks

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function EventWorkspacePage() {
  // 1. Rules of Hooks: Place all hooks at top level
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'gallery'>('overview');
  const [gallerySubTab, setGallerySubTab] = useState<'all' | 'selected'>('all'); 
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]); 
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false); 
  const [savingPayment, setSavingPayment] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<any | null>(null);

  const [newAmount, setNewAmount] = useState("");
  const [newMode, setNewMode] = useState("UPI");
  const [newRefId, setNewRefId] = useState("");

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const STATUS_FLOW = [
    "active", "selection_started", "selected", "editing", 
    "editing_completed", "album_ready", "delivered", "completed"
  ] as const;

  const canMoveToStatus = (current: string, target: string) => {
    const currentIndex = STATUS_FLOW.indexOf(current as any);
    const targetIndex = STATUS_FLOW.indexOf(target as any);
    return currentIndex !== -1 && targetIndex !== -1 && targetIndex >= currentIndex;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "selection_started": return "bg-orange-100 text-orange-700";
      case "selected": return "bg-amber-100 text-amber-700";
      case "editing": return "bg-blue-100 text-blue-700";
      case "editing_completed": return "bg-indigo-100 text-indigo-700";
      case "album_ready": return "bg-purple-100 text-purple-700";
      case "delivered": return "bg-emerald-100 text-emerald-700";
      case "completed": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const loadWorkspaceData = async () => {
    if (!eventId) {
      setLoading(false);
      showToast("Invalid event id.", "error");
      return;
    }
    // Data fetching logic
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadWorkspaceData();
    return () => { mounted = false; };
  }, [eventId]);

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        // [Upload Logic Here]
        const insertError = false; // For simulation
        
        if (insertError) {
          console.error("Database Insert Error:", insertError);
          throw new Error("Database insertion failed");
        }
      }
      showToast("Upload success", "success");
    } catch (err) {
      console.error(err);
      showToast("Upload failed.", "error");
    } finally {
      setUploading(false);
      setIsUploadModalOpen(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl text-white font-bold ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/events")} className="p-2 hover:bg-slate-100 rounded-xl"><ArrowLeft size={18} /></button>
          <h1 className="font-bold">Project Workspace</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            {/* Overview Tabs / Content */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <h2 className="text-xl font-bold">Event Details</h2>
                {/* Additional UI elements here */}
            </div>
        </div>
      </div>
    </div>
  );
}