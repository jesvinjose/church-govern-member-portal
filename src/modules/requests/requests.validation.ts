import { z } from "zod";

export const createRequestSchema =
    z.object({

        type: z.enum([
            "BAPTISM",
            "MARRIAGE",
            "DEATH_REGISTRATION",
            "CERTIFICATE",
        ]),

        payload: z.record(
            z.string(),
            z.any()
        ),

        notes: z
            .string()
            .optional(),

    });

export const updateRequestStatusSchema =
    z.object({

        status: z.enum([
            "APPROVED",
            "REJECTED",
        ]),

    });