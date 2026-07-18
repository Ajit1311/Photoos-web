'use client';

import { useState, useRef } from 'react';
import CustomToast from '@/components/ui/custom-toast';

interface FaceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  studioId: string;
  onFaceMatched: (faceProfileId: string) => void;
}

export default function FaceSearchModal({
  isOpen,
  onClose,
  galleryId,
  studioId,
  onFaceMatched,
}: FaceSearchModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartScan = async () => {
    if (!imagePreview) return;
    setIsScanning(true);

    try {
      const response = await fetch('/api/ai/face-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          galleryId: galleryId,
          studioId: studioId,
        }),
      });

      const result = await response.json();

      if (result.success && result.faceProfileId) {
        setToast({ message: "Face recognized successfully! 👥✨", type: 'success' });
        
        setTimeout(() => {
          onFaceMatched(result.faceProfileId);
          onClose();
        }, 1500);
      } else {
        setToast({ message: result.error || "Face not recognized. Please try with a clearer selfie.", type: 'warning' });
      }
    } catch (err) {
      setToast({ message: "An error occurred during AI scanning. Please try again.", type: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-between p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      {toast && (
        <CustomToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-slate-900">Find My Photos (AI Search)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold">×</button>
        </div>

        <div className="my-6 flex flex-col items-center justify-center">
          {imagePreview ? (
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#0A3F61]/30 shadow-inner">
              <img src={imagePreview} alt="Selfie Preview" className="w-full h-full object-cover" />
              {isScanning && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-full h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] absolute top-0 animate-bounce" style={{ animationDuration: '2s' }} />
                  <span className="text-xs text-white font-medium tracking-wider animate-pulse">AI SCANNING...</span>
                </div>
              )}
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-48 h-48 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <span className="text-4xl mb-2">📸</span>
              <span className="text-xs text-slate-500 font-medium">Upload or Take Selfie</span>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setImagePreview(null); fileInputRef.current?.click(); }}
            className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm"
            disabled={isScanning}
          >
            Retake
          </button>
          <button
            onClick={handleStartScan}
            className="flex-1 px-5 py-3 rounded-2xl bg-[#0A3F61] font-medium text-white hover:bg-[#0A3F61]/90 disabled:bg-slate-300 transition-colors text-sm"
            disabled={!imagePreview || isScanning}
          >
            {isScanning ? 'Processing...' : 'Start AI Search'}
          </button>
        </div>
      </div>
    </div>
  );
}