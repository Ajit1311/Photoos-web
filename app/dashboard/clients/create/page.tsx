"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useBootstrapContext } from "@/context/BootstrapContext";
import { clientsRepository } from "@/lib/repositories/clients.repository";

export default function CreateClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: bootstrap } = useBootstrapContext();
  const studioId = bootstrap?.workspace?.studio?.id;

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // अपडेटेड mutation ब्लॉक toast notifications सह
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!studioId) {
        throw new Error("Studio not found.");
      }

      return clientsRepository.create(studioId, {
        name,
        company_name: companyName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
      });
    },

    onSuccess: async () => {
      // Success toast मेसेज दाखवा
      toast.success("Client created successfully", {
        description: "The client has been added to your studio.",
      });

      // Clients ची query cache मधून इनव्हॅलिडेट करा
      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      // 1.2 सेकंदांनंतर redirect करा जेणेकरून युझरला toast मेसेज नीट वाचता येईल
      setTimeout(() => {
        router.push("/dashboard/clients");
      }, 1200);
    },

    onError: (error: any) => {
      // Error toast मेसेज दाखवा
      toast.error(
        error?.context?.error?.message ?? "Unable to create client."
      );
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createMutation.mutateAsync();
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Client</h1>
        <p className="mt-2 text-slate-500">Add a new client.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Client Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Company Name</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-[#0A3F61] px-6 py-3 text-white disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Client"}
          </button>
        </div>
      </form>
    </main>
  );
}