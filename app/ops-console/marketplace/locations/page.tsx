"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BadgeCheck,
  MapPin,
  Search,
  Store,
} from "lucide-react";
import {
  getPlatformAdminMarketplaceLocations,
} from "@/lib/api/platform-admin";

export default function MarketplaceLocationsPage() {
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getPlatformAdminMarketplaceLocations>
    > | null>(null);

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 50;

  async function load() {
    setLoading(true);

    try {
      const result = await getPlatformAdminMarketplaceLocations({
        search: search || undefined,
        state: state || undefined,
        country: country || undefined,
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
  }, [offset]);

  const summary = data?.summary;

  const stats = [
    ["Locations", summary?.locations ?? 0, MapPin],
    ["Studios", summary?.vendors ?? 0, Store],
    ["Active Studios", summary?.active_vendors ?? 0, Activity],
    ["Verified Studios", summary?.verified_vendors ?? 0, BadgeCheck],
    ["Services", summary?.services ?? 0, Store],
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketplace Locations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Location-wise marketplace coverage, studios and services.
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
            placeholder="Search city, state or country..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-44"
        />

        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-44"
        />

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
          <h2 className="font-semibold">Location Coverage</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading locations...
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No marketplace locations found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Locations will appear when studios publish marketplace listings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left">City</th>
                  <th className="px-5 py-3 text-left">State</th>
                  <th className="px-5 py-3 text-left">Country</th>
                  <th className="px-5 py-3 text-right">Studios</th>
                  <th className="px-5 py-3 text-right">Active</th>
                  <th className="px-5 py-3 text-right">Verified</th>
                  <th className="px-5 py-3 text-right">Services</th>
                  <th className="px-5 py-3 text-right">Active Services</th>
                </tr>
              </thead>

              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={`${item.city}-${item.state}-${item.country}`}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4 font-medium">{item.city}</td>
                    <td className="px-5 py-4">{item.state}</td>
                    <td className="px-5 py-4">{item.country}</td>
                    <td className="px-5 py-4 text-right">
                      {item.vendor_count}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.active_vendor_count}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.verified_vendor_count}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.service_count}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.active_service_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-5 py-4 text-sm">
          <span className="text-muted-foreground">
            {data?.total ?? 0} location(s)
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
    </div>
  );
}
