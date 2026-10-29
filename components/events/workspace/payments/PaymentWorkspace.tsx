"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  IndianRupee,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";

import {
  getSupabaseClient,
} from "@/lib/supabase/client";

import { toast } from "sonner";

type PaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "cheque"
  | "wallet"
  | "online_gateway"
  | "other";

type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partial"
  | "paid";

type PaymentType =
  | "advance"
  | "installment"
  | "full_payment"
  | "final_settlement";

interface EventPayment {
  id: string;
  event_id?: string | null;
  payment_id?: string | null;
  payment_number?: number | string | null;
  payment_type?: string | null;
  amount: number | string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  status: string | null;
  method: string | null;
  transaction_id?: string | null;
  gateway_name?: string | null;
  payment_date?: string | null;
  transaction_date?: string | null;
  notes?: string | null;
  remarks?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
  transaction?: {
    id: string;
    transaction_id: string | null;
    gateway_name: string | null;
    status: string;
    amount: number;
    transaction_date: string | null;
  } | null;
}

interface CreatePaymentForm {
  amount: string;
  paymentType: PaymentType;
  method: PaymentMethod;
  transactionId: string;
  gatewayName: string;
  paymentDate: string;
  notes: string;
  status: PaymentStatus;
}

interface StudioInvoiceData {
  id: string;
  name?: string | null;
  legal_name?: string | null;
  brand_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  logo_url?: string | null;
  tax_id?: string | null;
  currency?: string | null;
  upi_id?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
}

interface EventInvoiceData {
  id: string;
  code?: string | null;
  name?: string | null;
  title?: string | null;
  event_name?: string | null;
  event_date?: string | null;
  shoot_date?: string | null;
  start_date?: string | null;
  date?: string | null;
  venue?: string | null;
  studio_id?: string | null;
  project_id?: string | null;
}

interface ProjectInvoiceData {
  id: string;
  title?: string | null;
  budget: number;
  advance_amount: number;
  balance_amount: number;
  currency?: string | null;
  client_id?: string | null;
}

