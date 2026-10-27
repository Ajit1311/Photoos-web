"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  getPlatformAdminMarketplaceFeaturedListings,
  type PlatformAdminMarketplaceListing,
} from "@/lib/api/platform-admin";

function money(value: number | null | undefined, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function typeLabel(type: string | null) {
  if (type === "paid") return "Paid";
  if (type === "free_trial") return "Free Trial";
  if (type === "free") return "Free";
  return "Featured";
}

function typeClass(type: string | null) {
  if (type === "paid") return "bg-emerald-50 text-emerald-700";
  if (type === "free_trial") return "bg-blue-50 text-blue-700";
  if (type === "free") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber-700";
}

export default function MarketplaceFeaturedPage() {
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] =
    useState<PlatformAdminMarketplaceListing | null>(null);

  const limit = 50;

  const query = useQuery({
    queryKey: [
      "platform-admin-marketplace-featured",
      search,
      listingType,
      city,
      page,
    ],
    queryFn: () =>
      getPlatformAdminMarketplaceFeaturedListings({
        search: search || undefined,
        listingType: listingType || undefined,
        city: city || undefined,
        limit,
        offset: page * limit,
      }),
    staleTime: 30_000,
  });

  const data = query.data;
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / limit),
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-semibold text-slate-900">
            Featured Listings
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Manage and review studios currently featured in the
          public marketplace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {([
          ["Featured", data?.total ?? 0, Star],
          [
            "Verified",
            data?.items.filter((item) => item.is_verified).length ?? 0,
            BadgeCheck,
          ],
          [
            "Paid",
            data?.items.filter((item) => item.listing_type === "paid").length ?? 0,
            CircleDollarSign,
          ],
          [
            "Avg. Rating",
            data?.items.length
              ? (
                  data.items.reduce(
                    (sum, item) =>
                      sum + Number(item.average_rating ?? 0),
                    0,
                  ) / data.items.length
                ).toFixed(1)
              : "0.0",
            Star,
          ],
        ] as const).map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {label}
              </span>
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search featured studio, city, email..."
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

          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(0);
            }}
            placeholder="City"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
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
                    Loading featured listings...
                  </td>
                </tr>
              ) : data?.items.length ? (
                data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                          <Building2 className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {item.display_name ||
                              item.business_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.email ||
                              item.phone ||
                              "No contact"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {item.city ||
                          item.location ||
                          "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.state || item.country || ""}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {item.plan_name ||
                          "No subscription"}
                      </div>
                      {Number(item.plan_price ?? 0) > 0 && (
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
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Featured
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-medium">
                        <Star className="h-4 w-4 fill-current text-amber-500" />
                        {Number(
                          item.average_rating || 0,
                        ).toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.total_reviews} reviews
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >
                    <Star className="mx-auto h-8 w-8 text-slate-300" />
                    <div className="mt-3 font-medium text-slate-700">
                      No featured listings
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      No marketplace studios are currently
                      marked as featured.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <div className="text-xs text-slate-500">
            Showing {data?.items.length ?? 0} of{" "}
            {data?.total ?? 0}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() =>
                setPage((value) => Math.max(0, value - 1))
              }
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs text-slate-500">
              Page {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Featured Listing
                </div>
                <div className="text-sm text-slate-500">
                  Marketplace studio details
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <div className="text-xl font-semibold text-slate-900">
                  {selected.display_name ||
                    selected.business_name}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {selected.email ||
                    selected.phone ||
                    "No contact"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">
                    Plan
                  </div>
                  <div className="mt-1 font-medium">
                    {selected.plan_name ||
                      "No subscription"}
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="text-xs text-amber-600">
                    Featured
                  </div>
                  <div className="mt-1 font-medium text-amber-700">
                    Yes
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                {selected.city ||
                  selected.location ||
                  "Location not provided"}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BadgeCheck className="h-4 w-4" />
                Verification:{" "}
                {selected.is_verified
                  ? "Verified"
                  : "Unverified"}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Featured status is sourced from the marketplace
                vendor discovery profile.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
