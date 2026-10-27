"use client";

import {
  Check,
  Copy,
  Download,
  QrCode,
  X,
} from "lucide-react";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  QRCodeCanvas,
} from "qrcode.react";

export interface GalleryQRCodeModalProps {
  eventId: string;
  onClose: () => void;
}

export default function GalleryQRCodeModal({
  eventId,
  onClose,
}: GalleryQRCodeModalProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const galleryUrl =
    useMemo(() => {
      if (
        typeof window === "undefined" ||
        !eventId
      ) {
        return "";
      }

      return `${window.location.origin}/gallery/${encodeURIComponent(
        eventId,
      )}/access`;
    }, [eventId]);

  const handleCopy = async () => {
    if (!galleryUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        galleryUrl,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy gallery URL:",
        error,
      );
    }
  };

  const handleDownload = () => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const link =
      document.createElement("a");

    link.download =
      `gallery-qr-${eventId}.png`;

    link.href =
      canvas.toDataURL(
        "image/png",
      );

    link.click();
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >
        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#0A3F61]/10
              "
            >
              <QrCode
                className="h-6 w-6 text-[#0A3F61]"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Gallery QR Code
              </h2>

              <p className="text-sm text-slate-500">
                Share this gallery with your client
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR */}

        <div className="px-6 py-7">
          <div
            className="
              flex
              justify-center
            "
          >
            <div
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >
              {galleryUrl ? (
                <QRCodeCanvas
                  ref={canvasRef}
                  value={galleryUrl}
                  size={240}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#0A3F61"
                />
              ) : (
                <div
                  className="
                    flex
                    h-[240px]
                    w-[240px]
                    items-center
                    justify-center
                    text-sm
                    text-slate-400
                  "
                >
                  Gallery URL unavailable
                </div>
              )}
            </div>
          </div>

          {/* URL */}

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Client Gallery Link
            </p>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-2
              "
            >
              <div
                className="
                  min-w-0
                  flex-1
                  truncate
                  px-2
                  text-sm
                  text-slate-600
                "
                title={galleryUrl}
              >
                {galleryUrl}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-lg
                  bg-[#0A3F61]
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-[#0d4d77]
                "
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Download */}

          <button
            type="button"
            onClick={handleDownload}
            disabled={!galleryUrl}
            className="
              mt-5
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#0A3F61]
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-[#0A3F61]
              transition
              hover:bg-[#0A3F61]/5
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Download className="h-4 w-4" />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
