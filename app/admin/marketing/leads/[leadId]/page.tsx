"use client";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getPlatformMarketingLeadDetails,
  type PlatformMarketingLeadDetails,
} from "@/lib/api/platform-admin";

function labelize(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusClass(status: string | null) {
  if (status === "won") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "lost") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status === "qualified") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "contacted") {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-sm text-slate-800">{value || "—"}</span>
    </div>
  );
}

export default function MarketingLeadDetailsPage() {
  const params = useParams<{ leadId: string }>();
  const leadId = params?.leadId;

  const [lead, setLead] = useState<PlatformMarketingLeadDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leadId) return;

    let active = true;

    async function loadLead() {
      setLoading(true);
      setError("");

      try {
        const data = await getPlatformMarketingLeadDetails(leadId);

        if (active) {
          setLead(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load lead details.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLead();

    return () => {
      active = false;
    };
  }, [leadId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/marketing/leads"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h2 className="font-semibold text-red-900">
                Unable to load lead
              </h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/marketing/leads"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Lead not found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The requested marketing lead could not be found.
          </p>
        </div>
      </div>
    );
  }

  const contact = lead.crm_contacts;

  const contactName =
    [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ||
    contact?.company_name ||
    "Unnamed Contact";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/admin/marketing"
          className="hover:text-slate-900"
        >
          Marketing
        </Link>
        <span>/</span>
        <Link
          href="/admin/marketing/leads"
          className="hover:text-slate-900"
        >
          Leads
        </Link>
        <span>/</span>
        <span className="text-slate-700">
          #{lead.lead_number}
        </span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link
              href="/admin/marketing/leads"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                Lead #{lead.lead_number}
              </span>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(lead.status)}`}
              >
                {labelize(lead.status)}
              </span>

              {lead.converted && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Converted
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              {lead.title || "Untitled Lead"}
            </h1>

            {lead.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {lead.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <DollarSign className="h-4 w-4" />
                Expected Value
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {lead.expected_value != null
                  ? `₹${Number(lead.expected_value).toLocaleString("en-IN")}`
                  : "—"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Probability</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {lead.probability != null
                  ? `${Number(lead.probability)}%`
                  : "—"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Source</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {labelize(lead.source)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">
                Contact
              </h2>
            </div>
          </div>

          <div className="px-5 py-3">
            <div className="py-3">
              <div className="text-lg font-semibold text-slate-900">
                {contactName}
              </div>

              {contact?.company_name && (
                <div className="mt-1 text-sm text-slate-500">
                  {contact.company_name}
                </div>
              )}
            </div>

            <DetailRow
              label="Email"
              value={
                contact?.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />

            <DetailRow
              label="Phone"
              value={
                contact?.phone ? (
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                ) : (
                  "—"
                )
              }
            />

            <DetailRow
              label="Alternate Phone"
              value={contact?.alternate_phone}
            />

            <DetailRow
              label="Contact Type"
              value={labelize(contact?.contact_type)}
            />

            <DetailRow
              label="Contact Status"
              value={labelize(contact?.contact_status)}
            />

            <DetailRow
              label="Lead Status"
              value={labelize(contact?.lead_status)}
            />

            <DetailRow
              label="Priority"
              value={labelize(contact?.priority)}
            />
          </div>
        </div>

        {/* Lead information */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Lead Information
            </h2>
          </div>

          <div className="grid gap-x-8 px-5 py-3 sm:grid-cols-2">
            <DetailRow
              label="Stage"
              value={labelize(lead.stage)}
            />

            <DetailRow
              label="Priority"
              value={labelize(lead.priority)}
            />

            <DetailRow
              label="Temperature"
              value={labelize(lead.temperature)}
            />

            <DetailRow
              label="Rating"
              value={
                lead.rating != null
                  ? `${lead.rating} / 5`
                  : "—"
              }
            />

            <DetailRow
              label="Source"
              value={labelize(lead.source)}
            />

            <DetailRow
              label="Expected Close Date"
              value={formatDate(lead.expected_close_date)}
            />

            <DetailRow
              label="First Contact"
              value={formatDateTime(lead.first_contact_at)}
            />

            <DetailRow
              label="Last Contact"
              value={formatDateTime(lead.last_contact_at)}
            />

            <DetailRow
              label="Next Follow-up"
              value={
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {formatDateTime(lead.next_follow_up_at)}
                </span>
              }
            />

            <DetailRow
              label="Created"
              value={formatDateTime(lead.created_at)}
            />

            <DetailRow
              label="Updated"
              value={formatDateTime(lead.updated_at)}
            />

            <DetailRow
              label="Active"
              value={lead.is_active ? "Yes" : "No"}
            />
          </div>
        </div>
      </div>

      {/* Address + conversion */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">
                Contact Address
              </h2>
            </div>
          </div>

          <div className="p-5 text-sm leading-6 text-slate-600">
            {contact ? (
              <>
                {contact.address_line_1 && (
                  <div>{contact.address_line_1}</div>
                )}
                {contact.address_line_2 && (
                  <div>{contact.address_line_2}</div>
                )}
                {(contact.city || contact.state) && (
                  <div>
                    {[contact.city, contact.state]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
                {(contact.country || contact.postal_code) && (
                  <div>
                    {[contact.country, contact.postal_code]
                      .filter(Boolean)
                      .join(" - ")}
                  </div>
                )}

                {!contact.address_line_1 &&
                  !contact.address_line_2 &&
                  !contact.city &&
                  !contact.state &&
                  !contact.country &&
                  !contact.postal_code && (
                    <span className="text-slate-400">
                      No address available.
                    </span>
                  )}
              </>
            ) : (
              <span className="text-slate-400">
                No contact information available.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Conversion
            </h2>
          </div>

          <div className="px-5 py-3">
            <DetailRow
              label="Converted"
              value={lead.converted ? "Yes" : "No"}
            />

            <DetailRow
              label="Conversion Type"
              value={labelize(lead.conversion_type)}
            />

            <DetailRow
              label="Converted At"
              value={formatDateTime(lead.converted_at)}
            />

            <DetailRow
              label="Converted Reference"
              value={lead.converted_reference_id}
            />

            <DetailRow
              label="Loss Reason"
              value={labelize(lead.loss_reason)}
            />

            <DetailRow
              label="Loss Notes"
              value={lead.loss_notes}
            />
          </div>
        </div>
      </div>

      {/* Tags / metadata */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">
                Tags
              </h2>
            </div>
          </div>

          <div className="p-5">
            {Array.isArray(lead.tags) && lead.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, index) => (
                  <span
                    key={`${String(tag)}-${index}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {String(tag)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400">
                No tags assigned.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">
                Record Timeline
              </h2>
            </div>
          </div>

          <div className="px-5 py-3">
            <DetailRow
              label="Created At"
              value={formatDateTime(lead.created_at)}
            />

            <DetailRow
              label="Updated At"
              value={formatDateTime(lead.updated_at)}
            />

            <DetailRow
              label="First Contact"
              value={formatDateTime(lead.first_contact_at)}
            />

            <DetailRow
              label="Last Contact"
              value={formatDateTime(lead.last_contact_at)}
            />

            <DetailRow
              label="Next Follow-up"
              value={formatDateTime(lead.next_follow_up_at)}
            />
          </div>
        </div>
      </div>

      {/* Raw metadata */}
      {(lead.metadata ||
        lead.custom_fields ||
        contact?.metadata ||
        contact?.custom_fields) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {lead.metadata && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Lead Metadata
                </h2>
              </div>

              <pre className="overflow-x-auto p-5 text-xs leading-5 text-slate-600">
                {JSON.stringify(lead.metadata, null, 2)}
              </pre>
            </div>
          )}

          {lead.custom_fields && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Lead Custom Fields
                </h2>
              </div>

              <pre className="overflow-x-auto p-5 text-xs leading-5 text-slate-600">
                {JSON.stringify(lead.custom_fields, null, 2)}
              </pre>
            </div>
          )}

          {contact?.metadata && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Contact Metadata
                </h2>
              </div>

              <pre className="overflow-x-auto p-5 text-xs leading-5 text-slate-600">
                {JSON.stringify(contact.metadata, null, 2)}
              </pre>
            </div>
          )}

          {contact?.custom_fields && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Contact Custom Fields
                </h2>
              </div>

              <pre className="overflow-x-auto p-5 text-xs leading-5 text-slate-600">
                {JSON.stringify(contact.custom_fields, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
