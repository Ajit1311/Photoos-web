"use client";

import { useState } from "react";
import { Copy, Loader2, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { createClientStudioConnectToken } from "@/lib/api/client-studio-connect";
import { createClientStudioSmartLink } from "@/lib/qr/client-studio-smart-link";

type Props = {
  studioId: string | null;
  clientId: string;
};

export function ClientStudioConnectQr({
  studioId,
  clientId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!studioId) {
      setError("Studio information is not available.");
      return;
    }

    if (!clientId) {
      setError("Client information is not available.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCopied(false);

      const response =
        await createClientStudioConnectToken(
          studioId,
          clientId,
        );

      const smartLink =
        createClientStudioSmartLink(
          response.token,
        );

      setLink(smartLink);
      setExpiresAt(response.expiresAt);
      setOpen(true);
    } catch (generateError) {
      console.error(
        "CLIENT STUDIO QR GENERATION ERROR",
        generateError,
      );

      setError(
        generateError instanceof Error
          ? generateError.message
          : "Unable to generate client connection QR.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error(
        "CLIENT STUDIO QR COPY ERROR",
        copyError,
      );
    }
  }

  function handleClose() {
    setOpen(false);
    setLink(null);
    setExpiresAt(null);
    setError(null);
    setCopied(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void handleGenerate();
        }}
        disabled={!studioId || loading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#08344F] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <QrCode className="h-4 w-4" />
        )}

        {loading
          ? "Generating..."
          : "Connect Client App"}
      </button>

      {error ? (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {open && link ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Connect Client App
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Scan this QR code from the PhotoOS client app.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 flex justify-center">
              <div className="rounded-2xl border bg-white p-5">
                <QRCodeSVG
                  value={link}
                  size={240}
                  level="M"
                  includeMargin
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Connection link
              </p>

              <p className="mt-2 break-all text-sm text-slate-700">
                {link}
              </p>
            </div>

            {expiresAt ? (
              <p className="mt-3 text-center text-xs text-slate-500">
                Expires:{" "}
                {new Date(expiresAt).toLocaleString(
                  "en-IN",
                )}
              </p>
            ) : null}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  void handleCopy();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Copy className="h-4 w-4" />

                {copied
                  ? "Copied"
                  : "Copy Link"}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl bg-[#0A3F61] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#08344F]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
