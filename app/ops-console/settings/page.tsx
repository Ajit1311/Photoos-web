"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Settings,
  Server,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";

import {
  getPlatformAdminSettings,
  updatePlatformAdminSetting,
} from "@/lib/api/platform-admin/settings";

type SettingsData = Record<
  string,
  Record<string, unknown>
>;

export default function GeneralSettingsPage() {
  const [settings, setSettings] =
    useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getPlatformAdminSettings();

      setSettings(data ?? {});
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSetting = async (
    key: string,
    value: Record<string, unknown>,
  ) => {
    try {
      setSaving(key);
      setError(null);
      setSuccess(null);

      await updatePlatformAdminSetting(
        key,
        value,
      );

      setSettings((current) => ({
        ...current,
        [key]: value,
      }));

      setSuccess(`${key} updated successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save setting.",
      );
    } finally {
      setSaving(null);
    }
  };

  const environment =
    settings["platform.environment"] ?? {};

  const version =
    settings["platform.version"] ?? {};

  const features =
    settings["platform.features"] ?? {};

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              General Settings
            </h1>
            <p className="text-sm text-gray-500">
              Manage core PhotoOS platform configuration.
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
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Server className="h-5 w-5 text-gray-700" />
            <div>
              <h2 className="font-semibold">
                Platform Environment
              </h2>
              <p className="text-xs text-gray-500">
                Runtime environment configuration.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium">
            Environment
          </label>

          <select
            value={
              String(
                environment.environment ?? "production",
              )
            }
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                "platform.environment": {
                  environment:
                    event.target.value,
                },
              }))
            }
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="production">
              Production
            </option>
            <option value="staging">
              Staging
            </option>
            <option value="development">
              Development
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              saveSetting(
                "platform.environment",
                environment,
              )
            }
            disabled={
              saving === "platform.environment"
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving === "platform.environment" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Info className="h-5 w-5 text-gray-700" />
            <div>
              <h2 className="font-semibold">
                Platform Version
              </h2>
              <p className="text-xs text-gray-500">
                Current PhotoOS platform version.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="text-xs text-gray-500">
              Version
            </div>
            <div className="mt-1 text-lg font-semibold">
              {String(version.version ?? "—")}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Status
            </div>
            <div className="mt-1 text-sm font-medium">
              {String(version.status ?? "—")}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gray-700" />
            <div>
              <h2 className="font-semibold">
                Platform Features
              </h2>
              <p className="text-xs text-gray-500">
                Global feature configuration registry.
              </p>
            </div>
          </div>

          <pre className="overflow-auto rounded-xl bg-gray-950 p-4 text-xs text-gray-100">
            {JSON.stringify(features, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
