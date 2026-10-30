"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Boxes,
  Search,
  Store,
  X,
} from "lucide-react";
import {
  getPlatformAdminMarketplaceCategories,
  PlatformAdminMarketplaceCategory,
} from "@/lib/api/platform-admin";

export default function MarketplaceCategoriesPage() {
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getPlatformAdminMarketplaceCategories>
    > | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<PlatformAdminMarketplaceCategory | null>(null);

  const limit = 50;

  async function load() {
    setLoading(true);

    try {
      const result = await getPlatformAdminMarketplaceCategories({
        search: search || undefined,
        status: status || undefined,
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
  }, [offset, status]);

  const summary = data?.summary;

  const stats = [
    ["Total Categories", summary?.total ?? 0, Boxes],
    ["Active", summary?.active ?? 0, Activity],
    ["Inactive", summary?.inactive ?? 0, Store],
    ["Services", summary?.services ?? 0, Boxes],
    ["Active Services", summary?.active_services ?? 0, Activity],
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketplace Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage photography and marketplace service categories.
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
            placeholder="Search category..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-48"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
          <h2 className="font-semibold">Categories</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading categories...
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <Boxes className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No categories found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Marketplace categories will appear here when configured.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Slug</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Services</th>
                  <th className="px-5 py-3 text-left">Active Services</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description || "No description"}
                      </div>
                    </td>

                    <td className="px-5 py-4">{item.slug}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">{item.service_count}</td>

                    <td className="px-5 py-4">
                      {item.active_service_count}
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
            {data?.total ?? 0} categor{data?.total === 1 ? "y" : "ies"}
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
              <h2 className="text-lg font-semibold">Category Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{selected.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Slug</p>
                <p>{selected.slug}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p>{selected.description || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p>{selected.status}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Services</p>
                <p>{selected.service_count}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Active Services
                </p>
                <p>{selected.active_service_count}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
