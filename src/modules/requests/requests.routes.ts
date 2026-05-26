import { Router }
  from "express";

import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequestStatus
} from "./requests.controller";

import {
  authMiddleware
} from "../../middlewares/auth.middleware";

import {
  memberAuthMiddleware
} from "../../middlewares/memberAuth.middleware";

const router = Router();

router.post(
  "/",
  memberAuthMiddleware,
  createRequest
);

router.get(
  "/",
  memberAuthMiddleware,
  getMyRequests
);

router.get(
  "/admin",
  authMiddleware,
  getAllRequests
);

router.get(
  "/admin/:id",
  authMiddleware,
  getRequestById
);

router.patch(
  "/admin/:id/status",
  authMiddleware,
  updateRequestStatus
);

export default router;