import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { generateMemberToken } from "../../utils/memberJwt";
import { sendResponse } from "../../utils/response";
import { memberLoginService, sendMemberOtpService } from "./member-auth.service";
import { memberLoginSchema, sendMemberOtpSchema } from "./member-auth.validation";
import { MemberAuthRequest } from "../../middlewares/memberAuth.middleware";
import prisma from "../../config/prisma";

export const sendMemberOtp =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const validatedData =
                sendMemberOtpSchema
                    .parse(req.body);

            await sendMemberOtpService(
                validatedData
            );

            return sendResponse(
                res,
                200,
                "OTP sent successfully"
            );

        }
    );

export const memberLogin =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const validatedData =
                memberLoginSchema.parse(
                    req.body
                );

            const member =
                await memberLoginService(
                    validatedData
                );

            const token =
                generateMemberToken({
                    member_id: member.id,
                    family_id: member.family_id,
                    tenant_id: member.tenant_id,
                    "token_type": "member"
                });

            return sendResponse(
                res,
                200,
                "Member login successful",
                {
                    token,
                    member,
                }
            );

        }
    );

export const getMemberProfile =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const member =
                await prisma.member.findFirst({
                    where: {
                        id:
                            req.member_id,

                        tenant_id:
                            req.tenant_id,
                    },

                    include: {
                        family: true,
                    },
                });

            if (!member) {

                return sendResponse(
                    res,
                    404,
                    "Member not found"
                );

            }

            return sendResponse(
                res,
                200,
                "Profile fetched successfully",
                member
            );

        }
    );