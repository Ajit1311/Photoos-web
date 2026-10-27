"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useClient } from "@/hooks/useClient";
import { useUpdateClient } from "@/hooks/mutations/clients/useUpdateClient";

type Props = {
  params: Promise<{
    clientId: string;
  }>;
};

export default function EditClientPage({
  params,
}: Props) {
  const router = useRouter();

  const { clientId } = use(params);

  const {
    data: client,
    isPending,
    error,
  } = useClient(clientId);

  const updateMutation =
    useUpdateClient();

  const [displayName, setDisplayName] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!client) {
      return;
    }

    setDisplayName(
      client.display_name ?? "",
    );

    setCompanyName(
      client.company_name ?? "",
    );

    setEmail(
      client.email ?? "",
    );

    setPhone(
      client.phone ?? "",
    );

    setNotes(
      client.notes ?? "",
    );
  }, [client]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!client) {
      return;
    }

    const trimmedDisplayName =
      displayName.trim();

    if (!trimmedDisplayName) {
      toast.error(
        "Client name is required.",
      );

      return;
    }

    try {
      setSaving(true);

      await updateMutation.mutateAsync({
        clientId: client.id,

        payload: {
          display_name:
            trimmedDisplayName,

          company_name:
            companyName.trim() || undefined,

          phone:
            phone.trim() || undefined,

          email:
            email.trim() || undefined,

          notes:
            notes.trim() || undefined,
        },
      });

      toast.success(
        "Client updated successfully.",
      );

      router.push(
        `/dashboard/clients/${clientId}`,
      );
    } catch (err) {
      console.error(
        "Failed to update client:",
        err,
      );

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to update client.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-slate-500">
            Loading client...
          </p>
        </div>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-lg font-semibold text-red-700">
            Unable to load client
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "Client not found."}
          </p>

          <Link
            href="/dashboard/clients"
            className="mt-6 inline-flex rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-medium text-white"
          >
            Back to Clients
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8">
      <div>
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="mb-4 inline-flex text-sm text-slate-500 transition hover:text-[#0A3F61]"
        >
          ← Back to Client
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">
          Edit Client
        </h1>

        <p className="mt-2 text-slate-500">
          Update client information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label
            htmlFor="display_name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Client Name
          </label>

          <input
            id="display_name"
            type="text"
            required
            value={displayName}
            onChange={(e) =>
              setDisplayName(
                e.target.value,
              )
            }
            className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
          />
        </div>

        <div>
          <label
            htmlFor="company_name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Company
          </label>

          <input
            id="company_name"
            type="text"
            value={companyName}
            onChange={(e) =>
              setCompanyName(
                e.target.value,
              )
            }
            className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <textarea
            id="notes"
            rows={5}
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value,
              )
            }
            className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
          />
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <Link
            href={`/dashboard/clients/${clientId}`}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              saving ||
              updateMutation.isPending
            }
            className="rounded-xl bg-[#0A3F61] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ||
            updateMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}