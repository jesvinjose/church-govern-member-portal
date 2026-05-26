import { z } from "zod";

export const registerSchema = z.object({

    first_name: z
        .string()
        .min(2, {
            message: "First name is required",
        }),

    last_name: z
        .string()
        .min(1, {
            message: "Last name is required",
        }),

    email: z
        .string()
        .email({
            message: "Invalid email address",
        }),

    phone: z
        .string()
        .optional(),

    password: z
        .string()
        .min(8, {
            message: "Password must contain at least 8 characters",
        }),

    tenant_id: z
        .string({
            message: "Tenant is required",
        }),

});

export const loginSchema = z.object({

    email: z.email({
        message: "Please provide a valid email address",
    }),

    password: z.string().min(1, {
        message: "Password is required",
    }),

});

export const forgotPasswordSchema = z.object({

    email: z.email({
        message: "Please provide a valid email address",
    }),

});

export const resetPasswordSchema = z.object({

    token: z.string().min(1, {
        message: "Reset token is required",
    }),

    password: z.string().min(8, {
        message: "Password must contain at least 8 characters",
    }),

});

export const sendOtpSchema = z.object({

  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .optional(),

  phone: z
    .string()
    .optional(),

  purpose: z.enum([
    "LOGIN",
    "RESET_PASSWORD",
    "VERIFY_PHONE",
    "VERIFY_EMAIL",
  ]),

}).refine(
  (data) => data.email || data.phone,
  {
    message:
      "Email or phone is required",
  }
);

export const loginWithOtpSchema = z.object({

  email: z
    .string()
    .email({
      message: "Invalid email",
    }),

  otp: z
    .string()
    .length(6, {
      message: "OTP must be 6 digits",
    }),

});