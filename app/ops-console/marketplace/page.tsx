"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  FolderTree,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import { getPlatformAdminMarketplaceOverview } from "@/lib/api/platform-admin";

function number(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function Kpi({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-slate-100 p-2.5 w-fit">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      ) : null}
    </div>
  );
}

function Status({
  value,
  successValues,
}: {
  value: string | null;
  successValues: string[];
}) {
  const enabled =
    value !== null &&
    successValues.includes(value.toLowerCase());

  return enabled ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {value}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      <XCircle className="h-3.5 w-3.5" />
      {value ?? "Not set"}
    </span>
  );
}

export default function MarketplaceOverviewPage() {
  const query = useQuery({
    queryKey: ["platform-admin-marketplace-overview"],
    queryFn: getPlatformAdminMarketplaceOverview,
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;

  const vendors = data?.vendors ?? [];
  const categories = data?.categories ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Photography studio discovery, listings, services and marketplace
            activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => query.refetch()}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {query.isLoading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          Loading marketplace...
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load marketplace."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              icon={Store}
              label="Total Listings"
              value={number(summary?.vendors ?? 0)}
            />
            <Kpi
              icon={CheckCircle2}
              label="Active Listings"
              value={number(summary?.active_vendors ?? 0)}
            />
            <Kpi
              icon={ShieldCheck}
              label="Verified"
              value={number(summary?.verified_vendors ?? 0)}
            />
            <Kpi
              icon={Eye}
              label="Featured"
              value={number(summary?.featured_vendors ?? 0)}
            />
            <Kpi
              icon={BriefcaseBusiness}
              label="Services"
              value={number(summary?.active_services ?? 0)}
              detail={`${number(summary?.services ?? 0)} total`}
            />
            <Kpi
              icon={FolderTree}
              label="Categories"
              value={number(summary?.categories ?? 0)}
            />
            <Kpi
              icon={MessageSquare}
              label="Reviews"
              value={number(summary?.reviews ?? 0)}
            />
            <Kpi
              icon={Users}
              label="Leads"
              value={number(summary?.leads ?? 0)}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Listing Status
                  </h2>
                  <p className="text-xs text-slate-500">
                    Marketplace vendor lifecycle
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">Active</span>
                  <span className="font-semibold">
                    {number(summary?.active_vendors ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">Verified</span>
                  <span className="font-semibold text-emerald-600">
                    {number(summary?.verified_vendors ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">Pending</span>
                  <span className="font-semibold text-amber-600">
                    {number(summary?.pending_vendors ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Featured</span>
                  <span className="font-semibold">
                    {number(summary?.featured_vendors ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Marketplace Activity
                  </h2>
                  <p className="text-xs text-slate-500">
                    Current marketplace records
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">Orders</span>
                  <span className="font-semibold">
                    {number(summary?.orders ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">Reviews</span>
                  <span className="font-semibold">
                    {number(summary?.reviews ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">Leads</span>
                  <span className="font-semibold">
                    {number(summary?.leads ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    Search Index
                  </span>
                  <span className="font-semibold">
                    {number(summary?.search_index_active ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Discovery
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search and location readiness
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">
                    Indexed Listings
                  </span>
                  <span className="font-semibold">
                    {number(summary?.search_index_entries ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">
                    Active Index
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {number(summary?.search_index_active ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    Categories
                  </span>
                  <span className="font-semibold">
                    {number(summary?.categories ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5" />
                <div>
                  <h2 className="font-semibold text-slate-900">
                    All Marketplace Listings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Paid and free studios will appear here automatically after
                    marketplace onboarding.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Studio</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Listing</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center"
                      >
                        <div className="mx-auto w-fit rounded-full bg-slate-100 p-3">
                          <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <p className="mt-3 font-medium text-slate-700">
                          No marketplace listings yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Studio listings will appear here once vendors are
                          created.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {vendor.display_name ||
                              vendor.business_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {vendor.email || vendor.phone || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {[
                              vendor.city,
                              vendor.state,
                              vendor.country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {vendor.plan_name || "No plan"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {vendor.billing_cycle || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <Status
                              value={vendor.status}
                              successValues={["active"]}
                            />
                            {vendor.is_verified ? (
                              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                Verified
                              </span>
                            ) : null}
                            {vendor.is_featured ? (
                              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 font-medium">
                            <Star className="h-4 w-4 fill-current" />
                            {Number(vendor.average_rating || 0).toFixed(1)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {number(vendor.total_reviews)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <h2 className="font-semibold text-slate-900">
                Marketplace Categories
              </h2>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.length === 0 ? (
                <div className="col-span-full py-8 text-center text-sm text-slate-500">
                  No marketplace categories configured yet.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="font-medium text-slate-900">
                      {category.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {number(category.service_count)} services
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="rounded-2xl border bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Zap className="h-4 w-4" />
              Marketplace source
            </div>
            <p className="mt-2">
              This admin view uses the existing PhotoOS marketplace vendor,
              discovery profile, service, category, rating, lead, order and
              subscription records. No duplicate listing source is created.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
