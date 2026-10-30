"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserCog,
  UserX,
  X,
} from "lucide-react";

import {
  createPlatformAdminEmployee,
  deletePlatformAdminEmployee,
  getPlatformAdminEmployees,
  getPlatformAdminRolesPermissions,
  setPlatformAdminEmployeeRole,
  setPlatformAdminEmployeeStatus,
  sendPlatformAdminEmployeeInvite,
  type PlatformAdminEmployee,
  type PlatformAdminRoleWithPermissions,
} from "@/lib/api/platform-admin";

type Credentials = {
  platform_admin_id: string;
  user_id: string;
  temporary_password: string;
  email?: string;
  display_name?: string;
  role_code?: string;
};

const STATUS_OPTIONS = ["all", "active", "inactive"];

function formatDate(value: string | null): string {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function getInitials(name?: string | null): string {
  return (name ?? "Admin")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<
    PlatformAdminEmployee[]
  >([]);

  const [roles, setRoles] = useState<
    PlatformAdminRoleWithPermissions[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [roleFilter, setRoleFilter] =
    useState("all");

  const [showCreate, setShowCreate] =
    useState(false);

  const [displayName, setDisplayName] =
    useState("");
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] =
    useState("support");

  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] =
    useState<Credentials | null>(null);

  const [sendingInvite, setSendingInvite] =
    useState(false);
  const [inviteSent, setInviteSent] =
    useState(false);
  const [inviteError, setInviteError] =
    useState<string | null>(null);

  async function handleSendInvite() {
    if (!credentials) return;

    try {
      setSendingInvite(true);
      setInviteSent(false);
      setInviteError(null);

      await sendPlatformAdminEmployeeInvite(
        credentials.platform_admin_id,
        credentials.temporary_password,
        {
          email: credentials.email || credentials.user_id,
          display_name: credentials.display_name,
          role_code: credentials.role_code,
        },
      );

      setInviteSent(true);
    } catch (err) {
      setInviteError(
        err instanceof Error
          ? err.message
          : "Unable to send credentials.",
      );
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleDeleteEmployee(
    employee: PlatformAdminEmployee,
  ) {
    const confirmed = window.confirm(
      `Delete ${employee.display_name ?? employee.user_id ?? "this employee"} permanently? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(employee.platform_admin_id);
      setError(null);

      await deletePlatformAdminEmployee(
        employee.platform_admin_id,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete employee.",
      );
    } finally {
      setDeleteLoading(null);
    }
  }

  async function loadData() {
    try {
      setError(null);

      const [employeeData, roleData] =
        await Promise.all([
          getPlatformAdminEmployees(),
          getPlatformAdminRolesPermissions(),
        ]);

      setEmployees(employeeData);
      setRoles(roleData.roles);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load employees.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const availableRoles = useMemo(
    () =>
      roles.filter(
        (role) =>
          role.status === "active" &&
          role.code !== "super_admin",
      ),
    [roles],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.display_name
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
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        employee.status === statusFilter;

      const employeeRole =
        employee.roles?.[0]?.code ?? "";

      const matchesRole =
        roleFilter === "all" ||
        employeeRole === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    employees,
    search,
    statusFilter,
    roleFilter,
  ]);

  async function handleCreateEmployee(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!displayName.trim() || !email.trim()) {
      setError(
        "Employee name and email are required.",
      );
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const result =
        await createPlatformAdminEmployee(
          displayName,
          email,
          roleCode,
        );

      setCredentials({
        platform_admin_id:
          result.employee.platform_admin_id,
        user_id: result.credentials.user_id,
        temporary_password:
          result.credentials.temporary_password,
        email: email.trim().toLowerCase(),
        display_name: displayName.trim(),
        role_code: roleCode,
      });
      setDisplayName("");
      setEmail("");
      setRoleCode(availableRoles[0]?.code || "admin");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create employee.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(
    employee: PlatformAdminEmployee,
    nextRole: string,
  ) {
    if (
      !nextRole ||
      nextRole === employee.roles?.[0]?.code
    ) {
      return;
    }

    try {
      setActionLoading(
        `role:${employee.platform_admin_id}`,
      );
      setError(null);

      await setPlatformAdminEmployeeRole(
        employee.platform_admin_id,
        nextRole,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update employee role.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStatusToggle(
    employee: PlatformAdminEmployee,
  ) {
    const nextStatus =
      employee.status === "active"
        ? "inactive"
        : "active";

    try {
      setActionLoading(
        `status:${employee.platform_admin_id}`,
      );
      setError(null);

      await setPlatformAdminEmployeeStatus(
        employee.platform_admin_id,
        nextStatus,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update employee status.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function copyCredential(
    value: string,
  ) {
    await navigator.clipboard.writeText(value);
  }

  const activeCount = employees.filter(
    (employee) => employee.status === "active",
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "inactive",
  ).length;

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <UserCog className="h-4 w-4" />
              Administration / Employees
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Admin Employees
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage platform employees, roles,
              access and account status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setCredentials(null);
              setShowCreate(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Employee
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <UserX className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Employees"
            value={employees.length}
            icon={<UserCog className="h-5 w-5" />}
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />
          <StatCard
            label="Inactive"
            value={inactiveCount}
            icon={<UserX className="h-5 w-5" />}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1 xl:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee, email, User ID..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                labels={{
                  all: "All Status",
                  active: "Active",
                  inactive: "Inactive",
                }}
              />

              <FilterSelect
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  "all",
                  ...availableRoles.map(
                    (role) => role.code,
                  ),
                ]}
                labels={{
                  all: "All Roles",
                  ...Object.fromEntries(
                    availableRoles.map(
                      (role) => [
                        role.code,
                        role.name,
                      ],
                    ),
                  ),
                }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-4">
                <UserCog className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900">
                No employees found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">
                      Employee
                    </th>
                    <th className="px-5 py-3">
                      User ID
                    </th>
                    <th className="px-5 py-3">
                      Role
                    </th>
                    <th className="px-5 py-3">
                      Status
                    </th>
                    <th className="px-5 py-3">
                      Last Login
                    </th>
                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(
                    (employee) => {
                      const currentRole =
                        employee.roles?.[0]
                          ?.code ?? "";

                      const roleBusy =
                        actionLoading ===
                        `role:${employee.platform_admin_id}`;

                      const statusBusy =
                        actionLoading ===
                        `status:${employee.platform_admin_id}`;

                      return (
                        <tr
                          key={employee.platform_admin_id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                                {getInitials(
                                  employee.display_name ??
                                    employee.email ??
                                    employee.user_id ??
                                    "Admin",
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="truncate font-semibold text-slate-900">
                                  {
                                    employee.display_name
                                  }
                                </div>
                                <div className="truncate text-xs text-slate-500">
                                  {employee.email ??
                                    "No email"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-mono text-sm font-semibold text-slate-800">
                              {employee.user_id ??
                                "—"}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-400">
                              {employee.employee_code ??
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="relative w-44">
                              <select
                                value={currentRole}
                                disabled={
                                  roleBusy
                                }
                                onChange={(event) =>
                                  void handleRoleChange(
                                    employee,
                                    event.target
                                      .value,
                                  )
                                }
                                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 disabled:opacity-50"
                              >
                                {availableRoles.map(
                                  (role) => (
                                    <option
                                      key={
                                        role.code
                                      }
                                      value={
                                        role.code
                                      }
                                    >
                                      {role.name}
                                    </option>
                                  ),
                                )}
                              </select>

                              {roleBusy ? (
                                <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                              ) : (
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                employee.status ===
                                "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  employee.status ===
                                  "active"
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />
                              {employee.status ===
                              "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(
                              employee.last_login_at,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={
                                  statusBusy ||
                                  deleteLoading ===
                                    employee.platform_admin_id
                                }
                                onClick={() =>
                                  void handleStatusToggle(
                                    employee,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                              >
                                {statusBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : employee.status ===
                                  "active" ? (
                                  <UserX className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}

                                {employee.status ===
                                "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deleteLoading ===
                                  employee.platform_admin_id
                                }
                                onClick={() =>
                                  void handleDeleteEmployee(
                                    employee,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                {deleteLoading ===
                                employee.platform_admin_id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredEmployees.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {employees.length}
            </span>{" "}
            employees
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Create Admin Employee
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  A User ID and temporary password
                  will be generated automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {credentials ? (
              <div className="space-y-5 p-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                    Employee created successfully
                  </div>

                  <p className="mt-1 text-sm text-emerald-700">
                    Welcome email with login credentials and admin link has been dispatched automatically from <strong>team@photoos.in</strong>. The employee must change their temporary password upon first login.
                  </p>
                </div>

                <CredentialRow
                  label="User ID"
                  value={credentials.user_id}
                  onCopy={() =>
                    void copyCredential(
                      credentials.user_id,
                    )
                  }
                />

                <CredentialRow
                  label="Temporary Password"
                  value={credentials.temporary_password}
                  onCopy={() =>
                    void copyCredential(
                      credentials.temporary_password,
                    )
                  }
                />

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <strong>Security:</strong> This
                  temporary password is shown only
                  once in this session. Send it
                  securely to the employee.
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleSendInvite}
                    disabled={sendingInvite}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sendingInvite ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Credentials via team@photoos.in...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Resend Credentials via team@photoos.in
                      </>
                    )}
                  </button>

                  {inviteSent && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                      Credentials email sent successfully via team@photoos.in.
                    </div>
                  )}

                  {inviteError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
                      {inviteError}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCredentials(null);
                    setShowCreate(false);
                  }}
                  className="h-11 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleCreateEmployee}
                className="space-y-5 p-6"
              >
                <Field
                  label="Employee Name"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder="e.g. Rahul Sharma"
                />

                <Field
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="employee@company.com"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Admin Role
                  </label>

                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <select
                      value={roleCode}
                      onChange={(event) =>
                        setRoleCode(
                          event.target.value,
                        )
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 pr-9 text-sm outline-none focus:border-slate-400"
                    >
                      {availableRoles.map(
                        (role) => (
                          <option
                            key={role.code}
                            value={role.code}
                          >
                            {role.name}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                  The system generates the Admin
                  User ID and temporary password.
                  The account starts with{" "}
                  <strong>must change password</strong>{" "}
                  enabled.
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Employee...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Employee
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
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
        <div className="text-sm font-medium text-slate-500">
          {label}
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  labels,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels: Record<string, string>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
      />
    </div>
  );
}

function CredentialRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <code className="min-w-0 flex-1 truncate px-2 font-mono text-sm font-semibold text-slate-800">
          {value}
        </code>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
    </div>
  );
}
