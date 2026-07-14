import SwitchCard from "./SwitchCard";

export default function StepFiveGallery() {
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
        />

        <SwitchCard
          title="Enable Client Gallery"
          description="Client can access the gallery using QR or link."
        />

        <SwitchCard
          title="Allow Downloads"
          description="Permit clients to download original files."
        />

        <SwitchCard
          title="Lock Downloads Until Payment"
          description="Downloads stay disabled until payment is complete."
        />

        <SwitchCard
          title="Apply Watermark"
          description="Display a watermark in preview images."
        />

        <SwitchCard
          title="Enable Favourite Selection"
          description="Client can mark photos for album selection."
        />

      </div>

    </div>
  );
}