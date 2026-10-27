"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Search,
  Star,
  ThumbsDown,
  Users,
  X,
} from "lucide-react";
import {
  getPlatformAdminMarketplaceReviews,
  PlatformAdminMarketplaceReview,
} from "@/lib/api/platform-admin";

export default function MarketplaceReviewsPage() {
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getPlatformAdminMarketplaceReviews>
    > | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<PlatformAdminMarketplaceReview | null>(null);

  const limit = 50;

  async function load() {
    setLoading(true);

    try {
      const result = await getPlatformAdminMarketplaceReviews({
        search: search || undefined,
        status: status || undefined,
        min_rating: rating ? Number(rating) : undefined,
        max_rating: rating ? Number(rating) : undefined,
        limit,
        offset,
      });

      setData(result);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [offset, status, rating]);

  const summary = data?.summary;

  const stats = [
    ["Total Reviews", summary?.total ?? 0, Users],
    ["Published", summary?.published ?? 0, CheckCircle2],
    ["Pending", summary?.pending ?? 0, Clock3],
    ["Rejected", summary?.rejected ?? 0, ThumbsDown],
    ["Average Rating", Number(summary?.average_rating ?? 0).toFixed(2), Star],
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketplace Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor customer reviews, ratings and review verification.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {stats.map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setOffset(0);
                void load();
              }
            }}
            placeholder="Search review, studio, service or order..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-44"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={rating}
          onChange={(e) => {
            setRating(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-44"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <button
          onClick={() => {
            setOffset(0);
            void load();
          }}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Search
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Customer Reviews</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading reviews...
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <Star className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No marketplace reviews found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer reviews will appear here after marketplace activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left">Review</th>
                  <th className="px-5 py-3 text-left">Studio</th>
                  <th className="px-5 py-3 text-left">Service</th>
                  <th className="px-5 py-3 text-left">Rating</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Verified</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="max-w-xs px-5 py-4">
                      <div className="font-medium">
                        {item.title || "Untitled review"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {item.review || "No review text"}
                      </div>
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
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {item.rating}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {item.status || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.is_verified_purchase ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <BadgeCheck className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
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

        <div className="flex items-center justify-between border-t px-5 py-4 text-sm">
          <span className="text-muted-foreground">
            {data?.total ?? 0} review(s)
          </span>

          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={!data || offset + limit >= data.total}
              onClick={() => setOffset(offset + limit)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Review Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="font-medium">{selected.title || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Review</p>
                <p className="whitespace-pre-wrap">
                  {selected.review || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p>{selected.rating} / 5</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Studio</p>
                <p>
                  {selected.vendor_display_name ||
                    selected.vendor_business_name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p>{selected.service_title || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Reviewer</p>
                <p>
                  {[selected.reviewer_first_name, selected.reviewer_last_name]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Order</p>
                <p>{selected.order_number || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p>{selected.status || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Verified Purchase
                </p>
                <p>{selected.is_verified_purchase ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
