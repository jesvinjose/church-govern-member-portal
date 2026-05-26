import { Response } from "express";

import { catchAsync }
    from "../../utils/catchAsync";

import { sendResponse }
    from "../../utils/response";

import {
    MemberAuthRequest
} from "../../middlewares/memberAuth.middleware";

import {
    createContributionSchema
} from "./contributions.validation";

import {
    createContributionService,
    getMyContributionsService,
    getContributionSummaryService,
    updateContributionStatusService,
    getAllContributionsService,
    getContributionByIdService
} from "./contributions.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const createContribution =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const validatedData =
                createContributionSchema.parse(
                    req.body
                );

            const contribution =
                await createContributionService({

                    tenant_id:
                        req.tenant_id as string,

                    member_id:
                        req.member_id as string,

                    family_id:
                        req.family_id as string,

                    ...validatedData,
                });

            return sendResponse(
                res,
                201,
                "Contribution created successfully",
                contribution
            );

        }
    );

export const getMyContributions =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const type =
                req.query.type as
                | "DONATION"
                | "SUBSCRIPTION"
                | undefined;

            const contributions =
                await getMyContributionsService(
                    req.member_id as string,
                    req.tenant_id as string,
                    type
                );

            return sendResponse(
                res,
                200,
                "Contributions fetched successfully",
                contributions
            );

        }
    );

export const getContributionSummary =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const summary =
                await getContributionSummaryService(
                    req.member_id as string,
                    req.tenant_id as string
                );

            return sendResponse(
                res,
                200,
                "Contribution summary fetched successfully",
                summary
            );

        }
    );

export const getAllContributions =
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

            const contributions =
                await getAllContributionsService(
                    req.tenant_id
                );

            return sendResponse(
                res,
                200,
                "Contributions fetched successfully",
                contributions
            );

        }
    );

export const getContributionById =
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

            const contribution =
                await getContributionByIdService(
                    req.params.id as string,
                    req.tenant_id
                );

            if (!contribution) {

                return sendResponse(
                    res,
                    404,
                    "Contribution not found"
                );

            }

            return sendResponse(
                res,
                200,
                "Contribution fetched successfully",
                contribution
            );

        }
    );

export const updateContributionStatus =
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

            const contribution =
                await updateContributionStatusService(
                    req.params.id as string,
                    req.tenant_id,
                    status
                );

            return sendResponse(
                res,
                200,
                "Contribution status updated successfully",
                contribution
            );

        }
    );