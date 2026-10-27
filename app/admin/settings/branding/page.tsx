"use client";

import {
  Brush,
  CheckCircle2,
  Globe2,
  Loader2,
  Palette,
  Save,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getBrandingSettings,
  saveBrandingSettings,
} from "@/lib/api/platform-admin/branding-settings";

type BrandingSettings = {
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  heading_font?: string;
  border_radius?: string;
  button_style?: string;
};

export default function BrandingSettingsPage() {
  const [form, setForm] = useState<BrandingSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getBrandingSettings()
      .then((data) => setForm(data ?? {}))
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load branding settings.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const update = (
    key: keyof BrandingSettings,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await saveBrandingSettings(form);

      setSuccess("Branding settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save branding settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const input = (
    label: string,
    key: keyof BrandingSettings,
    placeholder = "",
  ) => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        value={form[key] ?? ""}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <Brush className="h-6 w-6 text-slate-700" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Branding
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage PhotoOS visual identity and brand appearance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-slate-700" />
              <div>
                <h2 className="font-bold text-slate-900">
                  Brand Assets
                </h2>
                <p className="text-sm text-slate-500">
                  Configure platform logo and favicon.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {input("Logo URL", "logo_url", "https://example.com/logo.png")}
              {input(
                "Favicon URL",
                "favicon_url",
                "https://example.com/favicon.ico",
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center gap-3">
              <Palette className="h-5 w-5 text-slate-700" />
              <div>
                <h2 className="font-bold text-slate-900">
                  Brand Colors
                </h2>
                <p className="text-sm text-slate-500">
                  Configure the platform color palette.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {input("Primary Color", "primary_color", "#0A3F61")}
              {input("Secondary Color", "secondary_color", "#3495A1")}
              {input("Accent Color", "accent_color", "#EF8619")}
              {input("Background Color", "background_color", "#F8FAFC")}
              {input("Text Color", "text_color", "#0F172A")}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div
                className="h-10 w-10 rounded-lg"
                style={{
                  backgroundColor: form.primary_color || "#0A3F61",
                }}
              />
              <div
                className="h-10 w-10 rounded-lg"
                style={{
                  backgroundColor: form.secondary_color || "#3495A1",
                }}
              />
              <div
                className="h-10 w-10 rounded-lg"
                style={{
                  backgroundColor: form.accent_color || "#EF8619",
                }}
              />
              <span className="ml-2 text-sm text-slate-500">
                Brand palette preview
              </span>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center gap-3">
              <Type className="h-5 w-5 text-slate-700" />
              <div>
                <h2 className="font-bold text-slate-900">
                  Typography & UI
                </h2>
                <p className="text-sm text-slate-500">
                  Configure typography and interface styling.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {input("Body Font", "font_family", "Inter")}
              {input(
                "Heading Font",
                "heading_font",
                "Cormorant Garamond",
              )}
              {input("Border Radius", "border_radius", "12px")}
              {input("Button Style", "button_style", "rounded")}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
