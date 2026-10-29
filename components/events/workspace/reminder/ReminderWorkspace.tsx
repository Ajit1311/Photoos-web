"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BellRing,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/events/useWorkspace";
import { useNotificationContext } from "@/context/NotificationContext";

interface ReminderWorkspaceProps {
  eventId: string;
}

interface CustomReminder {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  notes?: string;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string | null | undefined): string {
  if (!value || !value.trim()) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export default function ReminderWorkspace({ eventId }: ReminderWorkspaceProps) {
  const searchParams = useSearchParams();
  const { loading, workspace, error, refresh } = useWorkspace(eventId);
  const { reload: reloadNotifications } = useNotificationContext();

  // Custom Reminders State
  const [reminders, setReminders] = useState<CustomReminder[]>([
    {
      id: "rem-1",
      title: "शिल्लक बाकी पेमेंट फॉलोअप (Balance Settlement Follow-up)",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      priority: "high",
      completed: false,
      notes: "अल्बम डिलिव्हरी आधी पूर्ण पेमेंट जमा करून घेणे.",
    },
    {
      id: "rem-2",
      title: "क्लायंट कडून सिलेक्टेड फोटो लिस्ट घेणे (Raw Photos Selection)",
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      priority: "medium",
      completed: false,
      notes: "क्लायंटने ॲक्सेस गॅलरी मधून सिलेक्ट केलेले फोटो तपासणे.",
    },
  ]);

  // Modals & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");
  const [newNotes, setNewNotes] = useState("");

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-28 rounded-2xl bg-slate-100" />
          <div className="h-28 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-100 p-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-red-900">
              रिमाइंडर लोड करताना त्रुटी आली
            </h2>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              पुन्हा प्रयत्न करा
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <BellRing className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Reminder data unavailable
        </h2>
      </div>
    );
  }

  const client = workspace.client;
  const finance = workspace.finance;
  const event = workspace.event;

  const packageAmount = toNumber(finance?.package_amount);
  const advanceAmount = toNumber(finance?.advance_amount);
  const balanceAmount = toNumber(finance?.balance_amount);
  const paymentStatus = normalizeString(finance?.payment_status) ?? "pending";
  const paymentDueDate = normalizeString(finance?.payment_due_date);

  const clientFirstName = normalizeString(client?.["first_name"]);
  const clientLastName = normalizeString(client?.["last_name"]);
  const clientDisplayName =
    [clientFirstName, clientLastName].filter(Boolean).join(" ") ||
    normalizeString(client?.["name"]) ||
    normalizeString(client?.["display_name"]) ||
    "Client";

  const clientPhone =
    normalizeString(client?.["phone"]) ||
    normalizeString(client?.["mobile"]) ||
    normalizeString(client?.["phone_number"]);

  const clientEmail =
    normalizeString(client?.["email"]) ||
    normalizeString(client?.["contact_email"]);

  const hasDueAmount = balanceAmount > 0;
  const normalizedStatus = paymentStatus.toLowerCase().trim();
  const isOverdue =
    normalizedStatus === "overdue" ||
    (paymentDueDate &&
      new Date(paymentDueDate).getTime() < new Date().setHours(0, 0, 0, 0));

  // ---------------------------------------------------------------------------
  // Send Automated Payment Reminder (Email via Resend & WhatsApp)
  // ---------------------------------------------------------------------------
  async function handleSendPaymentReminder() {
    setSendingReminder(true);
    try {
      // 1. Send Email via Resend billing@photoos.in if email exists
      if (clientEmail) {
        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department: "billing",
            to: clientEmail,
            subject: `Payment Reminder: ₹${balanceAmount.toLocaleString("en-IN")} pending for ${event.name || "Event"}`,
            template: "payment_reminder",
            templateData: {
              clientName: clientDisplayName,
              studioName: "PhotoOS Studio",
              eventName: event.name || "Event",
              balanceAmount,
              dueDate: formatDate(paymentDueDate),
              studioPhone: clientPhone || undefined,
            },
          }),
        });
      }

      // 2. Open WhatsApp link if phone is available
      if (clientPhone) {
        const cleanPhone = clientPhone.replace(/\D/g, "");
        const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
        const message = encodeURIComponent(
          `नमस्कार ${clientDisplayName},\n\n` +
          `तुमच्या "${event.name || "Event"}" साठी शिल्लक रक्कम ₹${balanceAmount.toLocaleString("en-IN")} बाकी आहे. ` +
          `कृपया दिलेल्या मुदतीत (${formatDate(paymentDueDate)}) ही रक्कम जमा करावी.\n\n` +
          `धन्यवाद!\nPhotoOS Studio`
        );
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
      }

      toast.success("पेमेंट रिमाइंडर ईमेल आणि व्हॉट्सॲप मेसेज पाठवला गेला आहे!", {
        position: "top-center",
      });

      // Reload notifications in context
      try {
        await reloadNotifications();
      } catch {
        // continue
      }
    } catch (err: any) {
      console.error("[ReminderWorkspace] Error sending reminder:", err);
      toast.error("रिमाइंडर पाठवताना त्रुटी आली.");
    } finally {
      setSendingReminder(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Custom Reminders Management
  // ---------------------------------------------------------------------------
  function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRem: CustomReminder = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDueDate,
      priority: newPriority,
      completed: false,
      notes: newNotes.trim() || undefined,
    };

    setReminders((prev) => [newRem, ...prev]);
    toast.success("नवीन रिमाइंडर जोडला गेला आहे!");
    setIsModalOpen(false);
    setNewTitle("");
    setNewNotes("");
  }

  function handleToggleComplete(id: string) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  }

  function handleDeleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.info("रिमाइंडर काढला गेला.");
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Event Reminders & Notifications
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Active
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                पेमेंट ड्यु रिमाइंडर, टास्क नोटिफिकेशन्स आणि क्लायंट फॉलोअप मॅनेज करा.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasDueAmount && (
              <button
                type="button"
                onClick={handleSendPaymentReminder}
                disabled={sendingReminder}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
              >
                {sendingReminder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Payment Reminder (रिमाइंडर पाठवा)
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#08344f]"
            >
              <Plus className="h-4 w-4" />
              Add Reminder (नवीन रिमाइंडर)
            </button>
          </div>
        </div>
      </div>

      {/* Financial Status Summary */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Client Details</h2>
              <p className="mt-1 text-sm text-slate-500">
                या इव्हेंटशी संबंधित क्लायंट संपर्क
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Client Name
              </p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {clientDisplayName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Phone Number
                </p>
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {clientPhone ?? "Not available"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Event Name & Shoot Date
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {event.name ?? "Untitled Event"}
              </p>
            </div>
            {clientEmail && (
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-700">{clientEmail}</p>
              </div>
            )}
          </div>
        </section>

        {/* Amount Due Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Amount Due (शिल्लक बाकी)</h2>
              <p className="mt-1 text-xs text-slate-500">Outstanding balance</p>
            </div>
          </div>

          <p
            className={`mt-8 text-3xl font-extrabold ${
              hasDueAmount ? "text-amber-700" : "text-emerald-600"
            }`}
          >
            {formatCurrency(balanceAmount)}
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Payment Status</span>
              <span className="font-semibold capitalize text-slate-900">
                {paymentStatus.replaceAll("_", " ")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Advance Paid:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(advanceAmount)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Active Reminders & Follow-up List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Tasks & Reminders (सक्रिय रिमाइंडर्स)
            </h3>
            <p className="text-xs text-slate-500">
              या इव्हेंटसाठी सेट केलेले महत्त्वाचे टास्क आणि क्लायंट फॉलोअप
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {reminders.filter((r) => !r.completed).length} Pending
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`flex items-start justify-between rounded-2xl border p-4 transition ${
                rem.completed
                  ? "border-slate-100 bg-slate-50/60 opacity-60"
                  : "border-slate-200 bg-white hover:border-[#0A3F61]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(rem.id)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                    rem.completed
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 text-transparent hover:border-slate-400"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      rem.completed
                        ? "line-through text-slate-400"
                        : "text-slate-900"
                    }`}
                  >
                    {rem.title}
                  </h4>
                  {rem.notes && (
                    <p className="mt-1 text-xs text-slate-500">{rem.notes}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {formatDate(rem.dueDate)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        rem.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : rem.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {rem.priority}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteReminder(rem.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                नवीन रिमाइंडर जोडा (Add Reminder)
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  रिमाइंडर शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. फायनल पेमेंट कलेक्शन किंवा अल्बम डिलिव्हरी"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#0A3F61]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  मुदत तारीख (Due Date) *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#0A3F61]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  प्राधान्य (Priority)
                </label>
                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as "high" | "medium" | "low")
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#0A3F61]"
                >
                  <option value="high">High Priority (उच्च)</option>
                  <option value="medium">Medium Priority (मध्यम)</option>
                  <option value="low">Low Priority (कमी)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  टिप्पणी (Notes)
                </label>
                <input
                  type="text"
                  placeholder="अतिरिक्त माहिती"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 outline-none focus:border-[#0A3F61]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0A3F61] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#08344f]"
                >
                  सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
