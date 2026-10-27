"use client";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  createClientSchema,
  type CreateClientForm,
} from "@/lib/validation/client";

import {
  useCreateClient,
} from "@/hooks/mutations";

type UseClientFormOptions = {
  onSuccess?: () => void;
};

export function useClientForm(
  options: UseClientFormOptions = {},
) {
  const mutation =
    useCreateClient();

  const form =
    useForm<CreateClientForm>({
      resolver:
        zodResolver(
          createClientSchema,
        ),

      defaultValues: {
        display_name: "",

        email: "",

        phone: "",

        company_name: "",

        notes: "",
      },

      mode:
        "onBlur",
    });

  const submit =
    form.handleSubmit(
      async (
        values,
      ) => {
        await mutation.mutateAsync(
          values,
        );

        form.reset();

        options.onSuccess?.();
      },
    );

  return {
    form,

    submit,

    loading:
      mutation.isPending,

    error:
      mutation.error,

    mutation,
  };
}