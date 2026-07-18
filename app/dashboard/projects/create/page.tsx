"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClientsContext } from "@/context/ClientsContext";
import { useBootstrapContext } from "@/context/BootstrapContext";
import { projectsRepository } from "@/lib/repositories/projects.repository";

export default function CreateProjectPage() {
  // Existing States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budget, setBudget] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Added Hooks & Context States
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: bootstrap } = useBootstrapContext();
  const studioId = bootstrap?.workspace?.studio?.id;

  const { clients, loading: clientsLoading } = useClientsContext();
  const [clientId, setClientId] = useState("");

  // Mutation with Updated onSuccess and Added onError
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      if (!studioId) {
        throw new Error("Studio not found.");
      }

      return projectsRepository.create(studioId, {
        title,
        description: description || null,
        event_type: eventType || null,
        event_date: eventDate || null,
        client_id: clientId,
        project_manager_id: null,
        budget: Number(budget),
        advance_amount: Number(advanceAmount),
        notes: notes || null,
        metadata: null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      router.push("/dashboard/projects");
    },
    onError: (error) => {
      console.error(error);
      alert(error.message);
    },
  });

  // Replaced handleSubmit function
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createProjectMutation.mutateAsync();
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Project</h1>
        <p className="mt-2 text-slate-500">Create a new studio project.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Project Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Event Type</label>
            <input
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>
        </div>

        {/* Client Dropdown Section */}
        <div>
          <label className="mb-2 block text-sm font-medium">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            disabled={clientsLoading}
            className="w-full rounded-xl border p-3"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.display_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Budget</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Advance Amount
            </label>
            <input
              type="number"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Notes</label>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createProjectMutation.isPending}
            className="rounded-xl bg-[#0A3F61] px-6 py-3 text-white disabled:opacity-50"
          >
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </main>
  );
}