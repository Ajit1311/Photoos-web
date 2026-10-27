"use client";

import {
  useEffect,
  useState,
  type ElementType,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Download,
  ImageIcon,
  Loader2,
  LockKeyhole,
  QrCode,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";

import {
  useWorkspace,
} from "@/hooks/events/useWorkspace";

import {
  updateEvent,
} from "@/lib/api/events";

import type {
  EventStatus,
} from "@/types/api/event";

interface EventSettingsProps {
  eventId: string;
}

interface GallerySettings {
  generateQrGallery: boolean;

  enableClientGallery: boolean;

  allowDownload: boolean;

  lockDownloadsUntilPayment: boolean;

  watermark: boolean;

  enableFavouriteSelection: boolean;

  expiryDate: string | null;
}

const EVENT_STATUSES: {
  value: EventStatus;
  label: string;
}[] = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "scheduled",
    label: "Scheduled",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

function getBoolean(
  value: unknown,
  fallback: boolean,
): boolean {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  return fallback;
}

function getDateValue(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .split(
      "T",
    )[0]
    .trim();
}

interface ToggleRowProps {
  title: string;

  description: string;

  checked: boolean;

  disabled?: boolean;

  onChange: (
    checked: boolean,
  ) => void;

  icon: ElementType;
}

function ToggleRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
  icon: Icon,
}: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3F61]/10 text-[#0A3F61]">
        <Icon
          size={20}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={
          checked
        }
        disabled={
          disabled
        }
        onClick={() =>
          onChange(
            !checked,
          )
        }
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
          checked
            ? "bg-[#0A3F61]"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function EventSettings({
  eventId,
}: EventSettingsProps) {
  const {
    loading,
    workspace,
    error,
    refresh,
  } =
    useWorkspace(
      eventId,
    );

  const [
    status,
    setStatus,
  ] =
    useState<EventStatus>(
      "draft",
    );

  const [
    settings,
    setSettings,
  ] =
    useState<GallerySettings>(
      {
        generateQrGallery:
          true,

        enableClientGallery:
          true,

        allowDownload:
          false,

        lockDownloadsUntilPayment:
          true,

        watermark:
          true,

        enableFavouriteSelection:
          true,

        expiryDate:
          null,
      },
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    saveError,
    setSaveError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    saved,
    setSaved,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      if (
        !workspace
      ) {
        return;
      }

      const event =
        workspace.event;

      const metadata =
        (
          event.metadata ??
          {}
        ) as Record<
          string,
          unknown
        >;

      setStatus(
        event.status,
      );

      setSettings(
        {
          generateQrGallery:
            getBoolean(
              metadata.generateQrGallery,
              true,
            ),

          enableClientGallery:
            getBoolean(
              metadata.enableClientGallery,
              true,
            ),

          allowDownload:
            getBoolean(
              metadata.allowDownload,
              false,
            ),

          lockDownloadsUntilPayment:
            getBoolean(
              metadata.lockDownloadsUntilPayment,
              true,
            ),

          watermark:
            getBoolean(
              metadata.watermark,
              true,
            ),

          enableFavouriteSelection:
            getBoolean(
              metadata.enableFavouriteSelection,
              true,
            ),

          expiryDate:
            getDateValue(
              metadata.expiryDate,
            ) ||
            null,
        },
      );
    },
    [
      workspace,
    ],
  );

  function updateSetting<
    K extends keyof GallerySettings,
  >(
    key: K,
    value:
      GallerySettings[K],
  ) {
    setSaved(
      false,
    );

    setSettings(
      (
        previous,
      ) => ({
        ...previous,

        [key]:
          value,
      }),
    );
  }

  async function handleSave() {
    if (
      !workspace
    ) {
      return;
    }

    const event =
      workspace.event;

    const currentMetadata =
      (
        event.metadata ??
        {}
      ) as Record<
        string,
        unknown
      >;

    setSaving(
      true,
    );

    setSaveError(
      null,
    );

    setSaved(
      false,
    );

    try {
      await updateEvent(
        event.studioId,
        eventId,
        {
          status,

          metadata: {
            ...currentMetadata,

            generateQrGallery:
              settings.generateQrGallery,

            enableClientGallery:
              settings.enableClientGallery,

            allowDownload:
              settings.allowDownload,

            lockDownloadsUntilPayment:
              settings.lockDownloadsUntilPayment,

            watermark:
              settings.watermark,

            enableFavouriteSelection:
              settings.enableFavouriteSelection,

            expiryDate:
              settings.expiryDate,
          },
        },
      );

      await refresh();

      setSaved(
        true,
      );
    } catch (
      error
    ) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save event settings.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  if (
    loading
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="animate-pulse space-y-5">
          <div className="h-7 w-56 rounded bg-slate-200" />

          <div className="h-16 rounded-2xl bg-slate-100" />

          <div className="h-16 rounded-2xl bg-slate-100" />

          <div className="h-16 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (
    error
  ) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-red-100 p-3 text-red-600">
            <XCircle
              className="h-6 w-6"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-red-900">
              Unable to load event settings
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error.message}
            </p>

            <button
              type="button"
              onClick={() =>
                void refresh()
              }
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !workspace
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <Settings2 className="mx-auto h-10 w-10 text-slate-300" />

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Settings unavailable
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
              <Settings2
                className="h-6 w-6"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Event Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage event status, gallery access, downloads and watermark settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void handleSave()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#08344f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />

                Save Settings
              </>
            )}
          </button>
        </div>

        {saveError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              {saveError}
            </span>
          </div>
        )}

        {saved && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />

            <span>
              Settings saved successfully.
            </span>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Event Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the current lifecycle status of this event.
          </p>
        </div>

        <select
          value={
            status
          }
          onChange={(
            event,
          ) => {
            setSaved(
              false,
            );

            setStatus(
              event.target
                .value as EventStatus,
            );
          }}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
        >
          {EVENT_STATUSES.map(
            (
              item,
            ) => (
              <option
                key={
                  item.value
                }
                value={
                  item.value
                }
              >
                {item.label}
              </option>
            ),
          )}
        </select>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Gallery & Access
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure gallery visibility and client permissions.
          </p>
        </div>

        <div className="space-y-4">
          <ToggleRow
            title="Generate QR Gallery"
            description="Create a QR code automatically after publishing."
            checked={
              settings.generateQrGallery
            }
            onChange={(
              value,
            ) =>
              updateSetting(
                "generateQrGallery",
                value,
              )
            }
            icon={
              QrCode
            }
          />

          <ToggleRow
            title="Enable Client Gallery"
            description="Client can access the gallery using QR or link."
            checked={
              settings.enableClientGallery
            }
            onChange={(
              value,
            ) =>
              updateSetting(
                "enableClientGallery",
                value,
              )
            }
            icon={
              ShieldCheck
            }
          />

          <ToggleRow
            title="Allow Downloads"
            description="Permit clients to download original files."
            checked={
              settings.allowDownload
            }
            onChange={(
              value,
            ) =>
              updateSetting(
                "allowDownload",
                value,
              )
            }
            icon={
              Download
            }
          />

          <ToggleRow
            title="Lock Downloads Until Payment"
            description="Downloads stay disabled until the pending amount is cleared."
            checked={
              settings.lockDownloadsUntilPayment
            }
            onChange={(
              value,
            ) =>
              updateSetting(
                "lockDownloadsUntilPayment",
                value,
              )
            }
            icon={
              LockKeyhole
            }
          />

          <ToggleRow
            title="Apply Watermark"
            description="Display a watermark in preview images."
            checked={
              settings.watermark
            }
            onChange={(
              value,
            ) =>
              updateSetting(
                "watermark",
                value,
              )
            }
            icon={
              ImageIcon
            }
          />

          <ToggleRow
            title="Enable Favourite Selection"
            description="Client can mark photos for album selection."
            checked={
              settings.enableFavouriteSelection
            }
            onChange={(
              value,
            ) =>
              updateSetting(
                "enableFavouriteSelection",
                value,
              )
            }
            icon={
              Star
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
            <CalendarDays
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gallery Expiry Date
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gallery access and QR usage will expire on the selected date.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <input
            type="date"
            value={
              settings.expiryDate ??
              ""
            }
            onChange={(
              event,
            ) =>
              updateSetting(
                "expiryDate",
                event.target.value ||
                  null,
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white p-3 text-[#0A3F61] shadow-sm">
            <Sparkles
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Gallery Protection
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Download restrictions and watermark settings can be used together
              with payment status to control client access to the gallery.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end pb-8">
        <button
          type="button"
          disabled={
            saving
          }
          onClick={() =>
            void handleSave()
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#08344f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />

              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}