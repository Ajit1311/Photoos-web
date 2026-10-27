"use client";

import { useEventWizard } from "@/context/EventWizardContext";
import { CheckCircle2, Search } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useState } from "react";

export default function StepTwoClient() {
  const { data, setField } = useEventWizard();
  const [search, setSearch] = useState("");

  const { clients, loading, error } = useClients({
    search,
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">Client Details</h2>

      <p className="mt-2 text-slate-500">
        Link an existing client or create a new client for this event.
      </p>

      {/* मूळ फॉर्म विभाग */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Client Type</label>
          <select
            value={data.clientMode}
            onChange={(event) =>
              setField(
                "clientMode",
                event.target.value as "existing" | "new"
              )
            }
            className="w-full rounded-2xl border border-slate-200 p-3"
          >
            <option value="existing">Existing Client</option>
            <option value="new">New Client</option>
          </select>
        </div>

        {/* Client Form Conditional Section */}
        {data.clientMode === "new" && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">Client Name</label>
              <input
                value={data.clientName}
                onChange={(event) => setField("clientName", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3"
                placeholder="Rahul Patil"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Mobile Number
              </label>
              <input
                value={data.clientPhone}
                onChange={(event) => setField("clientPhone", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={data.clientEmail}
                onChange={(event) => setField("clientEmail", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3"
                placeholder="client@email.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Address</label>
              <textarea
                rows={4}
                value={data.clientAddress}
                onChange={(event) => setField("clientAddress", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3"
                placeholder="Client Address"
              />
            </div>
          </>
        )}
      </div>

      {/* Existing Clients Section wrapped conditionally */}
      {data.clientMode === "existing" && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">
            Existing Clients
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select an existing client or continue creating a new one.
          </p>

          {/* Search Input Bar */}
          <div className="relative mt-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search existing clients..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-[#0A3F61]"
            />
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading clients...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              {error?.message ?? "Something went wrong while loading clients."}
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 space-y-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setField("selectedClientId", client.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${data.selectedClientId === client.id
                      ? "border-[#0A3F61] bg-[#0A3F61]/5"
                      : "border-slate-200 hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
                    }`}
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {client.display_name}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">{client.phone}</p>
                    {client.email && (
                      <p className="mt-1 text-xs text-slate-400">
                        {client.email}
                      </p>
                    )}
                  </div>
                  <CheckCircle2
                    size={22}
                    className={
                      data.selectedClientId === client.id
                        ? "text-[#0A3F61]"
                        : "text-slate-300"
                    }
                  />
                </button>
              ))}

              {/* Empty State */}
              {clients.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  {search.trim()
                    ? "No matching clients found."
                    : "No clients available."}
                </div>
              )}
            </div>
          )}

          {/* Selected Client Alert Success Box */}
          {data.selectedClientId && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h4 className="font-semibold text-emerald-700">Client Selected</h4>
              <p className="mt-2 text-sm text-emerald-600">
                Existing client will be linked with this event.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}