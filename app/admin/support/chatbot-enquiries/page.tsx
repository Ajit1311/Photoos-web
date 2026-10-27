"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getWebsiteAiEnquiryCount,
  getWebsiteAiEnquiryMessages,
  listWebsiteAiEnquiries,
  updateWebsiteAiEnquiry,
  type WebsiteAiEnquiry,
  type WebsiteAiEnquiryStatus,
  type WebsiteAiMessage,
} from "@/lib/api/platform-admin-website-ai-enquiries";


const STATUS_OPTIONS: Array<
  WebsiteAiEnquiryStatus | "all"
> = [
  "all",
  "new",
  "follow_up",
  "contacted",
  "converted",
  "closed",
];

const PAGE_SIZE = 25;


function formatDate(
  value: string | null | undefined,
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}


function statusLabel(
  status: WebsiteAiEnquiryStatus | "all",
) {
  if (status === "all") {
    return "All";
  }

  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}


function statusClass(
  status: WebsiteAiEnquiryStatus,
) {
  switch (status) {
    case "new":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "follow_up":
      return "bg-purple-50 text-purple-700 ring-purple-200";

    case "contacted":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "converted":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "closed":
      return "bg-slate-100 text-slate-600 ring-slate-200";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}


function messageRoleLabel(
  role: WebsiteAiMessage["role"],
) {
  switch (role) {
    case "visitor":
      return "Visitor";

    case "assistant":
      return "PhotoOS AI";

    default:
      return "System";
  }
}


export default function ChatbotEnquiriesPage() {

  const [enquiries, setEnquiries] =
    useState<WebsiteAiEnquiry[]>([]);

  const [newCount, setNewCount] =
    useState(0);

  const [statusFilter, setStatusFilter] =
    useState<WebsiteAiEnquiryStatus | "all">(
      "all",
    );

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<WebsiteAiEnquiry | null>(null);

  const [messages, setMessages] =
    useState<WebsiteAiMessage[]>([]);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);


  const loadEnquiries = useCallback(
    async (
      showRefresh = false,
    ) => {

      try {

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          enquiryData,
          count,
        ] = await Promise.all([
          listWebsiteAiEnquiries(
            statusFilter === "all"
              ? undefined
              : statusFilter,
            PAGE_SIZE,
            page * PAGE_SIZE,
          ),
          getWebsiteAiEnquiryCount(),
        ]);

        setEnquiries(enquiryData);
        setNewCount(count);

      } catch (err) {

        console.error(
          "WEBSITE AI ENQUIRIES ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load chatbot enquiries.",
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    [
      page,
      statusFilter,
    ],
  );


  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);


  useEffect(() => {
    setPage(0);
  }, [statusFilter]);


  async function openEnquiry(
    enquiry: WebsiteAiEnquiry,
  ) {

    setSelectedEnquiry(enquiry);
    setMessages([]);
    setMessagesLoading(true);

    try {

      const data =
        await getWebsiteAiEnquiryMessages(
          enquiry.id,
        );

      setMessages(data);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation.",
      );

    } finally {

      setMessagesLoading(false);

    }
  }


  async function handleStatusChange(
    status: WebsiteAiEnquiryStatus,
  ) {

    if (!selectedEnquiry) {
      return;
    }

    try {

      setUpdating(true);
      setError(null);

      const updated =
        await updateWebsiteAiEnquiry(
          selectedEnquiry.id,
          status,
          selectedEnquiry.visitor_name,
          selectedEnquiry.visitor_email,
          selectedEnquiry.visitor_phone,
        );

      setSelectedEnquiry(updated);

      setEnquiries(
        (current) =>
          current.map(
            (item) =>
              item.id === updated.id
                ? updated
                : item,
          ),
      );

      if (statusFilter !== "all") {

        setEnquiries(
          (current) =>
            current.filter(
              (item) =>
                item.id !== updated.id ||
                item.status === statusFilter,
            ),
        );

      }

      if (status === "new") {
        setNewCount(
          (current) => current + 1,
        );
      }

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update enquiry.",
      );

    } finally {

      setUpdating(false);

    }
  }


  const filteredEnquiries =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return enquiries;
      }

      return enquiries.filter(
        (enquiry) =>
          [
            enquiry.visitor_name,
            enquiry.visitor_email,
            enquiry.visitor_phone,
            enquiry.landing_page,
            enquiry.session_id,
            enquiry.id,
            enquiry.status,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(query),
            ),
      );

    }, [
      enquiries,
      search,
    ]);


  return (
    <div className="min-h-full bg-slate-50">

      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">

        {/* HEADER */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">

              <Link
                href="/admin"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Admin
              </Link>

              <span>/</span>

              <Link
                href="/admin/support"
                className="hover:text-slate-900"
              >
                Support
              </Link>

              <span>/</span>

              <span>Chatbot Enquiries</span>

            </div>


            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Chatbot Enquiries
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage website visitors who explicitly requested human support.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              void loadEnquiries(true)
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >

            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh

          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* STATUS SUMMARY */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            icon={
              <MessageSquareText className="h-5 w-5" />
            }
            label="New Enquiries"
            value={newCount}
            active
          />

          <SummaryCard
            icon={
              <Clock3 className="h-5 w-5" />
            }
            label="Follow-up"
            value={
              enquiries.filter(
                (item) =>
                  item.status === "follow_up",
              ).length
            }
          />

          <SummaryCard
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
            label="Contacted"
            value={
              enquiries.filter(
                (item) =>
                  item.status === "contacted",
              ).length
            }
          />

          <SummaryCard
            icon={
              <XCircle className="h-5 w-5" />
            }
            label="Closed"
            value={
              enquiries.filter(
                (item) =>
                  item.status === "closed",
              ).length
            }
          />

        </div>


        {/* FILTER BAR */}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search visitor, email, phone, page or conversation ID..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />

            </div>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as WebsiteAiEnquiryStatus | "all",
                )
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {statusLabel(status)}
                  </option>
                ),
              )}

            </select>

          </div>

        </section>


        {/* TABLE */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h2 className="font-semibold text-slate-900">
                  Visitor Enquiries
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Only visitors who explicitly requested human support appear here.
                </p>

              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {filteredEnquiries.length} shown
              </span>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="min-w-[1150px] w-full">

              <thead className="bg-slate-50">

                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                  <th className="px-5 py-4">
                    Visitor
                  </th>

                  <th className="px-5 py-4">
                    Contact
                  </th>

                  <th className="px-5 py-4">
                    Landing Page
                  </th>

                  <th className="px-5 py-4">
                    Requested
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Conversation ID
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-5 py-14 text-center text-sm text-slate-500"
                    >
                      Loading chatbot enquiries...
                    </td>

                  </tr>

                ) : filteredEnquiries.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-5 py-14 text-center"
                    >

                      <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No chatbot enquiries found.
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Normal AI conversations are not shown here.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredEnquiries.map(
                    (enquiry) => (

                      <tr
                        key={enquiry.id}
                        onClick={() =>
                          void openEnquiry(
                            enquiry,
                          )
                        }
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          enquiry.status === "new"
                            ? "bg-amber-50/30"
                            : ""
                        }`}
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">

                              <User className="h-4 w-4" />

                            </div>

                            <div>

                              <div className="text-sm font-medium text-slate-900">
                                {enquiry.visitor_name ||
                                  "Unknown Visitor"}
                              </div>

                              <div className="mt-1 text-xs text-slate-400">
                                {enquiry.visitor_id ||
                                  "Visitor"}
                              </div>

                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-4">

                          <div className="space-y-1 text-sm text-slate-600">

                            {enquiry.visitor_email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <span className="max-w-[220px] truncate">
                                  {enquiry.visitor_email}
                                </span>
                              </div>
                            )}

                            {enquiry.visitor_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {enquiry.visitor_phone}
                              </div>
                            )}

                            {!enquiry.visitor_email &&
                              !enquiry.visitor_phone && (
                                <span className="text-slate-400">
                                  No contact details
                                </span>
                              )}

                          </div>

                        </td>


                        <td className="max-w-[220px] px-5 py-4 text-sm text-slate-600">

                          <div className="truncate">
                            {enquiry.landing_page ||
                              "—"}
                          </div>

                        </td>


                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">

                          {formatDate(
                            enquiry.human_requested_at ||
                              enquiry.created_at,
                          )}

                        </td>


                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
                              enquiry.status,
                            )}`}
                          >
                            {statusLabel(
                              enquiry.status,
                            )}
                          </span>

                        </td>


                        <td className="px-5 py-4">

                          <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
                            {enquiry.id.slice(
                              0,
                              8,
                            )}
                            ...
                          </code>

                        </td>

                      </tr>

                    ),
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* PAGINATION */}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">

            <p className="text-xs text-slate-500">
              Page {page + 1}
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        current - 1,
                        0,
                      ),
                  )
                }
                disabled={
                  page === 0 ||
                  loading
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>


              <button
                type="button"
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                disabled={
                  loading ||
                  enquiries.length < PAGE_SIZE
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>

          </div>

        </section>

      </div>


      {/* DETAIL DRAWER */}

      {selectedEnquiry && (

        <div className="fixed inset-0 z-50 flex">

          <button
            type="button"
            aria-label="Close enquiry"
            onClick={() =>
              setSelectedEnquiry(null)
            }
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
          />


          <aside className="relative ml-auto flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">

            {/* DRAWER HEADER */}

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Website AI Enquiry
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedEnquiry.visitor_name ||
                      "Unknown Visitor"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {selectedEnquiry.id}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedEnquiry(null)
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

            </div>


            {/* CONTACT DETAILS */}

            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">

              <div className="grid gap-3 sm:grid-cols-2">

                <DetailItem
                  icon={
                    <Mail className="h-4 w-4" />
                  }
                  label="Email"
                  value={
                    selectedEnquiry.visitor_email ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={
                    <Phone className="h-4 w-4" />
                  }
                  label="Phone"
                  value={
                    selectedEnquiry.visitor_phone ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={
                    <User className="h-4 w-4" />
                  }
                  label="Landing Page"
                  value={
                    selectedEnquiry.landing_page ||
                    "Unknown"
                  }
                />

                <DetailItem
                  icon={
                    <Clock3 className="h-4 w-4" />
                  }
                  label="Human Requested"
                  value={formatDate(
                    selectedEnquiry.human_requested_at,
                  )}
                />

              </div>

            </div>


            {/* STATUS ACTIONS */}

            <div className="border-b border-slate-200 px-6 py-4">

              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enquiry Status
              </p>

              <div className="flex flex-wrap gap-2">

                {(
                  [
                    "new",
                    "follow_up",
                    "contacted",
                    "converted",
                    "closed",
                  ] as WebsiteAiEnquiryStatus[]
                ).map(
                  (status) => (

                    <button
                      key={status}
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        void handleStatusChange(
                          status,
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-medium ring-1 ring-inset transition ${
                        selectedEnquiry.status ===
                        status
                          ? statusClass(status)
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                      } disabled:opacity-50`}
                    >
                      {statusLabel(status)}
                    </button>

                  ),
                )}

              </div>

            </div>


            {/* TRANSCRIPT */}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">

              <div className="mb-4">

                <h3 className="font-semibold text-slate-900">
                  AI Conversation
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Complete transcript for this visitor.
                </p>

              </div>


              {messagesLoading ? (

                <div className="py-12 text-center text-sm text-slate-500">
                  Loading conversation...
                </div>

              ) : messages.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                  No conversation messages found.
                </div>

              ) : (

                <div className="space-y-4">

                  {messages.map(
                    (message) => {

                      const visitor =
                        message.role ===
                        "visitor";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            visitor
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                              visitor
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >

                            <div
                              className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${
                                visitor
                                  ? "text-slate-300"
                                  : "text-slate-400"
                              }`}
                            >
                              {messageRoleLabel(
                                message.role,
                              )}
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {message.content}
                            </p>

                            <div
                              className={`mt-2 text-[10px] ${
                                visitor
                                  ? "text-slate-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {formatDate(
                                message.created_at,
                              )}
                            </div>

                          </div>

                        </div>
                      );

                    },
                  )}

                </div>

              )}

            </div>

          </aside>

        </div>

      )}

    </div>
  );
}


// =============================================================================
// SMALL UI COMPONENTS
// =============================================================================

function SummaryCard({
  icon,
  label,
  value,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        active
          ? "border-amber-200"
          : "border-slate-200"
      }`}
    >

      <div className="flex items-center gap-3 text-slate-500">
        {icon}
        <span className="text-sm font-medium">
          {label}
        </span>
      </div>

      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {value.toLocaleString("en-IN")}
      </div>

    </div>
  );
}


function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">

      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </div>

    </div>
  );
}
