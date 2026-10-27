"use client";

import {
  useState,
} from "react";

import type {
  TeamMember,
} from "@/types/team-member";

import {
  supabase,
} from "@/lib/supabase/client";


type TeamMembersTableProps = {
  members: TeamMember[];

  loading: boolean;

  onMemberRemoved?: () => void | Promise<void>;
};


function getInitials(
  member: TeamMember,
) {
  const value =
    member.email?.trim() ||
    member.employeeCode ||
    "TM";

  return value
    .slice(0, 2)
    .toUpperCase();
}


function getMemberLabel(
  member: TeamMember,
) {
  return (
    member.email ||
    member.employeeCode ||
    "Team Member"
  );
}


export function TeamMembersTable({
  members,
  loading,
  onMemberRemoved,
}: TeamMembersTableProps) {
  const [
    removingMemberId,
    setRemovingMemberId,
  ] =
    useState<string | null>(
      null,
    );


  async function handleRemoveMember(
    member: TeamMember,
  ) {
    if (
      member.roleCode ===
      "studio_owner"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${getMemberLabel(
          member,
        )} from this studio team?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(
        member.id,
      );

      const {
        error,
      } =
        await supabase.rpc(
          "remove_studio_team_member",
          {
            p_member_id:
              member.id,
          },
        );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      if (onMemberRemoved) {
        await onMemberRemoved();
      }
    } catch (caughtError) {
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to remove team member.",
      );
    } finally {
      setRemovingMemberId(
        null,
      );
    }
  }


  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          Loading team members...
        </div>
      </div>
    );
  }


  if (members.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex min-h-64 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          No team members found.
        </div>
      </div>
    );
  }


  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[900px]">

          <thead className="border-b border-border bg-muted/30">

            <tr>

              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Team Member
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Employee Code
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Role
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Joined
              </th>

              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Action
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-border">

            {members.map(
              (member) => {
                const isOwner =
                  member.roleCode ===
                  "studio_owner";

                const isRemoving =
                  removingMemberId ===
                  member.id;

                const memberLabel =
                  getMemberLabel(
                    member,
                  );

                return (
                  <tr
                    key={member.id}
                    className="transition hover:bg-muted/20"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">

                          {getInitials(
                            member,
                          )}

                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-foreground">

                            {memberLabel}

                          </p>


                          {member.email &&
                            member.employeeCode && (

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">

                                {member.employeeCode}

                              </p>

                            )}

                        </div>

                      </div>

                    </td>


                    <td className="px-5 py-4">

                      <span className="text-sm text-muted-foreground">

                        {member.employeeCode ||
                          "—"}

                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <div>

                        <p className="text-sm font-medium text-foreground">

                          {member.roleName ||
                            member.roleCode}

                        </p>


                        {member.roleDescription && (

                          <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">

                            {member.roleDescription}

                          </p>

                        )}

                      </div>

                    </td>


                    <td className="px-5 py-4">

                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          member.memberStatus ===
                          "active"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >

                        {member.memberStatus ===
                        "active"
                          ? "Active"
                          : member.memberStatus}

                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <span className="text-sm text-muted-foreground">

                        {member.joinedAt
                          ? new Intl.DateTimeFormat(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            ).format(
                              new Date(
                                member.joinedAt,
                              ),
                            )
                          : "—"}

                      </span>

                    </td>


                    <td className="px-5 py-4 text-right">

                      {isOwner ? (

                        <span className="text-xs text-muted-foreground">
                          Owner
                        </span>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveMember(
                              member,
                            )
                          }
                          disabled={isRemoving}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {isRemoving
                            ? "Removing..."
                            : "Remove"}

                        </button>

                      )}

                    </td>

                  </tr>
                );
              },
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
