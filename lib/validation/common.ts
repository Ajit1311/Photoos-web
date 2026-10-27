import { z } from "zod";

export const requiredString = (
  field: string,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      `${field} is required.`,
    );

export const optionalString =
  z.string().trim().optional();

export const optionalEmail =
  z
    .string()
    .trim()
    .email(
      "Invalid email address.",
    )
    .optional()
    .or(z.literal(""));

export const optionalPhone =
  z
    .string()
    .trim()
    .optional();

export const positiveInteger =
  z
    .number()
    .int()
    .positive();

export const uuid =
  z
    .string()
    .uuid(
      "Invalid identifier.",
    );