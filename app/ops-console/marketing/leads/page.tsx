"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

import {
  getPlatformMarketingLeads,
  type PlatformMarketingLead,
} from "@/lib/api/platform-admin";
import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionsBaseUrl } from "@/lib/supabase/config";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "on_hold", label: "On Hold" },
  { value: "archived", label: "Archived" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "website", label: "Website" },
  { value: "landing_page", label: "Landing Page" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google_ads", label: "Google Ads" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
  { value: "manual", label: "Manual" },
  { value: "import", label: "Import" },
];

const IMPORT_FIELDS = [
  "title",
  "description",
  "status",
  "source",
  "expected_value",
  "probability",
  "expected_close_date",
  "first_contact_at",
  "last_contact_at",
  "next_follow_up_at",
];

function labelize(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: string | null) {
  if (status === "won") return "bg-emerald-50 text-emerald-700";
  if (status === "lost") return "bg-red-50 text-red-700";
  if (status === "qualified") return "bg-blue-50 text-blue-700";
  if (status === "contacted") return "bg-violet-50 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

function normalizeHeader(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return normalized === "lead_title" ? "title" : normalized;
}

function normalizeRow(
  row: Record<string, unknown>,
  headers: string[],
) {
  const normalized: Record<string, unknown> = {};

  for (const header of headers) {
    const key = normalizeHeader(header);
    if (!key) continue;

    normalized[key] = row[header];
  }

  return normalized;
}

function mapImportRow(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};

  for (const field of IMPORT_FIELDS) {
    if (row[field] !== undefined && row[field] !== "") {
      result[field] = row[field];
    }
  }

  return result;
}

