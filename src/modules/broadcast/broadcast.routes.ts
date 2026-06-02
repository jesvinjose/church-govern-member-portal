import { Router }
    from "express";

import {
    createAnnouncement,
    getMemberAnnouncements
} from "./broadcast.controller";

import {
    authMiddleware
} from "../../middlewares/auth.middleware";

import { memberAuthMiddleware } from "../../middlewares/memberAuth.middleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createAnnouncement
);

router.get(
  "/member",
  memberAuthMiddleware,
  getMemberAnnouncements
);

export default router;