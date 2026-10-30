"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Package,
  Search,
  Star,
  X,
} from "lucide-react";

import {
  getPlatformAdminMarketplacePackages,
  PlatformAdminMarketplacePackage,
} from "@/lib/api/platform-admin";

type PackagesData = Awaited<
  ReturnType<typeof getPlatformAdminMarketplacePackages>
>;

export default function MarketplacePackagesPage() {
  const [data, setData] = useState<PackagesData | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [packageType, setPackageType] = useState("");

  const [offset, setOffset] = useState(0);
  const [selected, setSelected] =
    useState<PlatformAdminMarketplacePackage | null>(null);

  const limit = 50;

  async function loadPackages() {
    setLoading(true);

    try {
      const result = await getPlatformAdminMarketplacePackages({
        search: search.trim() || undefined,
        status: status || undefined,
        package_type: packageType || undefined,
        limit,
        offset,
      });

      setData(result);
    } catch (error) {
      console.error("Marketplace packages load failed:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPackages();
  }, [offset, status, packageType]);

  const summary = data?.summary;
  const badge = data?.verified_badge;

  const formatINR = (value: number | null | undefined) =>
    `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

  const stats = [
    {
      label: "Total Packages",
      value: summary?.total_packages ?? 0,
      icon: Package,
    },
    {
      label: "Active Packages",
      value: summary?.active_packages ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Featured Packages",
      value: summary?.featured_packages ?? 0,
      icon: Star,
    },
    {
      label: "Verified Badge Studios",
      value: summary?.verified_badge_active_studios ?? 0,
      icon: BadgeCheck,
    },
    {
      label: "Verified Badge Revenue",
      value: formatINR(summary?.verified_badge_revenue),
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Marketplace Packages
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage marketplace service packages and the paid Verified Badge
          program.
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>

                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-2 text-2xl font-semibold">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* VERIFIED BADGE */}
      {badge && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-6 w-6" />

                <h2 className="text-lg font-semibold">
                  {badge.name}
                </h2>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {badge.plan_code}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {badge.currency}{" "}
                  {Number(badge.price).toLocaleString("en-IN")}
                </span>

                <span className="text-sm text-muted-foreground">
                  / {badge.billing_cycle}
                </span>

                {badge.is_active && (
                  <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Active Studios
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {badge.active_studios}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Active Subscriptions
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {badge.active_subscriptions}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Completed Payments
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {badge.completed_payments}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">
                  Collected Revenue
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {formatINR(badge.collected_revenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setOffset(0);
                void loadPackages();
              }
            }}
            placeholder="Search package, service or studio..."
            className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <select
          value={packageType}
          onChange={(event) => {
            setPackageType(event.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2.5 text-sm lg:w-52"
        >
          <option value="">All Package Types</option>
          <option value="marketplace_service">
            Marketplace Service
          </option>
          <option value="verified_badge">
            Verified Badge
          </option>
        </select>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2.5 text-sm lg:w-44"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setOffset(0);
            void loadPackages();
          }}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Search
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Marketplace Service Packages
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {data?.total ?? 0} package(s)
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading packages...
          </div>
        ) : !data?.items?.length ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />

            <p className="mt-3 font-medium">
              No marketplace packages found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Marketplace service packages will appear here when studios
              publish them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left">Package</th>
                  <th className="px-5 py-3 text-left">Studio</th>
                  <th className="px-5 py-3 text-left">Service</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Price</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {item.name}
                      </div>

                      {item.is_featured && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {item.vendor_display_name ||
                        item.vendor_business_name ||
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      {item.service_title || "—"}
                    </td>

                    <td className="px-5 py-4">
                      {item.package_type === "verified_badge" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified Badge
                        </span>
                      ) : (
                        <span className="rounded-full border px-2.5 py-1 text-xs">
                          Marketplace Service
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {item.currency}{" "}
                      {Number(item.price).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t px-5 py-4">
          <span className="text-sm text-muted-foreground">
            Showing {data?.items?.length ?? 0} of{" "}
            {data?.total ?? 0}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() =>
                setOffset(Math.max(0, offset - limit))
              }
              className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!data || offset + limit >= data.total}
              onClick={() => setOffset(offset + limit)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Package Details
                </h2>

                <p className="text-xs text-muted-foreground">
                  Marketplace package information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 pt-6">
              <Detail
                label="Package"
                value={selected.name}
              />

              <Detail
                label="Description"
                value={selected.description || "—"}
              />

              <Detail
                label="Studio"
                value={
                  selected.vendor_display_name ||
                  selected.vendor_business_name ||
                  "—"
                }
              />

              <Detail
                label="Location"
                value={
                  [selected.vendor_city, selected.vendor_state]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
              />

              <Detail
                label="Service"
                value={selected.service_title || "—"}
              />

              <Detail
                label="Package Type"
                value={selected.package_type}
              />

              <Detail
                label="Price"
                value={`${selected.currency} ${Number(
                  selected.price,
                ).toLocaleString("en-IN")}`}
              />

              <Detail
                label="Status"
                value={selected.status}
              />

              <Detail
                label="Delivery"
                value={
                  selected.delivery_days != null
                    ? `${selected.delivery_days} days`
                    : "—"
                }
              />

              <Detail
                label="Revisions"
                value={
                  selected.revisions != null
                    ? String(selected.revisions)
                    : "—"
                }
              />

              <Detail
                label="Featured"
                value={selected.is_featured ? "Yes" : "No"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
