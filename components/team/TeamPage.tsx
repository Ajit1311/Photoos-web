"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Users,
} from "lucide-react";

import {
  useTeamMembers,
} from "@/hooks/useTeamMembers";

import {
  useTeamRoles,
} from "@/hooks/useTeamRoles";

import {
  AddTeamMemberDialog,
} from "./AddTeamMemberDialog";

import {
  TeamFilters,
} from "./TeamFilters";

import {
  TeamMembersTable,
} from "./TeamMembersTable";

import {
  TeamPagination,
} from "./TeamPagination";


const PAGE_SIZE = 10;


export function TeamPage() {
  const [
    page,
    setPage,
  ] = useState(1);

  const [
    search,
    setSearch,
  ] = useState("");


  const {
    members,
    pagination,
    loading,
    error,
    reload,
  } =
    useTeamMembers({
      page,
      limit: PAGE_SIZE,
      search,
    });


  const {
    roles,
    loading: rolesLoading,
  } =
    useTeamRoles();


  const totalMembers =
    pagination?.total ?? 0;


  const totalPages =
    useMemo(
      () => {
        if (!pagination) {
          return 1;
        }

        return Math.max(
          pagination.total_pages,
          1,
        );
      },
      [
        pagination,
      ],
    );


  function handleSearchChange(
    value: string,
  ) {
    setSearch(value);

    setPage(1);
  }


  async function handleInvitationSuccess() {
    await reload();
  }


  async function handleMemberRemoved() {
    await reload();
  }


  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background">
              <Users className="h-5 w-5" />
            </div>


            <div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Team
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage your studio team members,
                roles and access.
              </p>

            </div>

          </div>

        </div>


        <div className="flex items-center gap-4">

          <div className="text-sm text-muted-foreground">

            {loading
              ? "Loading team..."
              : `${totalMembers} member${
                  totalMembers === 1
                    ? ""
                    : "s"
                }`}

          </div>


          <AddTeamMemberDialog
            roles={roles}
            rolesLoading={rolesLoading}
            onSuccess={
              handleInvitationSuccess
            }
          />

        </div>

      </div>


      <TeamFilters
        search={search}
        onSearchChange={
          handleSearchChange
        }
        onRefresh={reload}
        refreshing={loading}
      />


      {error ? (

        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">

          <h2 className="font-medium text-destructive">
            Unable to load team members
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">

            {error instanceof Error
              ? error.message
              : "Something went wrong while loading the team."}

          </p>

        </div>

      ) : (

        <>

          <TeamMembersTable
            members={members}
            loading={loading}
            onMemberRemoved={
              handleMemberRemoved
            }
          />


          {!loading &&
          totalMembers > 0 ? (

            <TeamPagination
              page={page}
              totalPages={totalPages}
              total={totalMembers}
              onPageChange={
                setPage
              }
            />

          ) : null}

        </>

      )}

    </div>
  );
}
