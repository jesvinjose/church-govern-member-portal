import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { generateMemberToken } from "../../utils/memberJwt";
import { sendResponse } from "../../utils/response";
import { getDeathRegistrationMembersDropdownService, getMemberSpouseService, getRelationsDropdownService, memberLoginService, sendMemberOtpService } from "./member-auth.service";
import { memberLoginSchema, sendMemberOtpSchema } from "./member-auth.validation";
import { MemberAuthRequest } from "../../middlewares/memberAuth.middleware";
import prisma from "../../config/prisma";
import { getFamilyMembersDropdownService } from "../family/family.service";

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