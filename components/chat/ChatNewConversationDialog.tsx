"use client";

import {
  MessageCircle,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ClientDto } from "@/types/api/client";

type ChatNewConversationDialogProps = {
  open: boolean;
  clients: ClientDto[];
  teamMembers: unknown[];
  onClose: () => void;
  onSelectClient: (client: ClientDto) => void;
  onSelectEmployee: (employee: unknown) => void;
};

function employeeName(employee: any) {
  return (
    employee?.display_name ||
    employee?.full_name ||
    employee?.name ||
    employee?.profile?.display_name ||
    employee?.profile?.full_name ||
    employee?.email ||
    "Employee"
  );
}

function employeeEmail(employee: any) {
  return (
    employee?.email ||
    employee?.profile?.email ||
    null
  );
}

function employeeActive(employee: any) {
  const status =
    employee?.status ||
    employee?.membership_status ||
    employee?.profile?.status;

  if (!status) return true;

  return [
    "active",
    "available",
    "online",
  ].includes(String(status).toLowerCase());
}

function clientHasApp(client: any) {
  const metadata =
    client?.metadata ?? {};

  return Boolean(
    metadata?.firebase_uid ||
    metadata?.profile_id ||
    client?.firebase_uid ||
    client?.profile_id,
  );
}

export default function ChatNewConversationDialog({
  open,
  clients,
  teamMembers,
  onClose,
  onSelectClient,
  onSelectEmployee,
}: ChatNewConversationDialogProps) {
  const [tab, setTab] = useState<
    "clients" | "employees"
  >("clients");

  const [search, setSearch] =
    useState("");

  const filteredClients = useMemo(() => {
    const q = search
      .trim()
      .toLowerCase();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        client.display_name,
        client.email,
        client.phone,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q),
        ),
    );
  }, [clients, search]);

  const activeEmployees = useMemo(() => {
    const q = search
      .trim()
      .toLowerCase();

    return (teamMembers as any[])
      .filter(employeeActive)
      .filter((employee) => {
        if (!q) return true;

        return [
          employeeName(employee),
          employeeEmail(employee),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(q),
          );
      });
  }, [teamMembers, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              New conversation
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Start a direct chat
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b">
          <button
            type="button"
            onClick={() => {
              setTab("clients");
              setSearch("");
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${
              tab === "clients"
                ? "border-b-2 border-[#0A3F61] text-[#0A3F61]"
                : "text-slate-500"
            }`}
          >
            <Users className="h-4 w-4" />
            Clients
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("employees");
              setSearch("");
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${
              tab === "employees"
                ? "border-b-2 border-[#0A3F61] text-[#0A3F61]"
                : "text-slate-500"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Employees
          </button>
        </div>

        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />

            <input
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                tab === "clients"
                  ? "Search clients..."
                  : "Search employees..."
              }
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {tab === "clients" ? (
            filteredClients.length ? (
              filteredClients.map((client) => {
                const hasApp =
                  clientHasApp(client);

                return (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A3F61]/10 text-sm font-semibold text-[#0A3F61]">
                      {(
                        client.display_name ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {client.display_name ||
                          "Client"}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {hasApp
                          ? "App connected"
                          : "App not connected"}
                      </p>
                    </div>

                    {hasApp ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectClient(client)
                        }
                        className="rounded-lg bg-[#0A3F61] px-3 py-2 text-xs font-medium text-white"
                      >
                        Message
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400"
                        title="Client invitation API will be connected next"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No clients found.
              </div>
            )
          ) : activeEmployees.length ? (
            activeEmployees.map((employee: any, index) => (
              <button
                key={
                  employee?.id ||
                  employee?.profile_id ||
                  employee?.profile?.id ||
                  index
                }
                type="button"
                onClick={() =>
                  onSelectEmployee(employee)
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {employeeName(employee)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {employeeName(employee)}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {employeeEmail(employee) ||
                      "Active employee"}
                  </p>
                </div>

                <UserPlus className="h-4 w-4 text-slate-400" />
              </button>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No active employees found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
