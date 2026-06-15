import { Router }
  from "express";
import { upload } from "../../middlewares/upload.middleware";

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
  upload.any(),
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

router.get("/baptism/parents-dropdown", memberAuthMiddleware)

export default router;