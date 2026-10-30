"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import PlatformAdminGuard from "@/components/platform-admin/PlatformAdminGuard";
import {
  createPlatformAnnouncement,
  deletePlatformAnnouncement,
  listPlatformAnnouncements,
  publishPlatformAnnouncement,
  updatePlatformAnnouncement,
  type AnnouncementAudience,
  type AnnouncementChannel,
  type AnnouncementPriority,
  type AnnouncementStatus,
  type PlatformAnnouncement,
} from "@/lib/api/platform-admin-announcements";

const statusOptions: Array<{
  value: AnnouncementStatus | "";
  label: string;
}> = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
];

const audienceOptions: Array<{
  value: AnnouncementAudience;
  label: string;
}> = [
  { value: "all_users", label: "All Users" },
  { value: "all_studios", label: "All Studios" },
  { value: "studio_owners", label: "Studio Owners" },
  { value: "studio_admins", label: "Studio Admins" },
  {
    value: "platform_admin_employees",
    label: "Platform Admin Employees",
  },
];

const channelOptions: Array<{
  value: AnnouncementChannel;
  label: string;
}> = [
  { value: "in_app", label: "In-App" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "push", label: "Push" },
  { value: "webhook", label: "Webhook" },
];

const priorityOptions: Array<{
  value: AnnouncementPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

type FormState = {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience_type: AnnouncementAudience;
  channel: AnnouncementChannel;
  status: AnnouncementStatus;
  scheduled_at: string;
};

const emptyForm: FormState = {
  title: "",
  body: "",
  priority: "normal",
  audience_type: "all_users",
  channel: "in_app",
  status: "draft",
  scheduled_at: "",
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClasses(status: AnnouncementStatus) {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "scheduled":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

function priorityClasses(priority: AnnouncementPriority) {
  switch (priority) {
    case "urgent":
      return "bg-red-50 text-red-700";
    case "high":
      return "bg-orange-50 text-orange-700";
    case "low":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<
    PlatformAnnouncement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<AnnouncementStatus | "">("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<PlatformAnnouncement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await listPlatformAnnouncements({
        status,
        keyword: keyword.trim(),
        limit: 100,
      });

      setAnnouncements(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load announcements.",
      );
    } finally {
      setLoading(false);
    }
  }, [keyword, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnnouncements();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadAnnouncements]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: PlatformAnnouncement) {
    setEditing(item);

    setForm({
      title: item.title,
      body: item.body,
      priority: item.priority,
      audience_type: item.audience_type,
      channel: item.channel,
      status: item.status,
      scheduled_at: item.scheduled_at
        ? item.scheduled_at.slice(0, 16)
        : "",
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.body.trim()) {
      setError("Message is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editing) {
        await updatePlatformAnnouncement({
          id: editing.id,
          title: form.title.trim(),
          body: form.body.trim(),
          priority: form.priority,
          audience_type: form.audience_type,
          channel: form.channel,
          status: form.status,
          scheduled_at: form.scheduled_at
            ? new Date(form.scheduled_at).toISOString()
            : null,
        });
      } else {
        await createPlatformAnnouncement({
          title: form.title.trim(),
          body: form.body.trim(),
          priority: form.priority,
          audience_type: form.audience_type,
          channel: form.channel,
          status: form.status,
          scheduled_at: form.scheduled_at
            ? new Date(form.scheduled_at).toISOString()
            : null,
        });
      }

      closeModal();
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save announcement.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(item: PlatformAnnouncement) {
    if (!window.confirm(`Publish "${item.title}"?`)) return;

    try {
      setError("");
      await publishPlatformAnnouncement(item.id);
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish announcement.",
      );
    }
  }

  async function handleDelete(item: PlatformAnnouncement) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    try {
      setError("");
      await deletePlatformAnnouncement(item.id);
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete announcement.",
      );
    }
  }

  const stats = {
    total: announcements.length,
    draft: announcements.filter((x) => x.status === "draft").length,
    scheduled: announcements.filter(
      (x) => x.status === "scheduled",
    ).length,
    published: announcements.filter(
      (x) => x.status === "published",
    ).length,
  };

  return (
    <PlatformAdminGuard>
      <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <Megaphone className="h-4 w-4" />
                  Communication
                  <span>/</span>
                  Announcements
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Announcements
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create, schedule and publish platform announcements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadAnnouncements()}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </button>
              </div>
            </div>

            {error && !modalOpen && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <Bell className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Total"
                value={stats.total}
                icon={<Megaphone className="h-5 w-5" />}
              />
              <StatCard
                label="Draft"
                value={stats.draft}
                icon={<Edit3 className="h-5 w-5" />}
              />
              <StatCard
                label="Scheduled"
                value={stats.scheduled}
                icon={<CalendarClock className="h-5 w-5" />}
              />
              <StatCard
                label="Published"
                value={stats.published}
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search announcements..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="relative w-full md:w-48">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as AnnouncementStatus | "",
                      )
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">Announcement</th>
                      <th className="px-5 py-3">Audience</th>
                      <th className="px-5 py-3">Channel</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Updated</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center text-sm text-slate-500"
                        >
                          Loading announcements...
                        </td>
                      </tr>
                    ) : announcements.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <Megaphone className="h-5 w-5 text-slate-500" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-slate-800">
                            No announcements found
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Create your first platform announcement.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      announcements.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70"
                        >
                          <td className="max-w-[350px] px-5 py-4">
                            <div className="font-medium text-slate-900">
                              {item.title}
                            </div>
                            <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {item.body}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {audienceOptions.find(
                              (x) =>
                                x.value === item.audience_type,
                            )?.label ?? item.audience_type}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {channelOptions.find(
                              (x) => x.value === item.channel,
                            )?.label ?? item.channel}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClasses(
                                item.priority,
                              )}`}
                            >
                              {item.priority}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses(
                                item.status,
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                            {formatDate(item.updated_at)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              {item.status === "draft" && (
                                <button
                                  type="button"
                                  title="Publish"
                                  onClick={() =>
                                    void handlePublish(item)
                                  }
                                  className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                title="Edit"
                                onClick={() => openEdit(item)}
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                onClick={() =>
                                  void handleDelete(item)
                                }
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>

      {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editing
                      ? "Edit Announcement"
                      : "Create Announcement"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage platform communication content.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Field label="Title">
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter announcement title"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    value={form.body}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        body: e.target.value,
                      }))
                    }
                    rows={6}
                    placeholder="Write announcement message..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 resize-none"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Priority">
                    <Select
                      value={form.priority}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          priority:
                            value as AnnouncementPriority,
                        }))
                      }
                      options={priorityOptions}
                    />
                  </Field>

                  <Field label="Target Audience">
                    <Select
                      value={form.audience_type}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          audience_type:
                            value as AnnouncementAudience,
                        }))
                      }
                      options={audienceOptions}
                    />
                  </Field>

                  <Field label="Channel">
                    <Select
                      value={form.channel}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          channel:
                            value as AnnouncementChannel,
                        }))
                      }
                      options={channelOptions}
                    />
                  </Field>

                  <Field label="Status">
                    <Select
                      value={form.status}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          status:
                            value as AnnouncementStatus,
                        }))
                      }
                      options={statusOptions.filter(
                        (x) => x.value !== "",
                      )}
                    />
                  </Field>
                </div>

                <Field label="Schedule Date & Time">
                  <div className="relative">
                    <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          scheduled_at: e.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </Field>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                  {editing ? "Save Changes" : "Create Announcement"}
                </button>
              </div>
            </div>
        </div>
      )}
    </PlatformAdminGuard>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
