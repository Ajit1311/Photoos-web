import { z } from "zod";

import {
  optionalEmail,
  optionalPhone,
  optionalString,
  requiredString,
} from "./common";

export const createClientSchema =
  z.object({
    display_name:
      requiredString(
        "Client name",
      ).max(
        150,
        "Client name cannot exceed 150 characters.",
      ),

    email:
      optionalEmail,

    phone:
      optionalPhone.refine(
        (value) =>
          !value ||
          value.length <= 20,
        {
          message:
            "Phone number cannot exceed 20 characters.",
        },
      ),

    company_name:
      optionalString.refine(
        (value) =>
          !value ||
          value.length <= 150,
        {
          message:
            "Company name cannot exceed 150 characters.",
        },
      ),

    notes:
      optionalString.refine(
        (value) =>
          !value ||
          value.length <= 2000,
        {
          message:
            "Notes cannot exceed 2000 characters.",
        },
      ),
  });

export const updateClientSchema =
  createClientSchema.partial();

export type CreateClientForm =
  z.infer<
    typeof createClientSchema
  >;

export type UpdateClientForm =
  z.infer<
    typeof updateClientSchema
  >;