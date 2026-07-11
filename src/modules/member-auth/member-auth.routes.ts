import { Router } from "express";

import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

import {
    sendMemberOtp,
    memberLogin,
    getMemberProfile,
    getMyFamilyMembersDropdown,
    getAllMyFamilyMembersDropdown,
    getRelationsDropdown,
    getMemberSpouse,
    refreshMemberToken,
    logoutMember
} from "./member-auth.controller";

import { getMyFamily } from "../family/family.controller";

const router = Router();

router.post("/send-otp", sendMemberOtp);

router.post("/verify-otp", memberLogin);

router.get("/profile", memberAuthMiddleware, getMemberProfile);

router.get("/my-family", memberAuthMiddleware, getMyFamily);

router.get("/family-members/dropdown", memberAuthMiddleware, getMyFamilyMembersDropdown);

router.get("/family-members/all-dropdown", memberAuthMiddleware, getAllMyFamilyMembersDropdown);

router.get("/relations/dropdown", memberAuthMiddleware, getRelationsDropdown);

router.get("/members/:memberId/spouse", memberAuthMiddleware, getMemberSpouse);

router.post("/refresh-token", refreshMemberToken);

router.post("/logout", logoutMember);

export default router;