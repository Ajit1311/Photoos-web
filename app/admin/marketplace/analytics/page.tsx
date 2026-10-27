"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CircleDollarSign,
  Eye,
  MapPin,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";

import {
  getPlatformAdminMarketplaceAnalytics,
  PlatformAdminMarketplaceAnalytics,
} from "@/lib/api/platform-admin";

function formatINR(value: number | undefined) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function formatPercent(value: number | undefined) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

export default function MarketplaceAnalyticsPage() {
  const [data, setData] =
    useState<PlatformAdminMarketplaceAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function loadAnalytics() {
    setLoading(true);

    try {
      const result =
        await getPlatformAdminMarketplaceAnalytics({
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });

      setData(result);
    } catch (error) {
      console.error(
        "Marketplace analytics load failed:",
        error,
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const maxRevenue = useMemo(() => {
    if (!data?.revenue_trend?.length) return 1;

    return Math.max(
      ...data.revenue_trend.map(
        (item) =>
          Number(item.marketplace_revenue) +
          Number(item.verified_badge_revenue),
      ),
      1,
    );
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Marketplace Analytics
          </h1>
        </div>

        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
          Loading marketplace analytics...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Marketplace Analytics
          </h1>
        </div>

        <div className="rounded-xl border bg-card p-12 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />

          <p className="mt-3 font-medium">
            Analytics unavailable
          </p>

          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    overview,
    revenue,
    studio_breakdown,
    verification_breakdown,
    leads,
    lead_sources,
    city_performance,
    category_performance,
    reviews,
    orders,
  } = data;

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Marketplace Analytics
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Marketplace performance, studios, listings, revenue,
            leads and customer activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(event.target.value)
            }
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(event.target.value)
            }
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Apply
          </button>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total Studios"
          value={overview.total_studios}
          icon={Building2}
        />

        <Kpi
          label="Active Studios"
          value={overview.active_studios}
          icon={Users}
        />

        <Kpi
          label="Active Listings"
          value={overview.active_listings}
          icon={Eye}
        />

        <Kpi
          label="Verified Studios"
          value={overview.verified_studios}
          icon={BadgeCheck}
        />
      </div>

      {/* REVENUE */}
      <section className="space-y-4">
        <SectionTitle
          icon={CircleDollarSign}
          title="Revenue Analytics"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Marketplace Revenue"
            value={formatINR(
              revenue.marketplace_orders_revenue,
            )}
          />

          <Metric
            label="Verified Badge Revenue"
            value={formatINR(
              revenue.verified_badge_revenue,
            )}
          />

          <Metric
            label="Verified Badge Price"
            value={`${formatINR(
              revenue.verified_badge_price,
            )}/month`}
          />

          <Metric
            label="Badge Active Studios"
            value={revenue.verified_badge_active_studios}
          />
        </div>

        {/* REVENUE INFOGRAPHIC */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Revenue Trend
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Daily actual recorded revenue
              </p>
            </div>

            <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-6 space-y-3">
            {data.revenue_trend.map((item) => {
              const marketplace =
                Number(item.marketplace_revenue);

              const badge =
                Number(item.verified_badge_revenue);

              const total = marketplace + badge;

              const width =
                total > 0
                  ? Math.max(
                      4,
                      (total / maxRevenue) * 100,
                    )
                  : 0;

              return (
                <div
                  key={item.date}
                  className="grid grid-cols-[70px_1fr_90px] items-center gap-3"
                >
                  <span className="text-xs text-muted-foreground">
                    {item.date.slice(5)}
                  </span>

                  <div className="h-7 overflow-hidden rounded-md bg-muted">
                    <div
                      className="h-full rounded-md bg-foreground/75 transition-all"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>

                  <span className="text-right text-xs font-medium">
                    {formatINR(total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STUDIO BREAKDOWN */}
      <section className="space-y-4">
        <SectionTitle
          icon={Users}
          title="Studio Analytics"
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownCard
            title="Studio Type"
            items={[
              ["Paid", studio_breakdown.paid],
              ["Free Trial", studio_breakdown.free_trial],
              ["Free", studio_breakdown.free],
            ]}
          />

          <BreakdownCard
            title="Verification"
            items={[
              [
                "Verified",
                verification_breakdown.verified,
              ],
              [
                "Unverified",
                verification_breakdown.unverified,
              ],
            ]}
          />
        </div>
      </section>

      {/* LEADS */}
      <section className="space-y-4">
        <SectionTitle
          icon={MessageSquare}
          title="Lead Analytics"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Total Leads"
            value={leads.total}
          />

          <Metric
            label="Active Leads"
            value={leads.active}
          />

          <Metric
            label="Converted Leads"
            value={leads.converted}
          />

          <Metric
            label="Conversion Rate"
            value={formatPercent(
              leads.conversion_rate,
            )}
          />
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Lead Sources
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Recorded marketplace lead sources
              </p>
            </div>

            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5 space-y-4">
            {!lead_sources.length ? (
              <Empty text="No lead source data available" />
            ) : (
              lead_sources.map((item) => {
                const width =
                  leads.total > 0
                    ? (item.count / leads.total) * 100
                    : 0;

                return (
                  <div key={item.source}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{item.source}</span>

                      <span>
                        {item.count} leads ·{" "}
                        {item.converted} converted
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/70"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* CITY + CATEGORY */}
      <section className="grid gap-4 lg:grid-cols-2">
        <PerformanceCard
          title="Top Cities"
          icon={MapPin}
          rows={city_performance.map((item) => ({
            label: item.city,
            primary: `${item.studios} studios`,
            secondary: `${item.listings} listings`,
          }))}
        />

        <PerformanceCard
          title="Top Categories"
          icon={Package}
          rows={category_performance.map((item) => ({
            label: item.category,
            primary: `${item.listings} listings`,
            secondary: `${item.active_listings} active`,
          }))}
        />
      </section>

      {/* CUSTOMER ACTIVITY */}
      <section className="space-y-4">
        <SectionTitle
          icon={BarChart3}
          title="Customer Activity"
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* REVIEWS */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Reviews
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Rating distribution
                </p>
              </div>

              <Star className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-5 flex gap-6">
              <div className="min-w-[90px] text-center">
                <div className="text-3xl font-bold">
                  {Number(
                    reviews.average_rating,
                  ).toFixed(1)}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {reviews.total} reviews
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {[
                  ["5", reviews.five_star],
                  ["4", reviews.four_star],
                  ["3", reviews.three_star],
                  ["2", reviews.two_star],
                  ["1", reviews.one_star],
                ].map(([rating, count]) => {
                  const width =
                    reviews.total > 0
                      ? (Number(count) /
                          reviews.total) *
                        100
                      : 0;

                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-3">
                        {rating}
                      </span>

                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/70"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <span className="w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ORDERS */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Marketplace Orders
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Actual marketplace order activity
                </p>
              </div>

              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric
                label="Orders"
                value={orders.total}
              />

              <Metric
                label="Completed"
                value={orders.completed}
              />

              <Metric
                label="Revenue"
                value={formatINR(orders.revenue)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
        Data period:{" "}
        <span className="font-medium text-foreground">
          {data.period.date_from}
        </span>{" "}
        →{" "}
        <span className="font-medium text-foreground">
          {data.period.date_to}
        </span>
        {" · "}
        Generated{" "}
        {new Date(
          data.generated_at,
        ).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {label}
        </span>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {Number(value).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof BarChart3;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      <h2 className="text-lg font-semibold">
        {title}
      </h2>
    </div>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: [string, number][];
}) {
  const total = items.reduce(
    (sum, [, value]) => sum + Number(value),
    0,
  );

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="font-semibold">{title}</h3>

      <div className="mt-5 space-y-4">
        {items.map(([label, value]) => {
          const width =
            total > 0
              ? (Number(value) / total) * 100
              : 0;

          return (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{label}</span>

                <span className="font-medium">
                  {value}
                </span>
              </div>

              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/70"
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}

        <div className="border-t pt-3 text-xs text-muted-foreground">
          Total:{" "}
          <span className="font-medium text-foreground">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}

function PerformanceCard({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof MapPin;
  rows: Array<{
    label: string;
    primary: string;
    secondary: string;
  }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />

        <h3 className="font-semibold">
          {title}
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        {!rows.length ? (
          <Empty text="No data available" />
        ) : (
          rows.map((row, index) => (
            <div
              key={`${row.label}-${index}`}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {row.label}
                </p>

                <p className="text-xs text-muted-foreground">
                  {row.secondary}
                </p>
              </div>

              <span className="text-sm font-semibold">
                {row.primary}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
