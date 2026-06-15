import { Response } from "express";

import { catchAsync }
  from "../../utils/catchAsync";

import { sendResponse }
  from "../../utils/response";

import { MemberAuthRequest }
  from "../../middlewares/memberAuth.middleware";

import { AuthRequest }
  from "../../middlewares/auth.middleware";

import {
  createRequestSchema
} from "./requests.validation";

import {
  createRequestService,
  getMyRequestsService,
  getAllRequestsService,
  getRequestByIdService,
  updateRequestStatusService,
} from "./requests.service";
import { uploadToSpaces } from "../../utils/uploadToSpaces";


export const createRequest =
  catchAsync(
    async (
      req: MemberAuthRequest,
      res: Response
    ) => {

      const payload =
        JSON.parse(req.body.payload);

      const files =
        (req.files as Express.Multer.File[]) || [];

      const uploadedFiles = [];

      for (const file of files) {
        const url =
          await uploadToSpaces(file);

        uploadedFiles.push({
          file_name: file.originalname,
          file_url: url,
        });
      }

      payload.documents =
        uploadedFiles;

      const validatedData =
        createRequestSchema.parse({
          type: req.body.type,
          payload,
          notes: req.body.notes,
        });

      const request =
        await createRequestService({

          tenant_id:
            req.tenant_id as string,

          member_id:
            req.member_id as string,

          family_id:
            req.family_id as string,

          type:
            validatedData.type,

          payload:
            validatedData.payload,

          notes:
            validatedData.notes,
        });

      return sendResponse(
        res,
        201,
        "Request submitted successfully",
        request
      );

    }
  );

export const getMyRequests =
  catchAsync(
    async (
      req: MemberAuthRequest,
      res: Response
    ) => {

      const requests =
        await getMyRequestsService(
          req.member_id as string
        );

      return sendResponse(
        res,
        200,
        "Requests fetched successfully",
        requests
      );

    }
  );

export const getAllRequests =
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

      const requests =
        await getAllRequestsService(
          req.tenant_id
        );

      return sendResponse(
        res,
        200,
        "Requests fetched successfully",
        requests
      );

    }
  );

export const getRequestById =
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

      const request =
        await getRequestByIdService(
          req.params.id as string,
          req.tenant_id
        );

      if (!request) {

        return sendResponse(
          res,
          404,
          "Request not found"
        );

      }

      return sendResponse(
        res,
        200,
        "Request fetched successfully",
        request
      );

    }
  );

export const updateRequestStatus =
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

      const { status } =
        req.body;

      const request =
        await updateRequestStatusService(
          req.params.id as string,
          req.tenant_id,
          req.id as string,
          status
        );

      return sendResponse(
        res,
        200,
        "Request status updated successfully",
        request
      );

    }
  );