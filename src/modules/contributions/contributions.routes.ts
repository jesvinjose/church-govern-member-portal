import { Router }
    from "express";

import {
    createContribution,
    getMyContributions,
    getContributionSummary
} from "./contributions.controller";

import {
    memberAuthMiddleware
} from "../../middlewares/memberAuth.middleware";

import {
    authMiddleware
} from "../../middlewares/auth.middleware";

import {
    getAllContributions,
    getContributionById,
    updateContributionStatus
} from "./contributions.controller";

const router = Router();

router.post(
    "/",
    memberAuthMiddleware,
    createContribution
);

router.get(
    "/",
    memberAuthMiddleware,
    getMyContributions
);

router.get(
    "/summary",
    memberAuthMiddleware,
    getContributionSummary
);

router.get(
    "/admin",
    authMiddleware,
    getAllContributions
);

router.get(
    "/admin/:id",
    authMiddleware,
    getContributionById
);

router.patch(
    "/admin/:id/status",
    authMiddleware,
    updateContributionStatus
);

export default router;