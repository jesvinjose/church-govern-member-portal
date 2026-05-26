import { Router }
  from "express";

import {
  getMemberDashboard
} from "./dashboard.controller";

import {
  memberAuthMiddleware
} from "../../middlewares/memberAuth.middleware";

const router = Router();

router.get(
  "/member",
  memberAuthMiddleware,
  getMemberDashboard
);

export default router;