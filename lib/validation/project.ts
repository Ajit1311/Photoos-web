import { z } from "zod";

import {
  optionalString,
  requiredString,
  uuid,
} from "./common";

export const createProjectSchema =
  z.object({

    title:
      requiredString(
        "Project title",
      ).max(
        200,
        "Project title cannot exceed 200 characters.",
      ),

    description:
  z.string().nullable(),

event_type:
  z.string().nullable(),

event_date:
  z.string().nullable(),

    client_id:
      z.string().optional().or(z.literal("")),

    project_manager_id:
  z.string().uuid().nullable(),

    budget:
      z
        .number({
          error: "Budget is required.",
        })
        .min(
          0,
          "Budget cannot be negative.",
        ),

    advance_amount:
      z
        .number({
          error: "Advance amount is required.",
        })
        .min(
          0,
          "Advance amount cannot be negative.",
        ),

    notes:
  z.string().nullable(),

    metadata:
  z.record(z.string(), z.unknown()).nullable(),

  });

export type CreateProjectForm =
  z.infer<
    typeof createProjectSchema
  >;