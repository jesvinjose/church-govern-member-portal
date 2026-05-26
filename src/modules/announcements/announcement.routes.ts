import { Router }
    from "express";

import {
    createAnnouncement
} from "./announcement.controller";

import {
    authMiddleware
} from "../../middlewares/auth.middleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createAnnouncement
);

export default router;