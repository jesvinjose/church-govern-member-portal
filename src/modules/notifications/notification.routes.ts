import { Router } from "express";

import {

    getMemberNotifications,

    markMemberNotificationRead,

    markAllMemberNotificationsRead,

    getAdminNotifications,

    markAdminNotificationRead,

    markAllAdminNotificationsRead,

} from "./notification.controller";

import {
    authMiddleware
} from "../../middlewares/auth.middleware";

import {
    memberAuthMiddleware
} from "../../middlewares/memberAuth.middleware";

const router = Router();


// ==========================================
// MEMBER NOTIFICATION ROUTES
// ==========================================

// Get member notifications
router.get(
    "/member",
    memberAuthMiddleware,
    getMemberNotifications
);

// Mark single notification as read
router.patch(
    "/member/:id/read",
    memberAuthMiddleware,
    markMemberNotificationRead
);

// Mark all member notifications as read
router.patch(
    "/member/read-all",
    memberAuthMiddleware,
    markAllMemberNotificationsRead
);


// ==========================================
// ADMIN NOTIFICATION ROUTES
// ==========================================

// Get admin notifications
router.get(
    "/admin",
    authMiddleware,
    getAdminNotifications
);

// Mark single notification as read
router.patch(
    "/admin/:id/read",
    authMiddleware,
    markAdminNotificationRead
);

// Mark all admin notifications as read
router.patch(
    "/admin/read-all",
    authMiddleware,
    markAllAdminNotificationsRead
);

export default router;