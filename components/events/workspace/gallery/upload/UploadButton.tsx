"use client";

import { useRef } from "react";
import { FolderOpen, Images, UploadCloud } from "lucide-react";

export interface UploadButtonProps {
  onFilesSelected: (files: File[]) => void;

  disabled?: boolean;
}

export default function UploadButton({
  onFilesSelected,
  disabled = false,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      onFilesSelected(files);
    }

    event.target.value = "";
  };

  const openPicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept="image/*"
        onChange={handleFiles}
        {...({
          webkitdirectory: true,
          directory: true,
        } as React.InputHTMLAttributes<HTMLInputElement>)}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className="
          inline-flex
          items-center
          gap-3
          rounded-2xl
          bg-[#0A3F61]
          px-5
          py-3
          font-medium
          text-white
          shadow-sm
          transition-all
          hover:-translate-y-0.5
          hover:bg-[#0d4d77]
          hover:shadow-lg
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <UploadCloud className="h-5 w-5" />

        <span>
          Upload Photos
        </span>

        <div className="ml-2 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
          <Images className="h-3.5 w-3.5" />

          <span>Multiple</span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
          <FolderOpen className="h-3.5 w-3.5" />

          <span>Folder</span>
        </div>
      </button>
    </>
  );
}