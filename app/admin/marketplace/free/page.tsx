"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Eye,
  Search,
  Store,
  X,
} from "lucide-react";
import {
  getPlatformAdminMarketplaceFreeTrialListings,
  PlatformAdminMarketplaceListing,
} from "@/lib/api/platform-admin";

export default function MarketplaceFreeListingsPage() {
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getPlatformAdminMarketplaceFreeTrialListings>
    > | null>(null);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<PlatformAdminMarketplaceListing | null>(null);

  const limit = 50;

  async function load() {
    setLoading(true);

    try {
      const result = await getPlatformAdminMarketplaceFreeTrialListings({
        search: search || undefined,
        city: city || undefined,
        listing_type: listingType || undefined,
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
  }, [offset, listingType]);

  const summary = data?.summary;

  const stats = [
    ["Total", summary?.total ?? 0, Store],
    ["Free", summary?.free ?? 0, CircleDollarSign],
    ["Free Trial", summary?.free_trial ?? 0, Clock3],
    ["Active", summary?.active ?? 0, Eye],
    ["Verified", summary?.verified ?? 0, BadgeCheck],
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Free / Trial Listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage studios listed through free or trial marketplace access.
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
            placeholder="Search studio, city or state..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setOffset(0);
              void load();
            }
          }}
          placeholder="City"
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-48"
        />

        <select
          value={listingType}
          onChange={(e) => {
            setListingType(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-48"
        >
          <option value="">All Free / Trial</option>
          <option value="free">Free</option>
          <option value="free_trial">Free Trial</option>
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
          <h2 className="font-semibold">Listings</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading listings...
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <Store className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No free or trial listings found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Free and trial marketplace studios will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left">Studio</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-left">Listing</th>
                  <th className="px-5 py-3 text-left">Plan</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Rating</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {item.display_name || item.business_name || "Unnamed Studio"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.email || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {[item.city, item.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {item.listing_type === "free_trial"
                          ? "FREE TRIAL"
                          : "FREE"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {item.plan_name || item.plan_code || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {item.status || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {Number(item.average_rating || 0).toFixed(1)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({item.total_reviews || 0})
                      </span>
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
            {data?.total ?? 0} listing(s)
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
              <h2 className="text-lg font-semibold">Listing Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Studio</p>
                <p className="font-medium">
                  {selected.display_name || selected.business_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Listing Type</p>
                <p className="font-medium">
                  {selected.listing_type === "free_trial"
                    ? "Free Trial"
                    : "Free"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p>{selected.plan_name || selected.plan_code || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p>
                  {[selected.location, selected.city, selected.state, selected.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p>{selected.email || "—"}</p>
                <p>{selected.phone || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Verification</p>
                <p>{selected.verification_status || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
