import { z } from "zod";

export const createRequestSchema = z.object({
    type: z.enum([
        "BAPTISM",
        "MARRIAGE",
        "DEATH_REGISTRATION",
        "CERTIFICATE",
    ]),

    payload: z
        .object({})
        .passthrough(),

    notes: z
        .string()
        .trim()
        .optional(),
});

export const updateRequestStatusSchema =
    z.object({

        status: z.enum([
            "APPROVED",
            "REJECTED",
        ]),

    });