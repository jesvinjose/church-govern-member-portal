import { z } from "zod";

export const sendMemberOtpSchema =
    z.object({

        email: z
            .string()
            .email({
                message:
                    "Invalid email address",
            })
            .optional(),

        phone: z
            .string()
            .optional(),

    }).refine(
        (data) =>
            data.email || data.phone,
        {
            message:
                "Email or phone is required",
        }
    );

export const memberLoginSchema =
    z.object({

        email: z
            .string()
            .email()
            .optional(),

        phone: z
            .string()
            .optional(),

        otp: z
            .string()
            .length(6, {
                message:
                    "OTP must be 6 digits",
            }),

    }).refine(
        (data) =>
            (data.email || data.phone),
        {
            message:
                "Email or phone is required",
        }
    );

