"use client";

import SwitchCard from "./SwitchCard";

import { useEventWizard } from "@/context/EventWizardContext";

export default function StepFiveGallery() {
  const { data, setField } = useEventWizard();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        Gallery & Access
      </h2>

      <p className="mt-2 text-slate-500">
        Configure gallery visibility and client permissions.
      </p>

      <div className="mt-8 space-y-5">
        <SwitchCard
          title="Generate QR Gallery"
          description="Create a QR code automatically after publishing."
          checked={data.generateQrGallery}
          onChange={(value) =>
            setField("generateQrGallery", value)
          }
        />

        <SwitchCard
          title="Enable Client Gallery"
          description="Client can access the gallery using QR or link."
          checked={data.enableClientGallery}
          onChange={(value) =>
            setField("enableClientGallery", value)
          }
        />

        <SwitchCard
          title="Allow Downloads"
          description="Permit clients to download original files."
          checked={data.allowDownload}
          onChange={(value) =>
            setField("allowDownload", value)
          }
        />

        <SwitchCard
          title="Lock Downloads Until Payment"
          description="Downloads stay disabled until payment is complete."
          checked={data.lockDownloadsUntilPayment}
          onChange={(value) =>
            setField(
              "lockDownloadsUntilPayment",
              value,
            )
          }
        />

        <SwitchCard
          title="Apply Watermark"
          description="Display a watermark in preview images."
          checked={data.watermark}
          onChange={(value) =>
            setField("watermark", value)
          }
        />

        <SwitchCard
          title="Enable Favourite Selection"
          description="Client can mark photos for album selection."
          checked={data.enableFavouriteSelection}
          onChange={(value) =>
            setField(
              "enableFavouriteSelection",
              value,
            )
          }
        />
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Gallery Expiry Date
        </label>

        <input
          type="date"
          value={data.expiryDate ?? ""}
          onChange={(event) =>
            setField(
              "expiryDate",
              event.target.value || null,
            )
          }
          className="w-full rounded-2xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61]"
        />
      </div>
    </div>
  );
}