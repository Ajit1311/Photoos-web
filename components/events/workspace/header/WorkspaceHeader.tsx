"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// बाकीचे existing imports तसेच ठेव

export default function WorkspaceHeader({
  workspace,
}: {
  workspace: any;
}) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/events");
  };

  return (
    <div className="...">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to events"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* बाकीचा existing event header content */}
      </div>
    </div>
  );
}