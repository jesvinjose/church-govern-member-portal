import { z } from "zod";

export const createAnnouncementSchema =
    z.object({

        title: z
            .string()
            .trim()
            .min(3, "Title must be at least 3 characters")
            .max(255, "Title is too long"),

        content: z
            .string()
            .trim()
            .min(5, "Content must be at least 5 characters"),

        category: z.enum([
            "GENERAL",
            "EVENT",
            "PRAYER",
            "SERVICE",
            "PERSONAL",
        ]),

        is_important: z
            .boolean()
            .optional()
            .default(false),

    });