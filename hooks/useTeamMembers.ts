"use client";

import {
  useCallback,
  useState,
} from "react";

import { useBootstrapContext } from "@/context/BootstrapContext";

import { teamMemberRepository } from "@/lib/repositories/team-member.repository";

import type {
  TeamMember,
} from "@/types/team-member";

export function useTeamMembers() {

  const {
    data: bootstrap,
  } = useBootstrapContext();

  const [
    members,
    setMembers,
  ] = useState<TeamMember[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const load =
    useCallback(
      async (
        search = "",
      ) => {

        if (!bootstrap) {
          return;
        }

        setLoading(true);

        setError(null);

        try {

          const studioId =
            bootstrap.workspace.membership.studioId;

          const result =
            await teamMemberRepository.getAll(
              studioId,
              1,
              25,
              search,
            );

          setMembers(
            result.members,
          );

        } catch (err) {

          console.error(err);

          if (err instanceof Error) {

            setError(
              err.message,
            );

          } else {

            setError(
              "Unable to load team members.",
            );

          }

        } finally {

          setLoading(false);

        }

      },
      [
        bootstrap,
      ],
    );

  return {

    members,

    loading,

    error,

    load,

  };

}