interface ClientInvoiceData {
  id?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface PaymentWorkspaceProps {
  eventId: string;
}

const initialForm: CreatePaymentForm = {
  amount: "",
  paymentType: "advance",
  method: "upi",
  transactionId: "",
  gatewayName: "",
  paymentDate: new Date().toISOString().slice(0, 16),
  notes: "",
  status: "completed",
};

function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatInvoiceDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getAmount(payment: EventPayment) {
  const value = payment.total_amount ?? payment.amount ?? 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getPaymentDate(payment: EventPayment) {
  return (
    payment.transaction_date ??
    payment.payment_date ??
    payment.created_at ??
    null
  );
}

function isAdvancePayment(payment: EventPayment) {
  const type = (
    payment.payment_type ??
    (payment.metadata?.payment_type as string) ??
    (payment.metadata?.type as string) ??
    ""
  ).toLowerCase();

  const notes = (payment.notes ?? payment.remarks ?? "").toLowerCase();

  return (
    type === "advance" ||
    notes.includes("advance") ||
    notes.includes("ॲडव्हान्स") ||
    notes.includes("adv")
  );
}

function getStatusClass(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "completed":
    case "paid":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
    case "pending":
    case "processing":
    case "partial":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
    case "failed":
    case "cancelled":
      return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
    case "refunded":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-600/10";
  }
}

function getMethodLabel(method?: string | null) {
  if (!method) return "Cash";
  switch (method.toLowerCase()) {
    case "upi":
      return "UPI / QR";
    case "bank_transfer":
      return "Bank Transfer / NEFT";
    case "credit_card":
      return "Credit Card";
    case "debit_card":
      return "Debit Card";
    case "net_banking":
      return "Net Banking";
    case "cash":
      return "Cash (रोख)";
    default:
      return method.charAt(0).toUpperCase() + method.slice(1);
  }
}

function getMethodIcon(method?: string | null) {
  switch (method?.toLowerCase()) {
    case "cash":
      return <Banknote className="h-4 w-4" />;
    case "upi":
    case "wallet":
    case "online_gateway":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

export default function PaymentWorkspace({ eventId }: PaymentWorkspaceProps) {
  const [supabase] = useState(() => getSupabaseClient());

  const [payments, setPayments] = useState<EventPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreatePaymentForm>(initialForm);

  // Entities
  const [eventData, setEventData] = useState<EventInvoiceData | null>(null);
  const [projectData, setProjectData] = useState<ProjectInvoiceData | null>(null);
  const [studio, setStudio] = useState<StudioInvoiceData | null>(null);
  const [clientData, setClientData] = useState<ClientInvoiceData | null>(null);

  // Invoice Filter & Preview Modal
  const [previewInvoiceOpen, setPreviewInvoiceOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Load Live Payments and Related Entities
  // ---------------------------------------------------------------------------
  const loadPayments = useCallback(
    async (isRefresh = false) => {
      if (!eventId) {
        setPayments([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        // 1. Fetch Event Info
        const { data: ev } = await supabase
          .from("events")
          .select("id, code, name, shoot_date, start_time, venue, project_id, studio_id, metadata")
          .eq("id", eventId)
          .maybeSingle();

        if (ev) {
          setEventData({
            id: ev.id,
            code: ev.code || ev.id.slice(0, 8).toUpperCase(),
            name: ev.name || "Event",
            shoot_date: ev.shoot_date,
            event_date: ev.shoot_date,
            venue: ev.venue,
            studio_id: ev.studio_id,
            project_id: ev.project_id,
          });

          // 2. Fetch Studio Info
          if (ev.studio_id) {
            const { data: st } = await supabase
              .from("studios")
              .select("id, name, brand_name, legal_name, contact_phone, contact_email, address, city, state, country, postal_code, logo_url, tax_id, currency, metadata")
              .eq("id", ev.studio_id)
              .maybeSingle();

            if (st) {
              setStudio({
                id: st.id,
                name: st.brand_name || st.name || "Photography Studio",
                brand_name: st.brand_name,
                legal_name: st.legal_name,
                contact_phone: st.contact_phone,
                contact_email: st.contact_email,
                address: st.address,
                city: st.city,
                state: st.state,
                country: st.country,
                postal_code: st.postal_code,
                logo_url: st.logo_url,
                tax_id: st.tax_id,
                currency: st.currency || "INR",
                upi_id: (st.metadata as any)?.upi_id || "photoos@upi",
                bank_name: (st.metadata as any)?.bank_name || null,
                account_number: (st.metadata as any)?.account_number || null,
                ifsc_code: (st.metadata as any)?.ifsc_code || null,
              });
            }
          }

          // 3. Fetch Project Info
          if (ev.project_id) {
            const { data: prj } = await supabase
              .from("projects")
              .select("id, title, budget, advance_amount, balance_amount, currency, client_id")
              .eq("id", ev.project_id)
              .maybeSingle();

            if (prj) {
              setProjectData({
                id: prj.id,
                title: prj.title,
                budget: Number(prj.budget || 0),
                advance_amount: Number(prj.advance_amount || 0),
                balance_amount: Number(prj.balance_amount || 0),
                currency: prj.currency || "INR",
                client_id: prj.client_id,
              });

              // 4. Fetch Client Info
              if (prj.client_id) {
                const { data: cl } = await supabase
                  .from("clients")
                  .select("id, name, display_name, phone, email")
                  .eq("id", prj.client_id)
                  .maybeSingle();

                if (cl) {
                  setClientData({
                    id: cl.id,
                    name: cl.display_name || cl.name || "Client",
                    phone: cl.phone,
                    email: cl.email,
                  });
                }
              }
            }
          }
        }

        // 5. Query Payments Table
        let directPayments: EventPayment[] = [];
        try {
          const filterQueries = [`metadata->>event_id.eq.${eventId}`];
          if (ev?.project_id) {
            filterQueries.push(`project_id.eq.${ev.project_id}`);
          }
          filterQueries.push(`reference_id.eq.${eventId}`);

          const { data: paymentRows, error: pErr } = await supabase
            .from("payments")
            .select("*, payment_transactions(*)")
            .or(filterQueries.join(","))
            .order("created_at", { ascending: false });

          if (!pErr && paymentRows && paymentRows.length > 0) {
            directPayments = paymentRows.map((r: any) => ({
              id: r.id,
              event_id: eventId,
              payment_number: r.payment_number,
              payment_type: r.payment_type || r.metadata?.payment_type || "advance",
              amount: r.amount,
              total_amount: r.total_amount || r.amount,
              currency: r.currency || "INR",
              status: r.status,
              method: r.method,
              transaction_id: r.transaction_id,
              payment_date: r.payment_date || r.created_at,
              notes: r.notes,
              metadata: r.metadata,
              created_at: r.created_at,
              transaction: Array.isArray(r.payment_transactions) && r.payment_transactions.length > 0
                ? r.payment_transactions[0]
                : null,
            }));
          }
        } catch (dbErr) {
          console.warn("[PaymentWorkspace] Direct table query notice:", dbErr);
        }

        // 6. Edge function fallback if direct query returned empty
        if (directPayments.length === 0) {
          try {
            const { listEventPayments } = await import("@/lib/api/event-payments");
            const rpcRes = await listEventPayments(eventId);
            if (rpcRes.payments && rpcRes.payments.length > 0) {
              directPayments = rpcRes.payments.map((p: any) => ({
                id: p.id,
                event_id: eventId,
                payment_type: p.metadata?.payment_type || "advance",
                amount: p.amount,
                total_amount: p.amount,
                currency: p.currency || "INR",
                status: p.status,
                method: p.method,
                transaction_id: p.transaction_id,
                payment_date: p.payment_date,
                notes: p.notes,
                created_at: p.created_at,
              }));
            }
          } catch {
            // Ignore RPC fallback
          }
        }

        setPayments(directPayments);
      } catch (loadErr) {
        console.error("[PaymentWorkspace] Load error:", loadErr);
        setPayments([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, supabase]
  );

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  // ---------------------------------------------------------------------------
  // Calculations: Real Data Matching (Advance, Pending, Total Budget)
  // ---------------------------------------------------------------------------
  const summary = useMemo(() => {
    let completedSum = 0;
    let advanceSum = 0;
    let pendingSum = 0;
    let failedSum = 0;

    payments.forEach((payment) => {
      const amount = getAmount(payment);
      const status = payment.status?.toLowerCase();

      if (status === "completed" || status === "paid") {
        completedSum += amount;
        if (isAdvancePayment(payment)) {
          advanceSum += amount;
        }
      } else if (status === "failed" || status === "cancelled") {
        failedSum += amount;
      } else {
        pendingSum += amount;
      }
    });

    // Match with project budget if available
    const projectBudget = projectData?.budget || 0;
    const projectAdvance = projectData?.advance_amount || 0;

    // The real total quotation
    const totalQuote = projectBudget > 0 ? projectBudget : (completedSum + pendingSum || advanceSum || 0);

    // The real advance paid
    const finalAdvancePaid = advanceSum > 0 ? advanceSum : (projectAdvance > 0 ? projectAdvance : completedSum);

    // The real pending balance
    let finalPendingBalance = totalQuote > completedSum ? (totalQuote - completedSum) : 0;
    if (finalPendingBalance === 0 && projectData?.balance_amount && projectData.balance_amount > 0) {
      finalPendingBalance = projectData.balance_amount;
    }

    return {
      totalQuote,
      advancePaid: finalAdvancePaid,
      pendingBalance: finalPendingBalance,
      totalReceived: completedSum,
      failed: failedSum,
      transactionCount: payments.length,
    };
  }, [payments, projectData]);

  // Invoice Number
  const invoiceNumber = useMemo(() => {
    const code = eventData?.code || eventId.slice(0, 8).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `INV-${code}-${dateStr}`;
  }, [eventData?.code, eventId]);

  // ---------------------------------------------------------------------------
  // Create Payment Handler
  // ---------------------------------------------------------------------------
  function openPaymentModal() {
    setForm({
      ...initialForm,
      paymentDate: new Date().toISOString().slice(0, 16),
    });
    setError(null);
    setIsModalOpen(true);
  }

  function closePaymentModal() {
    if (saving) return;
    setIsModalOpen(false);
  }

  function updateForm<K extends keyof CreatePaymentForm>(
    key: K,
    value: CreatePaymentForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreatePayment(event: React.FormEvent) {
    event.preventDefault();
    if (!eventId) return;

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("कृपया वैध रक्कम टाका.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const paymentDate = form.paymentDate
        ? new Date(form.paymentDate).toISOString()
        : new Date().toISOString();

      const studioId = studio?.id || eventData?.studio_id;
      const projectId = projectData?.id || eventData?.project_id;

      // 1. Insert into public.payments
      const { data: newPayment, error: insertErr } = await supabase
        .from("payments")
        .insert({
          studio_id: studioId,
          project_id: projectId || null,
          client_id: clientData?.id || projectData?.client_id || null,
          payment_type: form.paymentType,
          payment_mode: "incoming",
          status: form.status,
          method: form.method,
          amount,
          total_amount: amount,
          currency: studio?.currency || "INR",
          transaction_id: form.transactionId.trim() || null,
          payment_date: paymentDate,
          notes: form.notes.trim() || null,
          metadata: {
            event_id: eventId,
            payment_type: form.paymentType,
            gateway_name: form.gatewayName.trim() || null,
          },
        })
        .select("id")
        .single();

      if (insertErr) {
        console.warn("[CreatePayment] DB insert notice, trying RPC:", insertErr);
        // Fallback to RPC
        const { createEventPayment } = await import("@/lib/api/event-payments");
        await createEventPayment({
          eventId,
          amount,
          method: form.method as any,
          transactionId: form.transactionId.trim() || null,
          gatewayName: form.gatewayName.trim() || null,
          paymentDate,
          notes: form.notes.trim() || null,
          status: form.status as any,
          metadata: { payment_type: form.paymentType },
        });
      } else if (newPayment?.id && form.transactionId) {
        // Also insert transaction record
        await supabase.from("payment_transactions").insert({
          payment_id: newPayment.id,
          transaction_id: form.transactionId.trim(),
          gateway_name: form.gatewayName.trim() || form.method,
          status: form.status,
          amount,
          transaction_date: paymentDate,
        });
      }

      // 2. If Project exists, update advance_amount & balance_amount
      if (projectId && projectData) {
        const isAdv = form.paymentType === "advance";
        const newAdvance = isAdv ? (projectData.advance_amount + amount) : projectData.advance_amount;
        const newBalance = Math.max(0, projectData.budget - (newAdvance + (isAdv ? 0 : amount)));

        await supabase
          .from("projects")
          .update({
            advance_amount: newAdvance,
            balance_amount: newBalance,
          })
          .eq("id", projectId);
      }

      // 3. Dispatch automated receipt email via Resend if client email is available
      if (clientData?.email) {
        try {
          await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              department: "billing",
              to: clientData.email,
              subject: `Payment Receipt: ${formatCurrency(amount)} received for ${eventData?.name || "Event"}`,
              template: "payment_receipt",
              templateData: {
                clientName: clientData.name || "Valued Client",
                studioName: studio?.name || "PhotoOS Studio",
                eventName: eventData?.name || "Event",
                invoiceNumber,
                amountPaid: amount,
                advancePaid: form.paymentType === "advance" ? (summary.advancePaid + amount) : summary.advancePaid,
                pendingBalance: Math.max(0, summary.pendingBalance - amount),
                paymentMethod: form.method,
                transactionId: form.transactionId || undefined,
                date: formatInvoiceDate(paymentDate),
              },
            }),
          });
        } catch (emailErr) {
          console.warn("[CreatePayment] Auto-email notice:", emailErr);
        }
      }

      toast.success("पेमेंट यशस्वीरीत्या नोंदवले गेले आहे!", { position: "top-center" });
      setIsModalOpen(false);
      setForm(initialForm);
      await loadPayments(true);
    } catch (createErr: any) {
      console.error("[CreatePayment] Error:", createErr);
      setError(createErr.message || "पेमेंट जोडताना त्रुटी आली.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Premium Invoice Generation (Popup & Print)
  // ---------------------------------------------------------------------------
  function handleOpenInvoice() {
    setPreviewInvoiceOpen(true);
  }

  function handlePrintInvoice() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Payment & Finance Workspace
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              Live Real-Time Sync
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            ॲडव्हान्स, शिल्लक बाकी आणि ट्रॅन्झॅक्शन ट्रॅक करा &bull; Official Dual-Branded Invoice जनरेट करा.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadPayments(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#0A3F61]" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenInvoice}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[#0A3F61] hover:text-[#0A3F61]"
          >
            <FileText className="h-4 w-4 text-[#0A3F61]" />
            View & Print Invoice
          </button>

          <button
            type="button"
            onClick={openPaymentModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08344f]"
          >
            <Plus className="h-4 w-4" />
            Add Payment (पेमेंट नोंदवा)
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* 4 Premium Live Financial Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Quotation / Budget */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Event Budget (एकूण बजेट)
            </span>
            <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900">
            {formatCurrency(summary.totalQuote, studio?.currency || "INR")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Event Package Quotation</span>
          </div>
        </div>

        {/* Card 2: Advance Paid (ॲडव्हान्स जमा) */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Advance Paid (ॲडव्हान्स जमा)
            </span>
            <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-emerald-700">
            {formatCurrency(summary.advancePaid, studio?.currency || "INR")}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              {summary.totalQuote > 0
                ? `${Math.round((summary.advancePaid / summary.totalQuote) * 100)}% जमा`
                : "Advance Settled"}
            </span>
            <span className="text-xs text-slate-500">Received advance</span>
          </div>
        </div>

        {/* Card 3: Pending Balance (शिल्लक बाकी) */}
        <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${
          summary.pendingBalance > 0
            ? "border-amber-200 bg-gradient-to-br from-amber-50/70 to-white"
            : "border-slate-200 bg-white"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Balance (शिल्लक बाकी)
            </span>
            <div className={`rounded-2xl p-2.5 ${summary.pendingBalance > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className={`mt-4 text-3xl font-extrabold ${summary.pendingBalance > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {formatCurrency(summary.pendingBalance, studio?.currency || "INR")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            {summary.pendingBalance > 0 ? (
              <span className="font-semibold text-amber-700">&bull; Settlement due before album delivery</span>
            ) : (
              <span className="font-semibold text-emerald-600">&bull; No balance due (पूर्ण जमा)</span>
            )}
          </div>
        </div>

        {/* Card 4: Total Received & Transactions */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Received (एकूण जमा)
            </span>
            <div className="rounded-2xl bg-[#0A3F61]/10 p-2.5 text-[#0A3F61]">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[#0A3F61]">
            {formatCurrency(summary.totalReceived, studio?.currency || "INR")}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Across <strong>{summary.transactionCount}</strong> verified transactions
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transaction History (व्यवहार तपशील)
            </h3>
            <p className="text-xs text-slate-500">
              सर्व रेकॉर्ड केलेले ॲडव्हान्स आणि पूर्ण पेमेंट व्यवहार
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {payments.length} Transactions
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CreditCard className="h-7 w-7" />
            </div>
            <h4 className="mt-4 text-base font-bold text-slate-800">
              कोणताही पेमेंट व्यवहार नोंदवलेला नाही
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              या इव्हेंटसाठी पहिला ॲडव्हान्स किंवा पेमेंट व्यवहार नोंदवण्यासाठी &apos;Add Payment&apos; बटनावर क्लिक करा.
            </p>
            <button
              type="button"
              onClick={openPaymentModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#08344f]"
            >
              <Plus className="h-4 w-4" />
              Add Advance Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Type & Method</th>
                  <th className="px-6 py-3.5">Transaction ID / Ref</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const isAdv = isAdvancePayment(p);
                  return (
                    <tr key={p.id} className="transition hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isAdv ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {getMethodIcon(p.method)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">
                                {getMethodLabel(p.method)}
                              </span>
                              {isAdv && (
                                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                  ADVANCE
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 capitalize">
                              {p.payment_type ? p.payment_type.replace(/_/g, " ") : "Payment"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {p.transaction_id || p.transaction?.transaction_id || (
                          <span className="text-slate-400">Cash / Manual</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDate(getPaymentDate(p))}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || p.remarks || "—"}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatCurrency(getAmount(p), p.currency || studio?.currency || "INR")}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getStatusClass(p.status)}`}>
                          {p.status || "completed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* ADD PAYMENT MODAL */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  नवीन पेमेंट नोंदवा (Add Payment)
                </h3>
                <p className="text-xs text-slate-500">
                  {eventData?.name || "Event"} साठी ॲडव्हान्स किंवा पेमेंट नोंदवा
                </p>
              </div>
              <button
                type="button"
                onClick={closePaymentModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="mt-5 space-y-4">
              {/* Payment Type Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  पेमेंट प्रकार (Payment Type) *
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateForm("paymentType", "advance")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      form.paymentType === "advance"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    ॲडव्हान्स (Advance)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm("paymentType", "installment")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      form.paymentType === "installment"
                        ? "border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    हप्ता (Part Pay)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm("paymentType", "final_settlement")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      form.paymentType === "final_settlement"
                        ? "border-[#0A3F61] bg-[#0A3F61]/10 text-[#0A3F61] ring-2 ring-[#0A3F61]/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    पूर्ण (Full Pay)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  रक्कम (Amount in ₹) *
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="उदा. 25000"
                    value={form.amount}
                    onChange={(e) => updateForm("amount", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-9 pr-4 text-lg font-bold text-slate-900 outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  पेमेंट पद्धत (Payment Method) *
                </label>
                <select
                  value={form.method}
                  onChange={(e) => updateForm("method", e.target.value as PaymentMethod)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0A3F61]"
                >
                  <option value="upi">UPI / PhonePe / GPay / Paytm</option>
                  <option value="cash">Cash (रोख रक्कम)</option>
                  <option value="bank_transfer">Bank Transfer / NEFT / IMPS</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="cheque">Cheque (धनादेश)</option>
                </select>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transaction ID / UTR No. (पर्यायी)
                </label>
                <input
                  type="text"
                  placeholder="उदा. UPI1234567890"
                  value={form.transactionId}
                  onChange={(e) => updateForm("transactionId", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#0A3F61]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  टिप्पणी (Notes / Remarks)
                </label>
                <input
                  type="text"
                  placeholder="उदा. स्टेज डेकोरेशन ॲडव्हान्स किंवा बुकिंग टोकन"
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#0A3F61]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#08344f] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  पेमेंट सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PREMIUM DUAL-BRANDED INVOICE PREVIEW MODAL */}
      {/* ===================================================================== */}
      {previewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm print:p-0">
          <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl print:max-h-none print:w-full print:rounded-none print:shadow-none">
            {/* Modal Top Bar (hidden in print) */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#0A3F61]" />
                <span className="font-bold text-slate-900">
                  PhotoOS Official Dual-Branded Invoice
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#08344f]"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoiceOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-12 print:overflow-visible print:p-6" id="invoice-printable-area">
              {/* 1. PhotoOS Official Software Header Bar */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#0A3F61] px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">
                      PhotoOS™ Certified
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Doc ID: {invoiceNumber}
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    TAX INVOICE
                  </h1>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-[#0A3F61] tracking-tight">
                    PhotoOS<span className="text-amber-500">.</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    Enterprise Studio Operating System
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    www.photoos.in &bull; billing@photoos.in
                  </p>
                </div>
              </div>

              {/* 2. Studio Branding & Event Meta */}
              <div className="mt-6 grid grid-cols-2 gap-8 border-b border-slate-200 pb-6">
                {/* Studio Information */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ISSUED BY (STUDIO)
                  </span>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                    {studio?.brand_name || studio?.name || "Professional Studio"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {studio?.address || "Studio Address"}
                    {studio?.city ? `, ${studio.city}` : ""}
                    {studio?.state ? `, ${studio.state}` : ""}
                    {studio?.postal_code ? ` - ${studio.postal_code}` : ""}
                  </p>
                  {studio?.contact_phone && (
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Phone:</strong> {studio.contact_phone}
                    </p>
                  )}
                  {studio?.contact_email && (
                    <p className="text-xs text-slate-600">
                      <strong>Email:</strong> {studio.contact_email}
                    </p>
                  )}
                  {studio?.tax_id && (
                    <p className="text-xs font-mono font-semibold text-slate-700">
                      <strong>GSTIN / Tax ID:</strong> {studio.tax_id}
                    </p>
                  )}
                </div>

                {/* Client & Event Meta */}
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    BILLED TO (CLIENT)
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    {clientData?.name || "Event Client"}
                  </h3>
                  {clientData?.phone && (
                    <p className="text-xs text-slate-600">
                      <strong>Contact:</strong> {clientData.phone}
                    </p>
                  )}
                  {clientData?.email && (
                    <p className="text-xs text-slate-600">
                      <strong>Email:</strong> {clientData.email}
                    </p>
                  )}
                  <div className="mt-3 inline-block rounded-xl bg-slate-50 p-2.5 text-left border border-slate-100">
                    <p className="text-xs text-slate-700">
                      <strong>Event:</strong> {eventData?.name || "Wedding Shoot"}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Date:</strong> {formatInvoiceDate(eventData?.shoot_date || eventData?.event_date)}
                    </p>
                    {eventData?.venue && (
                      <p className="text-xs text-slate-500">
                        <strong>Venue:</strong> {eventData.venue}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Itemized Services Table */}
              <div className="mt-6">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-3">Sr.</th>
                      <th className="py-3 px-3">Service Description</th>
                      <th className="py-3 px-3 text-center">Coverage</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 px-3 font-semibold text-slate-400">01</td>
                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-900">
                          Complete Photography & Cinematography Services
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Professional shoot, high-resolution color graded album photos & cinematic highlight reels.
                        </p>
                      </td>
                      <td className="py-4 px-3 text-center font-medium text-slate-700">
                        {eventData?.name || "Full Event"}
                      </td>
                      <td className="py-4 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(summary.totalQuote, studio?.currency || "INR")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Settlement Breakdown Box */}
              <div className="mt-8 flex justify-end">
                <div className="w-80 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex justify-between py-1.5 text-xs text-slate-600">
                    <span>Package Total:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(summary.totalQuote, studio?.currency || "INR")}
                    </span>
                  </div>

                  {/* Advance Paid Line */}
                  <div className="flex justify-between border-t border-slate-200 py-2 text-xs font-semibold text-emerald-700">
                    <span>Less: Advance Paid (ॲडव्हान्स):</span>
                    <span>
                      - {formatCurrency(summary.advancePaid, studio?.currency || "INR")}
                    </span>
                  </div>

                  {/* Remaining Balance Line */}
                  <div className="flex justify-between border-t-2 border-slate-900 pt-2.5 text-sm font-extrabold text-slate-900">
                    <span>Balance Due (शिल्लक बाकी):</span>
                    <span className={summary.pendingBalance > 0 ? "text-red-600" : "text-emerald-700"}>
                      {formatCurrency(summary.pendingBalance, studio?.currency || "INR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Studio Bank & UPI Details */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-[#0A3F61]" />
                  <span>Payment Settlement Instructions:</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-slate-600">
                  <div>
                    <p><strong>Studio UPI ID:</strong> {studio?.upi_id || "photoos@upi"}</p>
                    <p><strong>Payment Mode:</strong> UPI, Bank Transfer (NEFT/IMPS), Cash</p>
                  </div>
                  <div>
                    <p><strong>Support Email:</strong> {studio?.contact_email || "billing@photoos.in"}</p>
                    <p><strong>Studio Contact:</strong> {studio?.contact_phone || "Support Available"}</p>
                  </div>
                </div>
              </div>

              {/* 6. Dual Authenticity Signatures */}
              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-slate-200 pt-8 text-center text-xs">
                <div>
                  <div className="mx-auto h-12 w-40 border-b border-dashed border-slate-400" />
                  <p className="mt-2 font-bold text-slate-900">
                    {studio?.brand_name || studio?.name || "Studio Representative"}
                  </p>
                  <p className="text-slate-400 text-[11px]">Authorized Signatory</p>
                </div>

                <div>
                  <div className="mx-auto flex h-12 w-40 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold">
                    ✓ PhotoOS™ Verified
                  </div>
                  <p className="mt-2 font-bold text-slate-900">PhotoOS Digital Certification</p>
                  <p className="text-slate-400 text-[11px]">System Authenticated Document</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
