import { z } from "zod";

export const createAnnouncementSchema =
    z.object({

        title: z
            .string()
            .min(3, "Title is required"),

        content: z
            .string()
            .min(5, "Content is required"),

        category: z.enum([
            "GENERAL",
            "EVENT",
            "PRAYER",
            "SERVICE",
            "PERSONAL",
        ]),

        is_important: z
            .boolean()
            .optional(),

    });