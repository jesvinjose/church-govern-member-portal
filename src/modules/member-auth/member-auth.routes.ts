import { Router }
    from "express";

import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

import {
    sendMemberOtp,
    memberLogin,
    getMemberProfile
} from "./member-auth.controller";

import { getMemberAnnouncements } from "../announcements/announcement.controller";

const router = Router();

router.post("/send-otp", sendMemberOtp);

router.post("/login", memberLogin);

router.get("/profile", memberAuthMiddleware, getMemberProfile);

router.get("/announcements", memberAuthMiddleware, getMemberAnnouncements);

export default router;