import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

import { createFamily, createMember, getMyFamily, } from "./family.controller";

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

// MEMBER ROUTES

router.get(
  "/family",
  memberAuthMiddleware,
  getMyFamily
);

export default router;