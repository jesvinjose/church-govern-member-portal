import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { getDeathRegistrationMembersDropdownService, getMemberSpouseService, getRelationsDropdownService, logoutMemberService, memberLoginService, refreshMemberTokenService, sendMemberOtpService } from "./member-auth.service";
import { memberLoginSchema, sendMemberOtpSchema } from "./member-auth.validation";
import { MemberAuthRequest } from "../../middlewares/memberAuth.middleware";
import prisma from "../../config/prisma";
import { getFamilyMembersDropdownService } from "../family/family.service";
import { memberRefreshCookieOptions } from "../../config/memberCookie";
import { getDeviceInfo } from "../../utils/deviceInfo";

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

            const {
                member,
                accessToken,
                refreshToken,
            } = await memberLoginService(validatedData,
                getDeviceInfo(req));

            res.cookie("member_refresh_token", refreshToken,
                memberRefreshCookieOptions);

            return sendResponse(
                res,
                200,
                "Member login successful",
                {
                    accessToken,
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

export const getMyFamilyMembersDropdown =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const members =
                await getDeathRegistrationMembersDropdownService(
                    req.family_id as string,
                    req.tenant_id as string,
                    req.member_id as string
                );

            return sendResponse(
                res,
                200,
                "Family members fetched successfully",
                members
            );

        }
    );

export const getAllMyFamilyMembersDropdown =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            console.log("tenant_id:", req.tenant_id);
            console.log("family_id:", req.family_id);

            const members =
                await getFamilyMembersDropdownService(
                    req.family_id as string,
                    req.tenant_id as string
                );

            return sendResponse(
                res,
                200,
                "Family members fetched successfully",
                members
            );

        }
    );

export const getRelationsDropdown =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const relations =
                await getRelationsDropdownService(
                    req.tenant_id as string
                );

            return sendResponse(
                res,
                200,
                "Relations fetched successfully",
                relations
            );

        }
    );

export const getMemberSpouse =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const spouse =
                await getMemberSpouseService(
                    req.params.memberId as string,
                    req.tenant_id as string
                );

            return sendResponse(
                res,
                200,
                "Spouse fetched successfully",
                spouse
            );
        }
    );

export const refreshMemberToken =
    catchAsync(
        async (
            req: Request,
            res: Response
        ) => {

            const refreshToken =
                req.cookies.member_refresh_token;

            if (!refreshToken) {

                return sendResponse(
                    res,
                    401,
                    "Refresh token is required"
                );

            }

            const result =
                await refreshMemberTokenService(
                    refreshToken,
                    getDeviceInfo(req)
                );

            res.cookie(
                "member_refresh_token",
                result.refreshToken,
                memberRefreshCookieOptions
            );

            return sendResponse(
                res,
                200,
                "Token refreshed successfully",
                {
                    accessToken:
                        result.accessToken,
                }
            );

        }
    );

export const logoutMember =
    catchAsync(async (req: Request, res: Response) => {

        const refreshToken =
            req.cookies.member_refresh_token;

        if (refreshToken) {
            await logoutMemberService(refreshToken);
        }

        res.clearCookie(
            "member_refresh_token",
            memberRefreshCookieOptions
        );

        return sendResponse(
            res,
            200,
            "Logged out successfully"
        );

    });