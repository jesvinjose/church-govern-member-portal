import { Router }
    from "express";

import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

import {
    sendMemberOtp,
    memberLogin,
    getMemberProfile
} from "./member-auth.controller";

import { getMemberAnnouncements } from "../broadcast/broadcast.controller";

const router = Router();

router.post("/send-otp", sendMemberOtp);

router.post("/verify-otp", memberLogin);

router.get("/profile", memberAuthMiddleware, getMemberProfile);

router.get("/announcements", memberAuthMiddleware, getMemberAnnouncements);

export default router;