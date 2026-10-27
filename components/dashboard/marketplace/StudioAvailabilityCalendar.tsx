"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getStudioMarketplaceAvailability,
  setStudioMarketplaceAvailability,
  type StudioAvailabilityDay,
  type StudioAvailabilityStatus,
} from "@/lib/api/marketplace/studio-availability";

type Props = {
  studioId: string;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthStart(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function getMonthEnd(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  );
}

function getCalendarStart(date: Date) {
  const start = getMonthStart(date);
  const day = start.getDay();

  return new Date(
    start.getFullYear(),
    start.getMonth(),
    1 - day,
  );
}

function getCalendarEnd(date: Date) {
  const end = getMonthEnd(date);
  const day = end.getDay();

  return new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate() + (6 - day),
  );
}

function statusLabel(
  status: StudioAvailabilityStatus,
) {
  if (status === "half_day") {
    return "Half Day";
  }

  if (status === "unavailable") {
    return "Unavailable";
  }

  return "Available";
}

export default function StudioAvailabilityCalendar({
  studioId,
}: Props) {
  const [currentMonth, setCurrentMonth] =
    useState(() => getMonthStart(new Date()));

  const [days, setDays] = useState<
    StudioAvailabilityDay[]
  >([]);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<StudioAvailabilityStatus>("available");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const monthLabel = currentMonth.toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    },
  );

  const calendarDays = useMemo(() => {
    const start = getCalendarStart(currentMonth);
    const end = getCalendarEnd(currentMonth);
    const result: Date[] = [];

    const cursor = new Date(start);

    while (cursor <= end) {
      result.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }, [currentMonth]);

  const dayMap = useMemo(() => {
    return new Map(
      days.map((day) => [
        day.availability_date,
        day,
      ]),
    );
  }, [days]);

  async function loadAvailability() {
    try {
      setLoading(true);
      setError("");

      const fromDate = formatDate(
        getCalendarStart(currentMonth),
      );

      const toDate = formatDate(
        getCalendarEnd(currentMonth),
      );

      const result =
        await getStudioMarketplaceAvailability(
          studioId,
          fromDate,
          toDate,
        );

      setDays(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load availability.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAvailability();
  }, [studioId, currentMonth]);

  function selectDate(date: string) {
    setSelectedDate(date);

    const existing = dayMap.get(date);

    if (existing) {
      setSelectedStatus(
        existing.availability_status,
      );

      setStartTime(
        existing.start_time?.slice(0, 5) || "",
      );

      setEndTime(
        existing.end_time?.slice(0, 5) || "",
      );

      setReason(existing.reason || "");
      setNote(existing.note || "");
    } else {
      setSelectedStatus("available");
      setStartTime("");
      setEndTime("");
      setReason("");
      setNote("");
    }
  }

  async function handleSave() {
    if (!selectedDate) return;

    try {
      setSaving(true);
      setError("");

      await setStudioMarketplaceAvailability({
        studioId,
        availabilityDate: selectedDate,
        availabilityStatus: selectedStatus,
        startTime:
          selectedStatus === "half_day"
            ? startTime || null
            : null,
        endTime:
          selectedStatus === "half_day"
            ? endTime || null
            : null,
        reason: reason || null,
        note: note || null,
      });

      await loadAvailability();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save availability.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={20}
                  className="text-slate-700"
                />

                <h2 className="text-lg font-semibold text-slate-950">
                  Availability Calendar
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Manage dates visible to clients in Marketplace.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((value) =>
                    new Date(
                      value.getFullYear(),
                      value.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="min-w-[145px] text-center text-sm font-semibold text-slate-900">
                {monthLabel}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((value) =>
                    new Date(
                      value.getFullYear(),
                      value.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronRight size={18} />
              </button>

            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              Available
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              Half Day
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Booked / Unavailable
            </span>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-7 border-b border-slate-100 pb-2">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateKey = formatDate(date);
              const data = dayMap.get(dateKey);
              const isCurrentMonth =
                date.getMonth() ===
                currentMonth.getMonth();

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const isPastDate = date < today;

              const status =
                data?.availability_status ||
                (error ? "unavailable" : "available");

              const isSelected =
                selectedDate === dateKey;

              const statusClass =
                status === "unavailable"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : status === "half_day"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => {
                    if (isPastDate) return;
                    selectDate(dateKey);
                  }}
                  disabled={isPastDate}
                  className={[
                    "relative min-h-[76px] rounded-2xl border p-2 text-left transition",
                    statusClass,
                    !isCurrentMonth
                      ? "opacity-35"
                      : "",
                    isPastDate
                      ? "cursor-not-allowed opacity-35 grayscale"
                      : "hover:-translate-y-0.5 hover:shadow-sm",
                    isSelected
                      ? "ring-2 ring-slate-950 ring-offset-1"
                      : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold">
                    {date.getDate()}
                  </span>

                  <span className="mt-2 block text-[10px] font-semibold">
                    {statusLabel(status)}
                  </span>

                  {data?.source === "booking" ? (
                    <span className="mt-1 block text-[9px] text-red-600">
                      Booking
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Loading availability...
            </div>
          ) : null}

        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h3 className="text-base font-semibold text-slate-950">
            Update Date
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {selectedDate
              ? new Date(
                  `${selectedDate}T00:00:00`,
                ).toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )
              : "Select a date from the calendar."}
          </p>

          <div className="mt-6 space-y-3">

            {(
              [
                ["available", "Available"],
                ["half_day", "Half Day"],
                ["unavailable", "Unavailable"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={!selectedDate}
                onClick={() =>
                  setSelectedStatus(value)
                }
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  selectedStatus === value
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  !selectedDate
                    ? "cursor-not-allowed opacity-50"
                    : "",
                ].join(" ")}
              >
                {label}

                {selectedStatus === value ? (
                  <Check size={17} />
                ) : null}
              </button>
            ))}

          </div>

          {selectedStatus === "half_day" ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Start
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </label>

              <label className="text-xs font-semibold text-slate-600">
                End
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>
          ) : null}

          <label className="mt-5 block text-xs font-semibold text-slate-600">
            Reason

            <input
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              placeholder="Optional"
              disabled={!selectedDate}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
            />
          </label>

          <label className="mt-4 block text-xs font-semibold text-slate-600">
            Note

            <textarea
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Optional note for your team"
              disabled={!selectedDate}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedDate || saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            Save Availability
          </button>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <Clock3 size={14} />
              Marketplace visibility
            </div>

            <p className="mt-1">
              These dates will be used by the Client App
              Marketplace calendar.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}
