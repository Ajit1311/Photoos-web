"use client";

import React, { useState } from "react";
import {
  Camera,
  CheckCheck,
  Crown,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface StudioClientChatProps {
  studioName?: string;
  studioPhone?: string;
  studioEmail?: string;
  eventName?: string;
  clientName?: string;
  isBrideOrGroom: boolean;
  eventId: string;
}

interface ChatMessage {
  id: string;
  sender: "client" | "studio";
  senderName: string;
  text: string;
  time: string;
}

export default function StudioClientChat({
  studioName = "PhotoOS Studio Team",
  studioPhone,
  studioEmail,
  eventName = "Your Event",
  clientName = "Bride & Groom",
  isBrideOrGroom,
  eventId,
}: StudioClientChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome-1",
      sender: "studio",
      senderName: studioName,
      text: `Hello ${clientName}! Warmest congratulations on your wonderful celebration! This is your dedicated direct desk with our photography team.`,
      time: "Studio Team",
    },
    {
      id: "msg-welcome-2",
      sender: "studio",
      senderName: studioName,
      text: "You can use this chat to inquire about album design drafts, request color corrections, or ask any questions about your high-resolution deliverables.",
      time: "Studio Team",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  // If not bride or groom, access is restricted
  if (!isBrideOrGroom) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center animate-in fade-in">
        <ShieldAlert className="mx-auto h-12 w-12 text-amber-400" />
        <h3 className="mt-4 text-base font-bold text-white">Direct Studio Chat Restricted</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Studio Chat is reserved exclusively for the Bride & Groom to communicate directly with the photography team.
        </p>
      </div>
    );
  }

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || sending) return;

    const newMsg: ChatMessage = {
      id: `client-msg-${Date.now()}`,
      sender: "client",
      senderName: clientName,
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    setSending(true);

    // Sync to CRM / Studio Leads endpoint
    void fetch("/api/events/guest-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        guestName: clientName,
        guestPhone: studioPhone || "Client",
        role: "bride_groom_message",
      }),
    });

    // Simulated studio acknowledgement
    setTimeout(() => {
      setSending(false);
      const ackMsg: ChatMessage = {
        id: `studio-ack-${Date.now()}`,
        sender: "studio",
        senderName: studioName,
        text: "Thank you for your message! Our editing and coordination team has received your note and will review it shortly. You can also reach our lead photographer directly on WhatsApp above.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, ackMsg]);
    }, 1200);
  };

  const openStudioWhatsApp = () => {
    const phone = studioPhone ? studioPhone.replace(/\D/g, "") : "919822012345";
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const text = encodeURIComponent(
      `Hello ${studioName},\nThis is ${clientName} from "${eventName}". I am messaging from our PhotoOS client portal regarding our gallery.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
  };

  const handleCallStudio = () => {
    if (!studioPhone) return;
    const clean = studioPhone.replace(/\D/g, "");
    window.open(`tel:${clean}`, "_self");
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Studio Header Card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3F61]/80 via-slate-900 to-[#071f31] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EF8619] to-amber-400 text-black shadow-lg">
              <Camera className="h-6 w-6" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white">{studioName}</h2>
                <Crown className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live Studio Desk &bull; Bride & Groom Portal
              </p>
            </div>
          </div>

          {/* Quick WhatsApp / Call */}
          <div className="flex items-center gap-2">
            {studioPhone && (
              <button
                type="button"
                onClick={handleCallStudio}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-sky-400 hover:bg-white/10"
                title="Call Studio"
              >
                <Phone className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={openStudioWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white shadow-md hover:brightness-105"
            >
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleSendMessage(undefined, "When will our album layout draft be ready?")}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
          >
            📖 Album Draft Status
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(undefined, "Can you review our selected photos for color grading?")}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
          >
            🎨 Color Grading Review
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage(undefined, "Could you share the high-resolution raw photos drive link?")}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
          >
            💾 Raw Photos Link
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="space-y-3 min-h-[300px] max-h-[440px] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
        {messages.map((m) => {
          const isClient = m.sender === "client";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                <span>{m.senderName}</span>
                <span>&bull;</span>
                <span>{m.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isClient
                    ? "bg-gradient-to-r from-[#0A3F61] to-[#0d507b] text-white rounded-br-none shadow-md"
                    : "border border-white/10 bg-white/5 text-slate-200 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              {isClient && (
                <div className="flex items-center gap-1 text-[10px] text-sky-400 mt-0.5 px-1">
                  <CheckCheck className="h-3 w-3" />
                  <span>Delivered</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Message Input Box */}
      <form onSubmit={(e) => handleSendMessage(e)} className="relative">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${studioName} directly...`}
          className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-4 pr-12 text-xs text-white placeholder-slate-400 outline-none focus:border-[#EF8619] focus:bg-white/10"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[#0A3F61] p-2 text-white transition hover:bg-[#08344f] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
