"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  KeyRound,
  Loader2,
  Search,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";

import {
  getPlatformAdminAccessControl,
  type PlatformAdminAccessControlEmployee,
} from "@/lib/api/platform-admin";

function formatModule(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name?: string | null) {
  return (name ?? "Admin")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AccessControlPage() {
  const [employees, setEmployees] = useState<
    PlatformAdminAccessControlEmployee[]
  >([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getPlatformAdminAccessControl();

        if (!mounted) return;

        setEmployees(result);

        if (result.length > 0) {
          setSelectedId(
            result[0].platform_admin_id,
          );
        }
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load access control.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) => {
      return (
        (employee.display_name ?? "")
          .toLowerCase()
          .includes(query) ||
        (employee.email ?? "")
          .toLowerCase()
          .includes(query) ||
        (employee.user_id ?? "")
          .toLowerCase()
          .includes(query) ||
        (employee.employee_code ?? "")
          .toLowerCase()
          .includes(query) ||
        employee.roles.some((role) =>
          role.name.toLowerCase().includes(query),
        )
      );
    });
  }, [employees, search]);

  const selectedEmployee =
    employees.find(
      (employee) =>
        employee.platform_admin_id === selectedId,
    ) ?? null;

  const permissionMap = useMemo(() => {
    const map = new Map<
      string,
      {
        code: string;
        name: string;
        module: string;
        roles: string[];
      }
    >();

    if (!selectedEmployee) return map;

    for (const role of selectedEmployee.roles) {
      for (const permission of role.permissions) {
        const existing = map.get(permission.code);

        if (existing) {
          existing.roles.push(role.name);
        } else {
          map.set(permission.code, {
            ...permission,
            roles: [role.name],
          });
        }
      }
    }

    return map;
  }, [selectedEmployee]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<
      string,
      typeof permissionMap extends Map<
        string,
        infer V
      >
        ? V[]
        : never
    >();

    for (const permission of permissionMap.values()) {
      const current =
        groups.get(permission.module) ?? [];

      current.push(permission);
      groups.set(permission.module, current);
    }

    return Array.from(groups.entries()).sort(
      ([a], [b]) => a.localeCompare(b),
    );
  }, [permissionMap]);

  const totalPermissions = permissionMap.size;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "active",
  ).length;

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <KeyRound className="h-4 w-4" />
            Administration / Access Control
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Access Control
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Inspect effective platform access for every
            admin employee.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric
            label="Admin Employees"
            value={employees.length}
            icon={<UserCog className="h-5 w-5" />}
          />

          <Metric
            label="Active Employees"
            value={activeEmployees}
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
          />

          <Metric
            label="Selected Effective Access"
            value={totalPermissions}
            icon={<KeyRound className="h-5 w-5" />}
          />
        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search employee..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredEmployees.map(
                  (employee) => {
                    const active =
                      employee.platform_admin_id ===
                      selectedId;

                    return (
                      <button
                        key={
                          employee.platform_admin_id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedId(
                            employee.platform_admin_id,
                          )
                        }
                        className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                          active
                            ? "bg-slate-950 text-white"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            active
                              ? "bg-white/10 text-white"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {getInitials(
                            employee.display_name ??
                              employee.email ??
                              employee.user_id,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-sm font-semibold ${
                              active
                                ? "text-white"
                                : "text-slate-900"
                            }`}
                          >
                            {employee.display_name ??
                              employee.user_id ??
                              "Admin"}
                          </div>

                          <div
                            className={`mt-0.5 truncate text-xs ${
                              active
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {employee.roles
                              .map(
                                (role) =>
                                  role.name,
                              )
                              .join(", ") ||
                              "No role"}
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 ${
                            active
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        />
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {selectedEmployee ? (
                <>
                  <div className="border-b border-slate-200 p-5 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                          {getInitials(
                            selectedEmployee.display_name ??
                              selectedEmployee.email ??
                              selectedEmployee.user_id,
                          )}
                        </div>

                        <div>
                          <h2 className="text-xl font-bold text-slate-950">
                            {selectedEmployee.display_name ??
                              selectedEmployee.user_id ??
                              "Admin"}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">
                              {selectedEmployee.user_id ??
                                "No User ID"}
                            </span>

                            <span>•</span>

                            <span>
                              {selectedEmployee.email ??
                                "No email"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          selectedEmployee.status ===
                          "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {selectedEmployee.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-3 md:p-6">
                    <Info
                      label="Role"
                      value={
                        selectedEmployee.roles
                          .map((role) => role.name)
                          .join(", ") ||
                        "No role"
                      }
                    />

                    <Info
                      label="Effective Permissions"
                      value={String(
                        totalPermissions,
                      )}
                    />

                    <Info
                      label="Last Login"
                      value={
                        selectedEmployee.last_login_at
                          ? new Date(
                              selectedEmployee.last_login_at,
                            ).toLocaleString("en-IN")
                          : "Never"
                      }
                    />
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          Effective Permissions
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Permissions inherited from the
                          employee's assigned role(s).
                        </p>
                      </div>

                      <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        {totalPermissions} granted
                      </div>
                    </div>

                    {groupedPermissions.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                        No permissions assigned.
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {groupedPermissions.map(
                          ([
                            module,
                            modulePermissions,
                          ]) => (
                            <div
                              key={module}
                              className="overflow-hidden rounded-xl border border-slate-200"
                            >
                              <div className="bg-slate-50 px-4 py-3">
                                <div className="font-semibold text-slate-900">
                                  {formatModule(
                                    module,
                                  )}
                                </div>

                                <div className="mt-0.5 text-xs text-slate-500">
                                  {
                                    modulePermissions.length
                                  }{" "}
                                  granted
                                </div>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {modulePermissions.map(
                                  (permission) => (
                                    <div
                                      key={
                                        permission.code
                                      }
                                      className="flex items-center gap-3 px-4 py-3"
                                    >
                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <Check className="h-4 w-4" />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-slate-800">
                                          {
                                            permission.name
                                          }
                                        </div>

                                        <div className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                                          {
                                            permission.code
                                          }
                                        </div>
                                      </div>

                                      <div className="hidden text-right text-[11px] text-slate-400 sm:block">
                                        Via{" "}
                                        {permission.roles.join(
                                          ", ",
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[500px] items-center justify-center text-sm text-slate-500">
                  <div className="text-center">
                    <KeyRound className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    Select an employee.
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>

        <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
          {icon}
        </span>
      </div>

      <div className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}
