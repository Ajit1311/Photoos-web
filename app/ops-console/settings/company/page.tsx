"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Save,
  Loader2,
  Globe2,
  MapPin,
  Receipt,
} from "lucide-react";

import {
  getCompanySettings,
  saveCompanySettings,
} from "@/lib/api/platform-admin/company-settings";

type CompanySettings = {
  legal_name?: string;
  display_name?: string;
  brand_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  tax_id?: string;
  timezone?: string;
  currency?: string;
};

export default function CompanySettingsPage() {
  const [form, setForm] =
    useState<CompanySettings>({});
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState<string | null>(null);

  useEffect(() => {
    getCompanySettings()
      .then((data) => {
        setForm(data ?? {});
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load company settings.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const update = (
    key: keyof CompanySettings,
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

      await saveCompanySettings(form);

      setSuccess(
        "Company settings saved successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save company settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const input = (
    label: string,
    key: keyof CompanySettings,
    placeholder = "",
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        value={form[key] ?? ""}
        onChange={(e) =>
          update(key, e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              Company Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage PhotoOS company and business information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Building2 className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">
              Business Identity
            </h2>
            <p className="text-xs text-gray-500">
              Official company identity and brand information.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {input("Legal Name", "legal_name")}
          {input("Display Name", "display_name")}
          {input("Brand Name", "brand_name")}
          {input("Logo URL", "logo_url")}
          {input("Business Email", "email")}
          {input("Business Phone", "phone")}
          {input("Website", "website")}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <MapPin className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">
              Business Address
            </h2>
            <p className="text-xs text-gray-500">
              Registered business location.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {input("Country", "country")}
          {input("State", "state")}
          {input("City", "city")}
          {input("Postal Code", "postal_code")}
          <div className="md:col-span-2">
            {input("Address", "address")}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Receipt className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">
              Tax & Regional Settings
            </h2>
            <p className="text-xs text-gray-500">
              Tax identification and regional defaults.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {input("Tax ID / GSTIN", "tax_id")}
          {input("Timezone", "timezone")}
          {input("Currency", "currency")}
        </div>
      </section>

      <section className="rounded-2xl border bg-gray-50 p-5">
        <div className="flex items-start gap-3">
          <Globe2 className="mt-0.5 h-5 w-5 text-gray-500" />
          <div>
            <h3 className="text-sm font-semibold">
              Platform Company Profile
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              These settings belong to the PhotoOS platform
              and are independent of individual customer studios.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
