"use client";

import {
  CheckCircle2,
  Globe2,
  Loader2,
  Mail,
  Save,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getEmailSettings,
  saveEmailSettings,
} from "@/lib/api/platform-admin/email-settings";

type EmailSettings = {
  enabled: boolean;
  provider: string;
  sender_name: string;
  sender_email: string;
  reply_to_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  encryption: string;
  api_key_configured: boolean;
  smtp_password_configured: boolean;
};

const DEFAULTS: EmailSettings = {
  enabled: true,
  provider: "resend",
  sender_name: "PhotoOS",
  sender_email: "noreply@photoos.in",
  reply_to_email: "support@photoos.in",
  smtp_host: "smtp.resend.com",
  smtp_port: 587,
  smtp_username: "resend",
  encryption: "tls",
  api_key_configured: true,
  smtp_password_configured: true,
};

export default function EmailSettingsPage() {
  const [form, setForm] =
    useState<EmailSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");

        const data =
          await getEmailSettings();

        setForm({
          ...DEFAULTS,
          ...data,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load email settings.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function update(
    key: keyof EmailSettings,
    value: string | number | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setSuccess("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveEmailSettings({
        enabled: form.enabled,
        provider: form.provider,
        sender_name: form.sender_name,
        sender_email: form.sender_email,
        reply_to_email: form.reply_to_email,
        smtp_host: form.smtp_host,
        smtp_port: form.smtp_port,
        smtp_username: form.smtp_username,
        encryption: form.encryption,
        api_key_configured:
          form.api_key_configured,
        smtp_password_configured:
          form.smtp_password_configured,
      });

      setSuccess(
        "Email settings saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save email settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Mail className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Email Settings
            </h1>
            <p className="text-sm text-slate-500">
              Configure PhotoOS platform email delivery.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Server className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="font-semibold text-slate-900">
              Email Provider
            </h2>
            <p className="text-sm text-slate-500">
              Select the platform email delivery provider.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Provider
            </span>

            <select
              value={form.provider}
              onChange={(e) =>
                update("provider", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="resend">Resend (Official)</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </label>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Email Delivery
                </p>
                <p className="text-xs text-slate-500">
                  Enable platform email sending.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  update(
                    "enabled",
                    e.target.checked,
                  )
                }
                className="h-5 w-5 rounded"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Mail className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="font-semibold text-slate-900">
              Sender Identity
            </h2>
            <p className="text-sm text-slate-500">
              Configure the sender information used by PhotoOS.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Sender Name
            </span>
            <input
              value={form.sender_name}
              onChange={(e) =>
                update(
                  "sender_name",
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="PhotoOS"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Sender Email
            </span>
            <input
              type="email"
              value={form.sender_email}
              onChange={(e) =>
                update(
                  "sender_email",
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="noreply@example.com"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Reply-To Email
            </span>
            <input
              type="email"
              value={form.reply_to_email}
              onChange={(e) =>
                update(
                  "reply_to_email",
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="support@example.com"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="font-semibold text-slate-900">
              SMTP Configuration
            </h2>
            <p className="text-sm text-slate-500">
              Configure SMTP relay connection details.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              SMTP Host
            </span>
            <input
              value={form.smtp_host}
              onChange={(e) =>
                update(
                  "smtp_host",
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              SMTP Port
            </span>
            <input
              type="number"
              value={form.smtp_port}
              onChange={(e) =>
                update(
                  "smtp_port",
                  Number(e.target.value),
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              SMTP Username
            </span>
            <input
              value={form.smtp_username}
              onChange={(e) =>
                update(
                  "smtp_username",
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Encryption
            </span>

            <select
              value={form.encryption}
              onChange={(e) =>
                update(
                  "encryption",
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="tls">
                TLS / STARTTLS
              </option>
              <option value="ssl">
                SSL
              </option>
              <option value="none">
                None
              </option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="font-semibold text-slate-900">
              Credentials
            </h2>
            <p className="text-sm text-slate-500">
              Sensitive credentials are represented only by configuration status.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                API Key
              </p>
              <p className="text-xs text-slate-500">
                Provider API credential
              </p>
            </div>

            <span
              className={
                form.api_key_configured
                  ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              }
            >
              {form.api_key_configured
                ? "Configured"
                : "Not configured"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                SMTP Password
              </p>
              <p className="text-xs text-slate-500">
                SMTP authentication credential
              </p>
            </div>

            <span
              className={
                form.smtp_password_configured
                  ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              }
            >
              {form.smtp_password_configured
                ? "Configured"
                : "Not configured"}
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-6 pb-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
