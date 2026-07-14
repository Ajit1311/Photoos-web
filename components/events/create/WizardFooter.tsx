"use client";

import { Loader2 } from "lucide-react";

import { useEventWizard } from "@/context/EventWizardContext";

export default function WizardFooter() {

  const {
    submit,
    submitting,
    error,
  } = useEventWizard();

  return (
    <div className="space-y-5">

      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </div>

      )}

      <div className="flex justify-end">

        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            void submit();
          }}
          className="inline-flex items-center gap-3 rounded-2xl bg-[#0A3F61] px-8 py-4 font-semibold text-white transition hover:bg-[#14557F] disabled:cursor-not-allowed disabled:opacity-60"
        >

          {submitting ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Creating Event...
            </>
          ) : (
            "Create Event"
          )}

        </button>

      </div>

    </div>
  );

}