"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  MapPin,
  Search,
  Star,
  Store,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  getPlatformAdminMarketplaceActiveListings,
  type PlatformAdminMarketplaceListing,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 50;

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function typeLabel(type: string) {
  if (type === "paid") return "Paid";
  if (type === "free_trial") return "Free Trial";
  if (type === "free") return "Free";
  return "Expired / Cancelled";
}

function typeClass(type: string) {
  if (type === "paid") return "bg-emerald-50 text-emerald-700";
  if (type === "free_trial") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

function verification(item: PlatformAdminMarketplaceListing) {
  if (
    item.is_verified ||
    ["verified", "approved"].includes(item.verification_status)
  ) {
    return "Verified";
  }

  if (["pending", "submitted"].includes(item.verification_status)) {
    return "Pending";
  }

  return "Unverified";
}

export default function ActiveMarketplaceListingsPage() {
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] =
    useState<PlatformAdminMarketplaceListing | null>(null);

  const query = useQuery({
    queryKey: [
      "platform-admin-marketplace-active",
      search,
      listingType,
      verificationFilter,
      city,
      page,
    ],
    queryFn: () =>
      getPlatformAdminMarketplaceActiveListings({
        search: search || undefined,
        listingType: listingType || undefined,
        verification: verificationFilter || undefined,
        city: city || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;
  const totalPages = Math.max(
    1,
    Math.ceil((summary?.total ?? 0) / PAGE_SIZE),
  );

  function clearFilters() {
    setSearch("");
    setListingType("");
    setVerificationFilter("");
    setCity("");
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Store className="h-4 w-4" />
          Marketplace / Active Listings
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Active Listings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Studios currently active and visible in the marketplace lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {([
          ["Active", summary?.active ?? 0, Eye],
          ["Paid", summary?.paid ?? 0, CircleDollarSign],
          ["Free Trial", summary?.free_trial ?? 0, Clock3],
          ["Free", summary?.free ?? 0, Store],
          ["Verified", summary?.verified ?? 0, BadgeCheck],
        ] as const).map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search studio, city, email..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={listingType}
            onChange={(e) => {
              setListingType(e.target.value);
              setPage(0);
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="">All Plans</option>
            <option value="paid">Paid</option>
            <option value="free_trial">Free Trial</option>
            <option value="free">Free</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPage(0);
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="">All Verification</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="unverified">Unverified</option>
          </select>

          <div className="flex gap-2">
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(0);
              }}
              placeholder="City"
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
            />

            {(search ||
              listingType ||
              verificationFilter ||
              city) && (
              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-200 px-3 text-slate-500 hover:bg-slate-50"
                title="Clear filters"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Studio
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Location
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Plan
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Listing
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Rating
                </th>
                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {query.isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading active listings...
                  </td>
                </tr>
              ) : data?.items?.length ? (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Building2 className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {item.display_name || item.business_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.email || item.phone || "No contact"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {item.city || item.location || "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.state || item.country || ""}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {item.plan_name || "No subscription"}
                      </div>
                      {item.plan_price > 0 && (
                        <div className="text-xs text-slate-500">
                          {money(
                            item.plan_price,
                            item.currency || "INR",
                          )}{" "}
                          / {item.billing_cycle || "—"}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeClass(
                          item.listing_type,
                        )}`}
                      >
                        {typeLabel(item.listing_type)}
                      </span>
                      <div className="mt-2 text-xs text-slate-500">
                        {verification(item)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-medium">
                        <Star className="h-4 w-4 fill-current text-amber-500" />
                        {Number(item.average_rating || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.total_reviews} reviews
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(item)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Store className="mx-auto h-10 w-10 text-slate-300" />
                    <div className="mt-3 font-medium text-slate-700">
                      No active marketplace listings
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Active studio marketplace listings will appear here.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <span className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">
                  Active Marketplace Listing
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selected.display_name || selected.business_name}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Plan</div>
                <div className="mt-1 font-semibold">
                  {selected.plan_name || "—"}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Listing</div>
                <div className="mt-1 font-semibold">
                  {typeLabel(selected.listing_type)}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Verification</div>
                <div className="mt-1 font-semibold">
                  {verification(selected)}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Rating</div>
                <div className="mt-1 font-semibold">
                  {Number(selected.average_rating || 0).toFixed(1)} (
                  {selected.total_reviews})
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">
                  Contact
                </div>
                <div className="mt-2">{selected.email || "—"}</div>
                <div>{selected.phone || "—"}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase text-slate-400">
                  Location
                </div>
                <div className="mt-2">
                  {[
                    selected.location,
                    selected.city,
                    selected.state,
                    selected.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase text-slate-400">
                  Subscription
                </div>
                <div className="mt-2">
                  Status: {selected.subscription_status || "—"}
                </div>
                <div>
                  Billing: {selected.billing_cycle || "—"}
                </div>
                {selected.subscription_end_at && (
                  <div>
                    Ends:{" "}
                    {new Date(
                      selected.subscription_end_at,
                    ).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
