"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useClient } from "@/hooks/useClient";
import { useBootstrapContext } from "@/context/BootstrapContext";
import { clientsRepository } from "@/lib/repositories/clients.repository";

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
    data: bootstrap,
  } = useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.studio?.id;

  const {
    data: client,
    isPending,
    error,
  } = useClient(clientId);

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
      client.display_name,
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

    if (!studioId) {
      return;
    }

    try {

      setSaving(true);

      await clientsRepository.update(

        studioId,

        clientId,

        {

          name: displayName,

          company_name:
            companyName || undefined,

          email:
            email || undefined,

          phone:
            phone || undefined,

          notes:
            notes || undefined,

        },

      );

      toast.success(
        "Client updated successfully",
      );

      router.push(
        `/dashboard/clients/${clientId}`,
      );

    } catch (err) {

      console.error(err);

      toast.error(
        "Unable to update client.",
      );

    } finally {

      setSaving(false);

    }

  }

  if (isPending) {

    return (
      <main className="mx-auto max-w-5xl p-8">
        Loading...
      </main>
    );

  }

  if (error || !client) {

    return (
      <main className="mx-auto max-w-5xl p-8">
        Unable to load client.
      </main>
    );

  }

  return (

    <main className="mx-auto max-w-5xl space-y-8 p-8">

      <div>

        <Link
          href={`/dashboard/clients/${clientId}`}
          className="mb-4 inline-flex text-sm text-slate-500"
        >

          ← Back

        </Link>

        <h1 className="text-3xl font-bold">

          Edit Client

        </h1>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm"
      >

        <div>

          <label className="mb-2 block">

            Client Name

          </label>

          <input
            required
            value={displayName}
            onChange={(e) =>
              setDisplayName(
                e.target.value,
              )
            }
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block">

            Company

          </label>

          <input
            value={companyName}
            onChange={(e) =>
              setCompanyName(
                e.target.value,
              )
            }
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block">

              Phone

            </label>

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value,
                )
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

          <div>

            <label className="mb-2 block">

              Email

            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
              className="w-full rounded-xl border p-3"
            />

          </div>

        </div>

        <div>

          <label className="mb-2 block">

            Notes

          </label>

          <textarea
            rows={5}
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value,
              )
            }
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div className="flex justify-end gap-4">

          <Link
            href={`/dashboard/clients/${clientId}`}
            className="rounded-xl border px-5 py-3"
          >

            Cancel

          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#0A3F61] px-6 py-3 text-white"
          >

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </form>

    </main>

  );

}