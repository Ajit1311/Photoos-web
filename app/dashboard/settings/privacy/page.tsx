"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  ScanFace, 
  Bell, 
  Cookie, 
  Trash2, 
  Download, 
  UserCheck, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
  ExternalLink
} from "lucide-react";
import { LEGAL_CONFIG } from "@/config/legal";
import { 
  getUserConsents, 
  recordConsent, 
  withdrawConsent, 
  submitDataRightsRequest, 
  UserConsentRecord,
  DataRightsRequestType
} from "@/lib/legal/consent";
import { supabase } from "@/lib/supabase/client";
import { getSession } from "@/lib/auth/session";

export default function PrivacyAndDataRightsPage() {
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<UserConsentRecord[]>([]);
  const [faceMatchActive, setFaceMatchActive] = useState(false);
  const [marketingActive, setMarketingActive] = useState(false);
  const [cookiesActive, setCookiesActive] = useState(true);

  // Request form state
  const [requestType, setRequestType] = useState<DataRightsRequestType>("export");
  const [requestDetails, setRequestDetails] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeContact, setNomineeContact] = useState("");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Existing requests
  const [existingRequests, setExistingRequests] = useState<Array<{
    id: string;
    request_type: string;
    status: string;
    created_at: string;
    sla_due_at: string;
  }>>([]);

  async function loadData() {
    try {
      const records = await getUserConsents();
      setConsents(records);

      const face = records.find(r => r.consent_type === "face_match" && !r.withdrawn_at);
      setFaceMatchActive(Boolean(face));

      const mkt = records.find(r => r.consent_type === "marketing" && !r.withdrawn_at);
      setMarketingActive(Boolean(mkt));

      const cookieRaw = localStorage.getItem("photoos_cookie_consent");
      if (cookieRaw) {
        try {
          const parsed = JSON.parse(cookieRaw);
          setCookiesActive(parsed.analytics !== false);
        } catch {
          // ignore
        }
      }

      // Load active data rights requests
      const session = await getSession();
      if (session?.user?.id) {
        const { data: reqs } = await supabase
          .from("data_rights_requests")
          .select("id, request_type, status, created_at, sla_due_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (reqs) {
          setExistingRequests(reqs);
        }
      }
    } catch (err) {
      console.warn("[PrivacyPage] Load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleFaceMatch() {
    if (faceMatchActive) {
      await withdrawConsent("face_match");
      setFaceMatchActive(false);
    } else {
      await recordConsent({
        consentType: "face_match",
        documentType: "privacy_policy",
        metadata: { source: "settings_toggle" }
      });
      setFaceMatchActive(true);
    }
    loadData();
  }

  async function handleToggleMarketing() {
    if (marketingActive) {
      await withdrawConsent("marketing");
      setMarketingActive(false);
    } else {
      await recordConsent({
        consentType: "marketing",
        documentType: "privacy_policy",
        metadata: { source: "settings_toggle" }
      });
      setMarketingActive(true);
    }
    loadData();
  }

  async function handleToggleCookies() {
    if (cookiesActive) {
      await withdrawConsent("cookies");
      setCookiesActive(false);
      localStorage.setItem("photoos_cookie_consent", JSON.stringify({ essential: true, analytics: false }));
    } else {
      await recordConsent({
        consentType: "cookies",
        documentType: "cookie_policy",
        metadata: { essential: true, analytics: true }
      });
      setCookiesActive(true);
      localStorage.setItem("photoos_cookie_consent", JSON.stringify({ essential: true, analytics: true }));
    }
  }

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReq(true);
    setRequestSuccess(null);

    const payload: Record<string, unknown> = {
      notes: requestDetails,
      submitted_at: new Date().toISOString(),
    };

    if (requestType === "nomination") {
      payload.nominee_name = nomineeName;
      payload.nominee_contact = nomineeContact;
    }

    try {
      const id = await submitDataRightsRequest({
        requestType,
        details: payload,
      });

      setRequestSuccess(`Your statutory request has been registered (Ref: ${id?.slice(0, 8)}). Our Data Protection Officer will process it within the statutory 30-day SLA.`);
      setRequestDetails("");
      setNomineeName("");
      setNomineeContact("");
      loadData();
    } catch (err) {
      console.error("[DataRights] Submission error:", err);
    } finally {
      setSubmittingReq(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings" className="text-xs font-semibold text-[#0a3f61] hover:underline">
              Settings
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-medium text-slate-500">Privacy & Consent</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Privacy & Consent Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your legal consents, exercise your rights under India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act), and view statutory audit trails.
          </p>
        </div>

        {/* SECTION 1: ACTIVE CONSENT AUDIT LOG */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Statutory Consents & Document Versions
              </h2>
              <p className="text-xs text-slate-500">
                Current platform version: <span className="font-semibold text-slate-800">v{LEGAL_CONFIG.version}</span> (Effective {LEGAL_CONFIG.effectiveDateFormattedEn})
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              DPDP Act Compliant
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {/* Mandatory Consents */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Terms of Service</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">v{LEGAL_CONFIG.version}</p>
                <Link href="/terms" target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-[#0a3f61] hover:underline">
                  <span>View Terms</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Privacy Policy</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">v{LEGAL_CONFIG.version}</p>
                <Link href="/privacy" target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-[#0a3f61] hover:underline">
                  <span>View Policy</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Agreement</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">v{LEGAL_CONFIG.version}</p>
                <Link href="/platform-agreement" target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-[#0a3f61] hover:underline">
                  <span>View Agreement</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Optional Consents with Instant 1-Click Withdrawal */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-800">
                Optional Consents (Withdraw At Any Time)
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Under Section 6 of the DPDP Act, you can withdraw optional consents at any time. Withdrawal immediately stops further processing.
              </p>

              <div className="mt-4 space-y-3">
                {/* Face-Match Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <ScanFace className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">Facial Search Vector Processing</span>
                      <p className="text-xs text-slate-500">Permits AI to index photos to find matching faces in event galleries.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleFaceMatch}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      faceMatchActive 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {faceMatchActive ? "Active (Click to Withdraw)" : "Withdrawn (Click to Enable)"}
                  </button>
                </div>

                {/* Marketing Updates Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">WhatsApp & Marketing Communications</span>
                      <p className="text-xs text-slate-500">Product release updates and platform tips.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMarketing}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      marketingActive 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {marketingActive ? "Active (Click to Withdraw)" : "Withdrawn (Click to Enable)"}
                  </button>
                </div>

                {/* Analytics Cookies Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <Cookie className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">Performance & Analytics Telemetry</span>
                      <p className="text-xs text-slate-500">Helps us monitor Cloudflare gallery speed and platform uptime.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleCookies}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      cookiesActive 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cookiesActive ? "Active (Click to Withdraw)" : "Withdrawn (Click to Enable)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXERCISE DPDP STATUTORY RIGHTS */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Exercise Your Statutory Data Rights (DPDP Act 2023)
            </h2>
            <p className="text-xs text-slate-500">
              Submit formal requests under Sections 11, 12, 13, and 14 of the Digital Personal Data Protection Act.
            </p>
          </div>

          {requestSuccess && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
              {requestSuccess}
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Select Request Type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { id: "export", label: "Export Data", icon: Download },
                  { id: "correction", label: "Correct Data", icon: RefreshCw },
                  { id: "erasure", label: "Erase & Delete", icon: Trash2 },
                  { id: "nomination", label: "Nominate", icon: UserCheck },
                  { id: "grievance", label: "Grievance", icon: AlertTriangle },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = requestType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRequestType(item.id as DataRightsRequestType)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                        active
                          ? "border-[#0a3f61] bg-[#0a3f61]/5 text-[#0a3f61]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional fields for Nomination */}
            {requestType === "nomination" && (
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nominee Full Name</label>
                  <input
                    type="text"
                    required
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="Full legal name of nominee"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nominee Phone / Email</label>
                  <input
                    type="text"
                    required
                    value={nomineeContact}
                    onChange={(e) => setNomineeContact(e.target.value)}
                    placeholder="+91 or email"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Additional Details / Description
              </label>
              <textarea
                rows={3}
                required
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                placeholder="Specify details of your request (e.g. data categories to export, correction required, or specific grievance)..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-[#3495a1]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Statutory SLA: Resolved within 30 days under DPDP Act Section 13.
              </span>
              <button
                type="submit"
                disabled={submittingReq}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a3f61] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#083650] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submittingReq ? "Submitting..." : "Submit Statutory Request"}</span>
              </button>
            </div>
          </form>

          {/* Existing Tracked Requests */}
          {existingRequests.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Your Active Data Requests & Grievances
              </h3>
              <div className="mt-3 space-y-2">
                {existingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
                    <div>
                      <span className="font-bold uppercase text-slate-800">{req.request_type} Request</span>
                      <p className="text-[11px] text-slate-400">
                        Submitted: {new Date(req.created_at).toLocaleDateString("en-IN")} · SLA Due: {new Date(req.sla_due_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
