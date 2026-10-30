"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CircleDollarSign,
  Flame,
  Search,
  Users,
  X,
} from "lucide-react";
import { getPlatformAdminMarketplaceLeads } from "@/lib/api/platform-admin";

type Lead = Awaited<
  ReturnType<typeof getPlatformAdminMarketplaceLeads>
>["items"][number];

export default function MarketplaceLeadsPage() {
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getPlatformAdminMarketplaceLeads>
    > | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [city, setCity] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  const limit = 50;

  async function load() {
    setLoading(true);

    try {
      const result = await getPlatformAdminMarketplaceLeads({
        search: search || undefined,
        status: status || undefined,
        stage: stage || undefined,
        city: city || undefined,
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
  }, [offset, status, stage]);

  const summary = data?.summary;

  const stats = [
    ["Total Leads", summary?.total ?? 0, Users],
    ["Open", summary?.open ?? 0, Activity],
    ["Converted", summary?.converted ?? 0, CheckCircle2],
    ["High Priority", summary?.high_priority ?? 0, Flame],
    ["Expected Value", `₹${Number(summary?.expected_value ?? 0).toLocaleString("en-IN")}`, CircleDollarSign],
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads / Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marketplace customer enquiries and lead conversion activity.
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

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:flex-wrap">
        <div className="relative min-w-[240px] flex-1">
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
            placeholder="Search lead, studio or lead number..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-40"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-40"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);
            setOffset(0);
          }}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none md:w-40"
        >
          <option value="">All Stages</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
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
          <h2 className="font-semibold">Marketplace Enquiries</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading leads...
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No marketplace leads found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer enquiries generated through the marketplace will appear
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left">Lead</th>
                  <th className="px-5 py-3 text-left">Studio</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Stage</th>
                  <th className="px-5 py-3 text-left">Priority</th>
                  <th className="px-5 py-3 text-right">Value</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {item.title || "Untitled enquiry"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{item.lead_number || item.id.slice(0, 8)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {item.studio_name || "—"}
                    </td>

                    <td className="px-5 py-4">
                      {[item.studio_city, item.studio_state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs">
                        {item.status || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.stage || "—"}
                    </td>

                    <td className="px-5 py-4">
                      {item.priority || "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      ₹{Number(item.expected_value || 0).toLocaleString("en-IN")}
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
            {data?.total ?? 0} lead(s)
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
              <h2 className="text-lg font-semibold">Lead Details</h2>
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
                <p className="text-xs text-muted-foreground">Studio</p>
                <p>{selected.studio_name || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p>{selected.description || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status / Stage</p>
                <p>
                  {selected.status || "—"} / {selected.stage || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p>{selected.source || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Expected Value
                </p>
                <p>
                  ₹{Number(selected.expected_value || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Probability</p>
                <p>{selected.probability ?? 0}%</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Next Follow-up
                </p>
                <p>
                  {selected.next_follow_up_at
                    ? new Date(
                        selected.next_follow_up_at,
                      ).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
