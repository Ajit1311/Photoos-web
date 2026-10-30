"use client";

import { useState } from "react";
import {
  Boxes,
  Mail,
  Cloud,
  Database,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function IntegrationsSettingsPage() {
  const integrations = [
    {
      name: "Resend Email Service",
      description: "High-deliverability transactional emails, department inbox routing, and 2FA OTP codes.",
      status: "Connected & Active",
      icon: Mail,
      category: "Communication",
      color: "text-purple-600 bg-purple-50",
    },
    {
      name: "Cloudflare R2 Storage",
      description: "S3-compatible distributed object storage for ultra-fast full-resolution photo uploads.",
      status: "Connected & Active",
      icon: Cloud,
      category: "Infrastructure",
      color: "text-amber-600 bg-amber-50",
    },
    {
      name: "Supabase PostgreSQL",
      description: "Primary relational database engine with Row Level Security (RLS) and real-time triggers.",
      status: "Connected & Healthy",
      icon: Database,
      category: "Data Store",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      name: "Vercel Edge Network",
      description: "Global low-latency CDN and edge serverless compute for the PhotoOS web platform.",
      status: "Production Node Active",
      icon: Boxes,
      category: "Deployment",
      color: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Platform Integrations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connected external cloud microservices, messaging APIs, and storage backends.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.status}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Authenticated
                </span>
                <span>Production Mode</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

