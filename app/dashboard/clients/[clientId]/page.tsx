"use client";

import Link from "next/link";
import { use } from "react";

import { useClient } from "@/hooks/useClient";

type Props = {
    params: Promise<{
        clientId: string;
    }>;
};

export default function ClientDetailsPage({
    params,
}: Props) {

    const {
        clientId,
    } = use(params);

    const {
        data: client,
        isPending,
        error,
    } = useClient(clientId);

    if (isPending) {

        return (

            <main className="mx-auto max-w-7xl p-8">

                <div className="rounded-2xl border bg-white p-10">

                    <p className="text-slate-500">

                        Loading client...

                    </p>

                </div>

            </main>

        );

    }

    if (error || !client) {

        return (

            <main className="mx-auto max-w-7xl p-8">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

                    <h2 className="text-xl font-semibold text-red-700">

                        Unable to load client

                    </h2>

                    <p className="mt-3 text-red-600">

                        {error?.message}

                    </p>

                </div>

            </main>

        );

    }

    return (

        <main className="mx-auto max-w-7xl space-y-8 p-8">

            <div className="flex items-center justify-between">

                <div>

                    <Link
                        href="/dashboard/clients"
                        className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-700"
                    >

                        ← Back to Clients

                    </Link>

                    <h1 className="text-3xl font-bold">

                        {client.display_name}

                    </h1>

                    <p className="mt-2 text-slate-500">

                        {client.company_name ?? "Individual Client"}

                    </p>

                </div>

                <div className="flex gap-3">

                    <Link
                        href={`/dashboard/clients/${client.id}/edit`}
                        className="rounded-xl border px-5 py-3"
                    >

                        Edit

                    </Link>

                    <button className="rounded-xl bg-red-600 px-5 py-3 text-white">

                        Delete

                    </button>

                </div>

            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <h2 className="mb-6 text-lg font-semibold">

                        Client Information

                    </h2>

                    <div className="space-y-5">

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">

                                Client Code

                            </p>

                            <p className="mt-1 font-medium">

                                {client.code ?? "-"}

                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">

                                Company

                            </p>

                            <p className="mt-1">

                                {client.company_name ?? "-"}

                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">

                                Email

                            </p>

                            <p className="mt-1">

                                {client.email ?? "-"}

                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">

                                Phone

                            </p>

                            <p className="mt-1">

                                {client.phone ?? "-"}

                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">

                                Status

                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${client.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                            >

                                {client.status}

                            </span>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">

                                Created

                            </p>

                            <p className="mt-1">

                                {new Date(
                                    client.created_at,
                                ).toLocaleDateString()}

                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <h2 className="mb-6 text-lg font-semibold">

                        Notes

                    </h2>

                    {client.notes ? (

                        <p className="whitespace-pre-wrap text-slate-700">

                            {client.notes}

                        </p>

                    ) : (

                        <p className="text-slate-500">

                            No notes available.

                        </p>

                    )}

                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <h2 className="mb-6 text-lg font-semibold">

                        Projects

                    </h2>

                    <p className="text-slate-500">

                        Client projects will appear here in the next module.

                    </p>

                </div>

            </div>

        </main>

    );

}