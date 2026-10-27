"use client";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useCreateProject,
  useUpdateProject,
} from "@/hooks/mutations";

import {
  createProjectSchema,
  type CreateProjectForm,
} from "@/lib/validation/project";

import type {
  CreateProjectRequest,
} from "@/types/api/project";

type UseProjectFormOptions = {

  mode?: "create" | "edit";

  projectId?: string;

  defaultValues?: Partial<CreateProjectRequest>;

  onSuccess?: () => void;

};

export function useProjectForm(
  options: UseProjectFormOptions = {},
) {

  const createMutation =
  useCreateProject();

const updateMutation =
  useUpdateProject();

const loading =
  createMutation.isPending ||
  updateMutation.isPending;

const error =
  createMutation.error ??
  updateMutation.error;

  const form =
    useForm<CreateProjectForm>({

      resolver:
        zodResolver(
          createProjectSchema,
        ),

      mode:
        "onBlur",

      defaultValues: {

  title:
    options.defaultValues?.title ?? "",

  description:
    options.defaultValues?.description ?? null,

  event_type:
    options.defaultValues?.event_type ?? null,

  event_date:
    options.defaultValues?.event_date ?? null,

  client_id:
    options.defaultValues?.client_id ?? "",

  project_manager_id:
    options.defaultValues?.project_manager_id ?? null,

  budget:
    options.defaultValues?.budget ?? 0,

  advance_amount:
    options.defaultValues?.advance_amount ?? 0,

  notes:
    options.defaultValues?.notes ?? null,

  metadata:
    options.defaultValues?.metadata ?? null,

},

    });

  const submit =
  form.handleSubmit(

    async (
      values,
    ) => {

      if (
        options.mode === "edit"
      ) {

        if (!options.projectId) {

          throw new Error(
            "Project ID is required.",
          );

        }

        await updateMutation.mutateAsync({

          projectId:
            options.projectId,

          payload:
            values,

        });

      } else {

        await createMutation.mutateAsync(
          values,
        );

        form.reset();

      }

      options.onSuccess?.();

    },

  );

  return {

    form,

    submit,

    loading,

error,

mutation:

  options.mode === "edit"

    ? updateMutation

    : createMutation,

  };

}