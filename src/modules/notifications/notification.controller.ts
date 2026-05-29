import { Response } from "express";

import prisma from "../../config/prisma";

import { AuthRequest }
    from "../../middlewares/auth.middleware";

import { MemberAuthRequest } from "../../middlewares/memberAuth.middleware";

// ==========================================
// MEMBER NOTIFICATIONS
// ==========================================

export const getMemberNotifications =
    async (
        req: MemberAuthRequest,
        res: Response
    ) => {

        const notifications =
            await prisma.notification.findMany({

                where: {
                    member_id: req.member_id,
                },

                orderBy: {
                    created_at: "desc",
                },

            });

        return res.status(200).json({
            success: true,
            data: notifications,
        });

    };

export const markMemberNotificationRead =
    async (
        req: MemberAuthRequest,
        res: Response
    ) => {

        const id =
            req.params.id as string;

        const notification =
            await prisma.notification.findFirst({

                where: {

                    id,

                    member_id:
                        req.member_id,

                },

            });

        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found",

            });

        }

        await prisma.notification.update({

            where: {
                id,
            },

            data: {
                is_read: true,
            },

        });

        return res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

        });

    };



// ==========================================
// ADMIN NOTIFICATIONS
// ==========================================

export const getAdminNotifications =
    async (
        req: AuthRequest,
        res: Response
    ) => {

        const notifications =
            await prisma.notification.findMany({

                where: {
                    user_id: req.id,
                },

                orderBy: {
                    created_at: "desc",
                },

            });

        return res.status(200).json({

            success: true,

            message:
                "Admin notifications fetched successfully",

            data: notifications,

        });

    };


export const markAdminNotificationRead =
    async (
        req: AuthRequest,
        res: Response
    ) => {

        const id =
            req.params.id as string;

        const notification =
            await prisma.notification.findFirst({

                where: {

                    id,

                    user_id:
                        req.id,

                },

            });

        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found",

            });

        }

        await prisma.notification.update({

            where: {
                id,
            },

            data: {
                is_read: true,
            },

        });

        return res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

        });

    };


// ==========================================
// MARK ALL MEMBER NOTIFICATIONS AS READ
// ==========================================

export const markAllMemberNotificationsRead =
    async (
        req: MemberAuthRequest,
        res: Response
    ) => {

        await prisma.notification.updateMany({

            where: {

                member_id:
                    req.member_id,

                is_read: false,

            },

            data: {
                is_read: true,
            },

        });

        return res.status(200).json({

            success: true,

            message:
                "All notifications marked as read",

        });

    };


// ==========================================
// MARK ALL ADMIN NOTIFICATIONS AS READ
// ==========================================

export const markAllAdminNotificationsRead =
    async (
        req: AuthRequest,
        res: Response
    ) => {

        await prisma.notification.updateMany({

            where: {

                user_id:
                    req.id,

                is_read: false,

            },

            data: {
                is_read: true,
            },

        });

        return res.status(200).json({

            success: true,

            message:
                "All notifications marked as read",

        });

    };