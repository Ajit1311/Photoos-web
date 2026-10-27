"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  KeyRound,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  getPlatformAdminRolesPermissions,
  type PlatformAdminRolePermission,
  type PlatformAdminRoleWithPermissions,
} from "@/lib/api/platform-admin";

function permissionGroups(
  permissions: PlatformAdminRolePermission[],
) {
  const groups = new Map<
    string,
    PlatformAdminRolePermission[]
  >();

  for (const permission of permissions) {
    const current = groups.get(permission.module) ?? [];
    current.push(permission);
    groups.set(permission.module, current);
  }

  return Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
}

function formatModule(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<
    PlatformAdminRoleWithPermissions[]
  >([]);
  const [permissions, setPermissions] = useState<
    PlatformAdminRolePermission[]
  >([]);
  const [selectedRoleId, setSelectedRoleId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getPlatformAdminRolesPermissions();

        if (!mounted) return;

        setRoles(result.roles);
        setPermissions(result.permissions);

        const superAdmin =
          result.roles.find(
            (role) => role.code === "super_admin",
          );

        setSelectedRoleId(
          superAdmin?.id ??
            result.roles[0]?.id ??
            null,
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load roles and permissions.",
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

  const selectedRole =
    roles.find(
      (role) => role.id === selectedRoleId,
    ) ?? null;

  const selectedPermissionCodes = useMemo(
    () =>
      new Set(
        selectedRole?.permissions.map(
          (permission) => permission.code,
        ) ?? [],
      ),
    [selectedRole],
  );

  const groupedPermissions = useMemo(
    () => permissionGroups(permissions),
    [permissions],
  );

  const rolePermissionCount =
    selectedRole?.permissions.length ?? 0;

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Administration / Roles & Permissions
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View platform roles and the permissions
            assigned to each role.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Total Roles"
            value={roles.length}
          />

          <SummaryCard
            icon={<KeyRound className="h-5 w-5" />}
            label="Total Permissions"
            value={permissions.length}
          />

          <SummaryCard
            icon={<Check className="h-5 w-5" />}
            label="Selected Role Permissions"
            value={rolePermissionCount}
          />
        </div>

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Admin Roles
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {roles.length} configured roles
                    </p>
                  </div>

                  <Users className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {roles.map((role) => {
                  const active =
                    role.id === selectedRoleId;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() =>
                        setSelectedRoleId(role.id)
                      }
                      className={`w-full px-5 py-4 text-left transition ${
                        active
                          ? "bg-slate-950 text-white"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div
                            className={`font-semibold ${
                              active
                                ? "text-white"
                                : "text-slate-900"
                            }`}
                          >
                            {role.name}
                          </div>

                          <div
                            className={`mt-1 truncate text-xs ${
                              active
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {role.code}
                          </div>
                        </div>

                        <div
                          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                            active
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {role.permissions.length}
                        </div>
                      </div>

                      <div
                        className={`mt-2 text-xs leading-5 ${
                          active
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {role.description ??
                          "No description available."}
                      </div>

                      {role.is_system && (
                        <div
                          className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            active
                              ? "bg-white/10 text-slate-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          System Role
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-950">
                        {selectedRole?.name ??
                          "Select Role"}
                      </h2>

                      {selectedRole?.code ===
                        "super_admin" && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          Protected
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedRole?.description ??
                        "Select a role to inspect its permissions."}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-medium text-slate-500">
                      Assigned Permissions
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-950">
                      {rolePermissionCount}{" "}
                      <span className="text-sm font-medium text-slate-400">
                        / {permissions.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRole?.code ===
                "super_admin" && (
                <div className="mx-5 mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:mx-6">
                  Super Admin has full platform access.
                  Permission changes for this protected
                  system role are intentionally disabled
                  here.
                </div>
              )}

              <div className="p-5 md:p-6">
                <div className="space-y-6">
                  {groupedPermissions.map(
                    ([module, modulePermissions]) => {
                      const assigned =
                        modulePermissions.filter(
                          (permission) =>
                            selectedPermissionCodes.has(
                              permission.code,
                            ),
                        ).length;

                      return (
                        <div
                          key={module}
                          className="overflow-hidden rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                            <div>
                              <div className="font-semibold text-slate-900">
                                {formatModule(module)}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">
                                {modulePermissions.length}{" "}
                                permissions
                              </div>
                            </div>

                            <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                              {assigned} /{" "}
                              {modulePermissions.length}
                            </div>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {modulePermissions.map(
                              (permission) => {
                                const hasPermission =
                                  selectedPermissionCodes.has(
                                    permission.code,
                                  );

                                return (
                                  <div
                                    key={
                                      permission.id
                                    }
                                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-medium text-slate-800">
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

                                    <div
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                        hasPermission
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {hasPermission && (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
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
