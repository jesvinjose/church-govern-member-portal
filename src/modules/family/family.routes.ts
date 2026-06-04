import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

import {
  createFamily,
  createMember,
  getFamilies,
  updateMember,
  getFamilyMembersDropdown
} from "./family.controller";

const router = Router();

// ADMIN ROUTES
router.post(
  "/",
  authMiddleware,
  createFamily
);

router.post(
  "/:familyId/members",
  authMiddleware,
  createMember
);

router.get(
  "/",
  authMiddleware,
  getFamilies
);

router.patch(
  "/members/:id",
  authMiddleware,
  updateMember
);

router.get(
  "/:familyId/members/dropdown",
  authMiddleware,
  getFamilyMembersDropdown
);

export default router;