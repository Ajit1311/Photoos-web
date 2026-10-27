"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Edit3,
    Mail,
    MapPin,
    Phone,
    UserRound,
} from "lucide-react";
import { use } from "react";

import { useClient } from "@/hooks/useClient";
import { useStudioId } from "@/hooks/useStudioId";
import { ClientStudioConnectQr } from "@/components/clients/ClientStudioConnectQr";

type Props = {
    params: Promise<{
        clientId: string;
    }>;
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string | null | undefined) {
    const value = name?.trim();

    if (!value) {
        return "C";
    }

    const parts = value.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

export default function ClientDetailsPage({
    params,
}: Props) {
    const { clientId } = use(params);

    const {
        data: client,
        isPending,
        error,
        refetch,
    } = useClient(clientId);

    const { studioId } = useStudioId();

    if (isPending) {
        return (
            <main className="mx-auto max-w-7xl p-8">
                <div className="rounded-2xl border bg-white p-10 shadow-sm">
                    <div className="animate-pulse space-y-4">
                        <div className="h-5 w-32 rounded bg-slate-200" />
                        <div className="h-10 w-72 rounded bg-slate-200" />
                        <div className="h-4 w-48 rounded bg-slate-200" />
                    </div>
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

                    <p className="mt-3 text-sm text-red-600">
                        {error?.message ?? "Client was not found."}
                    </p>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                void refetch();
                            }}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white"
                        >
                            Retry
                        </button>

                        <Link
                            href="/dashboard/clients"
                            className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700"
                        >
                            Back to Clients
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const displayName =
        client.display_name?.trim() || "Unnamed Client";

    const initials = getInitials(client.display_name);

    const fullAddress = [
        client.address,
        client.city,
        client.state,
        client.country,
        client.postal_code,
    ]
        .filter(Boolean)
        .join(", ");

    const isActive =
        client.status?.toLowerCase() === "active";

    return (
        <main className="mx-auto max-w-7xl space-y-8 p-8">

            {/* ------------------------------------------------------------ */}
            {/* HEADER */}
            {/* ------------------------------------------------------------ */}

            <section className="rounded-3xl border bg-white p-7 shadow-sm">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-start gap-5">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0A3F61] text-xl font-semibold text-white">
                            {initials}
                        </div>

                        <div>

                            <Link
                                href="/dashboard/clients"
                                className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#0A3F61]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Clients
                            </Link>

                            <div className="flex flex-wrap items-center gap-3">

                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    {displayName}
                                </h1>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {client.status || "unknown"}
                                </span>

                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

                                <span className="inline-flex items-center gap-2">
                                    <span className="font-medium text-slate-700">
                                        {client.code ?? "-"}
                                    </span>
                                </span>

                                {client.company_name && (
                                    <span className="inline-flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        {client.company_name}
                                    </span>
                                )}

                                {client.email && (
                                    <span className="inline-flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {client.email}
                                    </span>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="flex flex-wrap gap-3">

                        <ClientStudioConnectQr
                            studioId={studioId}
                            clientId={clientId}
                        />

                        <Link
                            href={`/dashboard/clients/${clientId}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit Client
                        </Link>

                    </div>

                </div>

            </section>


            {/* ------------------------------------------------------------ */}
            {/* QUICK CONTACT */}
            {/* ------------------------------------------------------------ */}

            <section className="grid gap-5 md:grid-cols-3">

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                            <Phone className="h-5 w-5 text-[#0A3F61]" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Phone
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {client.phone ?? "-"}
                            </p>
                        </div>

                    </div>

                </div>


                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                            <Mail className="h-5 w-5 text-[#0A3F61]" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Email
                            </p>

                            <p className="mt-1 truncate font-medium text-slate-900">
                                {client.email ?? "-"}
                            </p>
                        </div>

                    </div>

                </div>


                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                            <CalendarDays className="h-5 w-5 text-[#0A3F61]" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Client Since
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {formatDate(client.created_at)}
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* ------------------------------------------------------------ */}
            {/* MAIN INFORMATION */}
            {/* ------------------------------------------------------------ */}

            <section className="grid gap-6 lg:grid-cols-3">

                {/* BASIC INFORMATION */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <div className="mb-6 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <UserRound className="h-5 w-5 text-[#0A3F61]" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">
                                Client Information
                            </h2>

                            <p className="text-sm text-slate-500">
                                Basic client details
                            </p>
                        </div>

                    </div>

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
                                First Name
                            </p>

                            <p className="mt-1">
                                {client.first_name ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Last Name
                            </p>

                            <p className="mt-1">
                                {client.last_name ?? "-"}
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
                                Lead Source
                            </p>

                            <p className="mt-1">
                                {client.lead_source ?? "-"}
                            </p>
                        </div>

                    </div>

                </div>


                {/* CONTACT / ADDRESS */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <div className="mb-6 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <MapPin className="h-5 w-5 text-[#0A3F61]" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">
                                Contact & Address
                            </h2>

                            <p className="text-sm text-slate-500">
                                Contact information
                            </p>
                        </div>

                    </div>

                    <div className="space-y-5">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Primary Phone
                            </p>

                            <p className="mt-1">
                                {client.phone ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Alternate Phone
                            </p>

                            <p className="mt-1">
                                {client.alternate_phone ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Email
                            </p>

                            <p className="mt-1 break-all">
                                {client.email ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Address
                            </p>

                            <p className="mt-1 leading-6">
                                {fullAddress || "-"}
                            </p>
                        </div>

                    </div>

                </div>


                {/* ACCOUNT INFO */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <h2 className="mb-6 text-lg font-semibold">
                        Account Information
                    </h2>

                    <div className="space-y-5">

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Status
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                            >
                                {client.status || "unknown"}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Created
                            </p>

                            <p className="mt-1">
                                {formatDate(client.created_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Last Updated
                            </p>

                            <p className="mt-1">
                                {formatDate(client.updated_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Assigned To
                            </p>

                            <p className="mt-1 break-all">
                                {client.assigned_to ?? "-"}
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* ------------------------------------------------------------ */}
            {/* NOTES */}
            {/* ------------------------------------------------------------ */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold">
                    Notes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Internal notes associated with this client
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 p-5">

                    {client.notes ? (
                        <p className="whitespace-pre-wrap leading-7 text-slate-700">
                            {client.notes}
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500">
                            No notes available.
                        </p>
                    )}

                </div>

            </section>


           {/* ------------------------------------------------------------ */}
{/* PROJECTS */}
{/* ------------------------------------------------------------ */}

<section className="rounded-2xl border bg-white p-6 shadow-sm">

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

            <div className="flex items-center gap-3">

                <h2 className="text-lg font-semibold">
                    Projects
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {client.projects?.length ?? 0}
                </span>

            </div>

            <p className="mt-1 text-sm text-slate-500">
                Projects associated with this client
            </p>

        </div>

        <Link
            href={`/dashboard/projects/create?clientId=${client.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
            New Project
        </Link>

    </div>


    <div className="mt-6">

        {!client.projects ||
        client.projects.length === 0 ? (

            <div className="rounded-xl border border-dashed p-8 text-center">

                <p className="font-medium text-slate-700">
                    No projects yet
                </p>

                <p className="mt-2 text-sm text-slate-500">
                    This client does not have any projects yet.
                </p>

            </div>

        ) : (

            <div className="overflow-hidden rounded-xl border">

                <div className="divide-y">

                    {client.projects.map(
                        (project) => {

                            const status =
                                project.status
                                    ?.toLowerCase() ??
                                "unknown";

                            return (

                                <Link
                                    key={project.id}
                                    href={`/dashboard/projects/${project.id}`}
                                    className="block transition hover:bg-slate-50"
                                >

                                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h3 className="truncate font-semibold text-slate-900">
                                                    {project.title}
                                                </h3>

                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                                                    {status}
                                                </span>

                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">

                                                {project.code && (
                                                    <span>
                                                        {project.code}
                                                    </span>
                                                )}

                                                {project.event_type && (
                                                    <span>
                                                        {project.event_type}
                                                    </span>
                                                )}

                                                <span>
                                                    Created{" "}
                                                    {formatDate(
                                                        project.created_at,
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="shrink-0 text-left sm:text-right">

                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Budget
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-900">
                                                ₹{" "}
                                                {Number(
                                                    project.budget ?? 0,
                                                ).toLocaleString(
                                                    "en-IN",
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </Link>

                            );

                        },
                    )}

                </div>

            </div>

        )}

    </div>

</section>


            {/* ------------------------------------------------------------ */}
            {/* CHAT PLACEHOLDER */}
            {/* ------------------------------------------------------------ */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold">
                            Client Chat
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            WhatsApp-style conversation with this client
                        </p>
                    </div>

                </div>

                <div className="mt-6 rounded-xl border border-dashed p-8 text-center">

                    <p className="font-medium text-slate-700">
                        Chat module coming next
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        This will connect with the shared client chat system and sidebar
                        conversation list we planned.
                    </p>

                </div>

            </section>

        </main>
    );
}