"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Download,
  Filter,
  Search
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { LEGAL_CONFIG } from "@/config/legal";

export default function AdminComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<Array<{
    id: string;
    user_id: string;
    document_type: string;
    version: string;
    consent_type: string;
    accepted_at: string;
    withdrawn_at: string | null;
  }>>([]);
  const [requests, setRequests] = useState<Array<{
    id: string;
    user_id: string;
    request_type: string;
    status: string;
    details: Record<string, unknown>;
    created_at: string;
    sla_due_at: string;
  }>>([]);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch consent records
      const { data: consentData } = await supabase
        .from("user_consents")
        .select("id, user_id, document_type, version, consent_type, accepted_at, withdrawn_at")
        .order("accepted_at", { ascending: false })
        .limit(50);

      if (consentData) {
        setConsents(consentData);
      }

      // 2. Fetch data rights requests
      const { data: requestData } = await supabase
        .from("data_rights_requests")
        .select("id, user_id, request_type, status, details, created_at, sla_due_at")
        .order("created_at", { ascending: false });

      if (requestData) {
        setRequests(requestData);
      }
    } catch (err) {
      console.warn("[AdminCompliance] Load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateRequestStatus(id: string, newStatus: string) {
    try {
      await supabase
        .from("data_rights_requests")
        .update({ 
          status: newStatus,
          resolved_at: newStatus === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      loadData();
    } catch (err) {
      console.error("[AdminCompliance] Update error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                PhotoOS Admin Console
              </span>
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                v{LEGAL_CONFIG.version}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Statutory Compliance & DPDP Act Oversight
            </h1>
            <p className="text-xs text-slate-400">
              Central regulatory dashboard for user consents, biometric vector revocations, and statutory 30-day DPDP Act requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Refresh Audit
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-medium text-slate-400">Legal Document Version</span>
            <p className="mt-1 text-2xl font-bold text-white">v{LEGAL_CONFIG.version}</p>
            <span className="text-[11px] text-sky-400">Effective {LEGAL_CONFIG.effectiveDateFormattedEn}</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-medium text-slate-400">Pending DPDP Requests</span>
            <p className="mt-1 text-2xl font-bold text-amber-400">
              {requests.filter(r => r.status === "pending").length}
            </p>
            <span className="text-[11px] text-slate-400">Within statutory 30-day SLA</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-medium text-slate-400">Total Audited Consents</span>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{consents.length}</p>
            <span className="text-[11px] text-slate-400">Immutable ledger records</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-medium text-slate-400">Face Vector Revocations</span>
            <p className="mt-1 text-2xl font-bold text-slate-200">
              {consents.filter(c => c.consent_type === "face_match" && c.withdrawn_at).length}
            </p>
            <span className="text-[11px] text-emerald-400">Purged per Section 6</span>
          </div>
        </div>

        {/* SECTION 1: PENDING DATA RIGHTS REQUESTS & GRIEVANCES */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Statutory Data Rights Requests & Grievances (DPDP Act 2023)
              </h2>
              <p className="text-xs text-slate-400">
                Action required within 30 days of receipt under Section 13 & 14.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Request Type</th>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3">SLA Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No statutory data rights requests pending.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold uppercase text-sky-400">
                        {req.request_type}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {req.user_id?.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {new Date(req.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-300">
                        {new Date(req.sla_due_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          req.status === "completed" 
                            ? "bg-emerald-500/20 text-emerald-300"
                            : req.status === "in_progress"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: AUDITED USER CONSENTS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Recent Consent Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Timestamped records of user acceptance and revocations.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Consent Type</th>
                  <th className="py-2.5 px-3">Doc Type</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Accepted At</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {consents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No consent records logged yet.
                    </td>
                  </tr>
                ) : (
                  consents.slice(0, 25).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white">
                        {c.consent_type}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{c.document_type}</td>
                      <td className="py-3 px-3 text-sky-400">v{c.version}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {c.user_id?.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(c.accepted_at).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3">
                        {c.withdrawn_at ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                            Withdrawn
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
