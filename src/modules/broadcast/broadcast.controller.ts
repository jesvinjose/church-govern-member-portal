import { Response } from "express";

import prisma from "../../config/prisma";

import { catchAsync }
  from "../../utils/catchAsync";

import { sendResponse }
  from "../../utils/response";

import { AuthRequest }
  from "../../middlewares/auth.middleware";

import {
  createAnnouncementSchema
} from "./broadcast.validation";

import {
  createAnnouncementBroadcastService,
  getAnnouncementBroadcastsService
} from "./broadcast.service";
import { MemberAuthRequest } from "../../middlewares/memberAuth.middleware";

export const createAnnouncement =
  catchAsync(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      if (!req.tenant_id) {

        return sendResponse(
          res,
          403,
          "Tenant not found"
        );

      }

      const validatedData =
        createAnnouncementSchema.parse(
          req.body
        );

      const announcement =
        await createAnnouncementBroadcastService({

          ...validatedData,

          tenant_id:
            req.tenant_id,
            
          created_by: req.id

        });

      return sendResponse(
        res,
        201,
        "Announcement created successfully",
        announcement
      );

    }
  );

export const getMemberAnnouncements =
  catchAsync(
    async (
      req: MemberAuthRequest,
      res: Response
    ) => {

      const announcements =
        await getAnnouncementBroadcastsService(
          req.tenant_id as string
        );

      return sendResponse(
        res,
        200,
        "Announcements fetched successfully",
        announcements
      );

    }
  );