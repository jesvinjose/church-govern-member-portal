import { z } from "zod";

export const createContributionSchema =
    z.object({

        type: z.enum([
            "DONATION",
            "SUBSCRIPTION",
        ]),

        amount: z
            .number()
            .positive(),

        purpose: z
            .string()
            .min(2),

        payment_method: z.enum([
            "BANK_TRANSFER",
            "CASH",
            "UPI",
            "CARD",
            "CHEQUE",
        ]),

        privacy: z.enum([
            "PUBLIC",
            "PRIVATE",
        ]),

        notes: z
            .string()
            .optional(),

    });