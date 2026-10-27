"use client";

type ProjectsPaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function ProjectsPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: ProjectsPaginationProps) {

  if (totalPages <= 1) {
    return null;
  }

  return (

    <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[#3495A1]/15 bg-gradient-to-r from-[#F7FAFC] via-white to-[#3495A1]/[0.06] p-4 sm:p-5">

      <button
        onClick={onPrevious}
        disabled={page === 1}
        className="rounded-xl border border-[#0A3F61]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#0A3F61] shadow-sm transition hover:border-[#3495A1]/40 hover:bg-[#F7FAFC] disabled:cursor-not-allowed disabled:opacity-40"
      >

        Previous

      </button>

      <span className="text-center text-sm font-semibold text-[#0A3F61]">

        Page {page} of {totalPages}

      </span>

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >

        Next

      </button>

    </div>

  );

}