export default function MarketingLeadsPage() {
  const [items, setItems] = useState<PlatformMarketingLead[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<Record<string, unknown>[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [studioId, setStudioId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    failed: number;
    errors: Array<{ row?: unknown; error?: string }>;
  } | null>(null);
  const [importError, setImportError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const limit = 50;

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPlatformMarketingLeads({
        search,
        status,
        source,
        limit,
        offset,
      });

      setItems(response.data.items);
      setTotal(response.data.total);
      setHasMore(response.data.has_more);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load leads.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, source, offset]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  function resetImport() {
    setImportRows([]);
    setImportHeaders([]);
    setImportFileName("");
    setStudioId("");
    setImportResult(null);
    setImportError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function closeImport() {
    if (importing) return;
    resetImport();
    setImportOpen(false);
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImportError("");
    setImportResult(null);

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("No worksheet found in the file.");
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        worksheet,
        {
          defval: "",
          raw: false,
        },
      );

      if (!rows.length) {
        throw new Error("The selected file contains no data rows.");
      }

      if (rows.length > 1000) {
        throw new Error("Maximum 1000 leads can be imported at once.");
      }

      const headers = Object.keys(rows[0] ?? {});

      const normalizedRows = rows
        .map((row) => normalizeRow(row, headers))
        .map(mapImportRow);

      if (
        !normalizedRows.some(
          (row) =>
            typeof row.title === "string" &&
            row.title.trim().length > 0,
        )
      ) {
        throw new Error(
          "A title column is required. Use a column named title or Lead Title.",
        );
      }

      setImportFileName(file.name);
      setImportHeaders(
        Object.keys(normalizedRows[0] ?? {}),
      );
      setImportRows(normalizedRows);
    } catch (err) {
      setImportRows([]);
      setImportHeaders([]);
      setImportError(
        err instanceof Error
          ? err.message
          : "Unable to read the selected file.",
      );
    }
  }

  async function submitImport() {
    if (!studioId.trim()) {
      setImportError("Studio ID is required.");
      return;
    }

    if (!importRows.length) {
      setImportError("Please select a valid import file.");
      return;
    }

    setImporting(true);
    setImportError("");
    setImportResult(null);

    try {
      const token = getPlatformAdminSessionToken();

      if (!token) {
        throw new Error("Admin session expired. Please sign in again.");
      }

      const baseUrl =
        getSupabaseFunctionsBaseUrl();

      const response = await fetch(
        `${baseUrl}/platform-marketing-lead-import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studio_id: studioId.trim(),
            rows: importRows,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to import leads.",
        );
      }

      setImportResult({
        created: Number(payload?.data?.created ?? 0),
        failed: Number(payload?.data?.failed ?? 0),
        errors: Array.isArray(payload?.data?.errors)
          ? payload.data.errors
          : [],
      });

      setOffset(0);
      await loadLeads();
    } catch (err) {
      setImportError(
        err instanceof Error
          ? err.message
          : "Unable to import leads.",
      );
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        title: "Sample Lead",
        description: "Lead description",
        status: "new",
        source: "import",
        expected_value: 10000,
        probability: 50,
        expected_close_date: "2026-09-30",
        first_contact_at: "",
        last_contact_at: "",
        next_follow_up_at: "",
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    XLSX.writeFile(workbook, "photoos-leads-template.xlsx");
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/ops-console/marketing"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Marketing
              </Link>
              <span>/</span>
              <span>Leads</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Leads
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and analyse all marketing leads.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <Upload className="h-4 w-4" />
              Import Leads
            </button>

            <button
              type="button"
              onClick={() => void loadLeads()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search lead number, title or description..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setOffset(0);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setOffset(0);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOffset(0)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              <span className="font-semibold text-slate-900">
                All Leads
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {total}
              </span>
            </div>

            <span className="text-xs text-slate-400">
              Showing {items.length ? offset + 1 : 0}–
              {offset + items.length}
            </span>
          </div>

          {error ? (
            <div className="p-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading leads...
            </div>
          ) : items.length === 0 ? (
            <div className="p-14 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                No leads found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                No lead records match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Lead</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Value</th>
                    <th className="px-5 py-3">Follow-up</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium">
                        <Link
                          href={`/admin/marketing/leads/${lead.id}`}
                          className="inline-flex rounded-md px-1 py-0.5 text-slate-900 hover:bg-slate-100 hover:text-blue-700"
                        >
                          #{lead.lead_number}
                        </Link>
                      </td>

                      <td className="max-w-[300px] px-5 py-4">
                        <Link
                          href={`/admin/marketing/leads/${lead.id}`}
                          className="block rounded-md px-1 py-0.5 hover:bg-slate-50"
                        >
                          <div className="truncate text-sm font-medium text-slate-900 hover:text-blue-700">
                            {lead.title || "Untitled Lead"}
                          </div>
                          {lead.description && (
                            <div className="mt-1 truncate text-xs text-slate-500">
                              {lead.description}
                            </div>
                          )}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(lead.status)}`}
                        >
                          {labelize(lead.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {labelize(lead.source)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {lead.expected_value != null
                          ? `₹${Number(lead.expected_value).toLocaleString("en-IN")}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(lead.next_follow_up_at)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <span className="text-xs text-slate-500">
              Page {Math.floor(offset / limit) + 1}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={offset === 0 || loading}
                onClick={() =>
                  setOffset(Math.max(0, offset - limit))
                }
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={!hasMore || loading}
                onClick={() => setOffset(offset + limit)}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Import Leads
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  CSV, XLSX, XLS and spreadsheet exports supported.
                </p>
              </div>

              <button
                type="button"
                onClick={closeImport}
                disabled={importing}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.numbers"
                    onChange={handleFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center hover:border-slate-400"
                  >
                    <FileSpreadsheet className="h-9 w-9 text-slate-400" />
                    <span className="mt-3 text-sm font-semibold text-slate-800">
                      {importFileName || "Choose spreadsheet"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      Maximum 1000 rows
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="mt-3 text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
                  >
                    Download import template
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Studio ID
                  </label>

                  <input
                    value={studioId}
                    onChange={(event) =>
                      setStudioId(event.target.value)
                    }
                    placeholder="Studio UUID"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Every lead belongs to a studio. Enter the existing
                    studio UUID.
                  </p>
                </div>
              </div>

              {importError && (
                <div className="mt-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importRows.length > 0 && (
                <div className="mt-6 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Import Preview
                      </h3>
                      <p className="text-xs text-slate-500">
                        {importRows.length} rows detected
                      </p>
                    </div>

                    <span className="text-xs text-slate-400">
                      {importHeaders.length} columns
                    </span>
                  </div>

                  <div className="max-h-72 overflow-auto">
                    <table className="w-full min-w-[900px] text-left text-xs">
                      <thead className="sticky top-0 bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          {importHeaders.map((header) => (
                            <th
                              key={header}
                              className="px-4 py-3"
                            >
                              {labelize(header)}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {importRows.slice(0, 20).map((row, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-slate-400">
                              {index + 1}
                            </td>

                            {importHeaders.map((header) => (
                              <td
                                key={header}
                                className="max-w-[220px] truncate px-4 py-3 text-slate-600"
                              >
                                {String(row[header] ?? "") || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {importRows.length > 20 && (
                    <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-400">
                      Showing first 20 rows of {importRows.length}.
                    </div>
                  )}
                </div>
              )}

              {importResult && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />

                    <div>
                      <h3 className="text-sm font-semibold text-emerald-900">
                        Import completed
                      </h3>

                      <p className="mt-1 text-sm text-emerald-800">
                        {importResult.created} created ·{" "}
                        {importResult.failed} failed
                      </p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-3 max-h-32 overflow-auto rounded-lg bg-white/70 p-3 text-xs text-red-700">
                      {importResult.errors.map((item, index) => (
                        <div key={index} className="mb-1">
                          Row {index + 1}:{" "}
                          {item.error || "Import failed"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeImport}
                disabled={importing}
                className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => void submitImport()}
                disabled={
                  importing ||
                  importRows.length === 0 ||
                  !studioId.trim()
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
              >
                {importing && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
                {importing ? "Importing..." : "Import Leads"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
