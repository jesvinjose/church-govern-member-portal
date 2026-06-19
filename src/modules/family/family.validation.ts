import { z } from "zod";

export const createFamilySchema =
  z.object({

    serial_no: z
      .string()
      .min(1, {
        message:
          "Serial number is required",
      }),

    head_name: z
      .string()
      .min(2, {
        message:
          "Head name is required",
      }),

    name: z
      .string()
      .min(2, {
        message:
          "Family name is required",
      }),

    house_name: z
      .string()
      .optional(),

    phone: z
      .string()
      .optional(),

    address_line1: z
      .string()
      .optional(),

    address_line2: z
      .string()
      .optional(),

    city: z
      .string()
      .optional(),

    state: z
      .string()
      .optional(),

    postal_code: z
      .string()
      .optional(),

    notes: z
      .string()
      .optional(),

  });

export const createMemberSchema = z.object({

  name: z
    .string()
    .min(2, "Name is required"),

  gender: z.enum([
    "MALE",
    "FEMALE",
    "OTHER",
  ]),

  dob: z
    .string()
    .optional(),

  phone: z
    .string()
    .optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional(),

  profession: z
    .string()
    .optional(),

  christening_name: z
    .string()
    .optional(),

  relation_id: z.string().uuid().optional(),

  husband_id: z.string().uuid().optional(),

}).refine(
  (data) => data.email || data.phone,
  {
    message:
      "Either email or phone is required",
    path: ["email"],
  }
);

