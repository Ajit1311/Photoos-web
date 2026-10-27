"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useClients } from "@/hooks/useClients";

export default function ClientsPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const {
        clients = [], // Fallback array to avoid undefined errors during stats calculation
        pagination,
        loading,
        error,
    } = useClients({
        page,
        limit,
        search,
    });

    const stats = useMemo(() => {
        const companies = new Set(
            clients
                .filter((c) => !!c.company_name)
                .map((c) => c.company_name)
        );

        return {
            total: clients.length,
            active: clients.filter((c) => c.status === "active").length,
            leads: clients.filter((c) => c.status === "lead").length,
            companies: companies.size,
        };
    }, [clients]);

    if (loading) {
        return (
            <main className="mx-auto max-w-7xl p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Clients</h1>
                        <p className="mt-2 text-slate-500">Loading clients...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-7xl p-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h2 className="text-lg font-semibold text-red-700">
                        Unable to load clients
                    </h2>
                    <p className="mt-2 text-red-600">
                        {error?.message ?? "Something went wrong."}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl space-y-8 p-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Clients</h1>
                    <p className="mt-2 text-slate-500">Manage all studio clients.</p>
                </div>
                <Link
                    href="/dashboard/clients/create"
                    className="rounded-xl bg-[#0A3F61] px-5 py-3 font-medium text-white transition hover:opacity-90"
                >
                    New Client
                </Link>
            </div>

            {/* Search Input Box */}
            <div className="max-w-md">
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Search केल्यावर परत पहिल्या पेजवर जाण्यासाठी
                    }}
                    className="w-full rounded-xl border px-4 py-3"
                />
            </div>

            {/* Stats Cards Section */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-slate-500">Total Clients</p>
                    <h2 className="mt-2 text-3xl font-bold">{stats.total}</h2>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-slate-500">Active Clients</p>
                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                        {stats.active}
                    </h2>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-slate-500">Leads</p>
                    <h2 className="mt-2 text-3xl font-bold text-blue-600">
                        {stats.leads}
                    </h2>
                </div>
                <div className="rounded-2xl border bg-white p-5">
                    <p className="text-sm text-slate-500">Companies</p>
                    <h2 className="mt-2 text-3xl font-bold">{stats.companies}</h2>
                </div>
            </div>

            {/* Total Records and Rows Selector (Below Stats) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                    Total Records:
                    <span className="ml-2 font-semibold">
                        {pagination?.total ?? 0}
                    </span>
                </p>
                <div className="flex items-center gap-3">
                    <label className="text-sm">Rows</label>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="rounded-lg border px-3 py-2"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Clients List / Table Section */}
            {clients.length === 0 ? (
                <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                    <h2 className="text-xl font-semibold">No Clients Found</h2>
                    <p className="mt-3 text-slate-500">
                        Create your first client to start managing projects.
                    </p>
                    <Link
                        href="/dashboard/clients/create"
                        className="mt-6 inline-flex rounded-xl bg-[#0A3F61] px-6 py-3 text-white"
                    >
                        Create Client
                    </Link>
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <table className="min-w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Client</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr
                                        key={client.id}
                                        onClick={() => {
                                            window.location.href =
                                                `/dashboard/clients/${client.id}`;
                                        }}
                                        className="cursor-pointer border-t hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A3F61] font-semibold text-white">
                                                    {client.display_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{client.display_name}</p>
                                                    <p className="text-xs text-slate-500">{client.code ?? "-"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{client.company_name ?? "-"}</td>
                                        <td className="px-6 py-4">{client.phone ?? "-"}</td>
                                        <td className="px-6 py-4">{client.email ?? "-"}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${client.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls (Below Table) */}
                    <div className="mt-6 flex items-center justify-between">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border px-4 py-2 disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-500">
                            Page <strong>{pagination?.page ?? 1}</strong> of{" "}
                            <strong>{pagination?.totalPages ?? 1}</strong>
                        </span>
                        <button
                            disabled={page >= (pagination?.totalPages ?? 1)}
                            onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border px-4 py-2 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}