import { Router }
    from "express";

import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

import {
    sendMemberOtp,
    memberLogin,
    getMemberProfile,
    getMyFamilyMembersDropdown
} from "./member-auth.controller";

import { getMyFamily } from "../family/family.controller";

const router = Router();

router.post("/send-otp", sendMemberOtp);

router.post("/verify-otp", memberLogin);

router.get("/profile", memberAuthMiddleware, getMemberProfile);

router.get("/my-family", memberAuthMiddleware, getMyFamily);

router.get(
    "/family-members/dropdown",
    memberAuthMiddleware,
    getMyFamilyMembersDropdown
);

export default router;