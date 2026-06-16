import { Response } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { MemberAuthRequest } from "../../middlewares/memberAuth.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/response";
import { createFamilySchema, createMemberSchema } from "./family.validation";
import {
  createFamilyService, 
  createMemberService, 
  getFamiliesService, 
  getMyFamilyService,
  updateMemberService, 
  getFamilyMembersDropdownService,
  getParishMembersDropdownService,
} from "./family.service";
import { Gender } from "@prisma/client";

export const createFamily = catchAsync(
  async (
    req: AuthRequest,
    res: Response
  ) => {

    console.log("Body:", req.body);

    const validatedData =
      createFamilySchema.parse(req.body);

    if (!req.tenant_id) {

      return sendResponse(
        res,
        403,
        "Tenant not found in token"
      );

    }

    const family =
      await createFamilyService(
        {
          ...validatedData,
          tenant_id: req.tenant_id,
        }
      );

    return sendResponse(
      res,
      201,
      "Family created successfully",
      family
    );

  }
);

export const createMember = catchAsync(
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const familyId =
      req.params.familyId as string;

    const tenant_id =
      req.tenant_id;

    if (!tenant_id) {

      return sendResponse(
        res,
        403,
        "Tenant not found"
      );

    }

    const validatedData =
      createMemberSchema.parse(
        req.body
      );

    // Check duplicate email / phone

    const duplicateConditions = [];

    if (validatedData.email) {
      duplicateConditions.push({
        email: validatedData.email,
      });
    }

    if (validatedData.phone) {
      duplicateConditions.push({
        phone: validatedData.phone,
      });
    }

    if (duplicateConditions.length > 0) {

      const existingMember =
        await prisma.member.findFirst({
          where: {
            is_deleted: false,
            OR: duplicateConditions,
          },
        });

      if (existingMember) {

        if (
          validatedData.email &&
          existingMember.email === validatedData.email
        ) {

          return sendResponse(
            res,
            409,
            "Member with this email already exists"
          );

        }

        if (
          validatedData.phone &&
          existingMember.phone === validatedData.phone
        ) {

          return sendResponse(
            res,
            409,
            "Member with this phone already exists"
          );

        }

      }

    }

    // Verify family belongs to same tenant

    const family =
      await prisma.family.findFirst({
        where: {
          id: familyId,
          tenant_id,
        },
      });

    if (!family) {

      return sendResponse(
        res,
        404,
        "Family not found"
      );

    }

    // Verify relation belongs to tenant
    if (validatedData.relation_id) {
      const relation = await prisma.relation.findFirst({
        where: {
          id: validatedData.relation_id,
          tenant_id,
          is_deleted: false,
        },
      });

      if (!relation) {
        return sendResponse(
          res,
          404,
          "Relation not found"
        );
      }
    }



    const member =
      await createMemberService({
        ...validatedData,

        tenant_id,

        family_id: familyId,

        dob: validatedData.dob
          ? new Date(validatedData.dob)
          : undefined,
      });

    return sendResponse(
      res,
      201,
      "Member created successfully",
      member
    );

  }
);

export const getMyFamily =
  catchAsync(
    async (
      req: MemberAuthRequest,
      res: Response
    ) => {

      const family =
        await getMyFamilyService(
          req.family_id as string,
          req.tenant_id as string
        );

      return sendResponse(
        res,
        200,
        "Family fetched successfully",
        family
      );

    }
  );

export const getFamilies =
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

      const families =
        await getFamiliesService(
          req.tenant_id
        );

      return sendResponse(
        res,
        200,
        "Families fetched successfully",
        families
      );

    }
  );

export const updateMember =
  catchAsync(
    async (
      req: AuthRequest,
      res: Response
    ) => {

      const tenant_id =
        req.tenant_id;

      if (!tenant_id) {

        return sendResponse(
          res,
          403,
          "Tenant not found"
        );

      }

      const validatedData =
        createMemberSchema.parse(
          req.body
        );

      const member =
        await updateMemberService(

          req.params.id as string,

          tenant_id,

          {

            ...validatedData,

            dob:
              validatedData.dob
                ? new Date(
                  validatedData.dob
                )
                : undefined,

          }

        );

      return sendResponse(
        res,
        200,
        "Member updated successfully",
        member
      );

    }
  );

export const getFamilyMembersDropdown =
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

      const members =
        await getFamilyMembersDropdownService(

          req.params.familyId as string,

          req.tenant_id

        );

      return sendResponse(
        res,
        200,
        "Family members fetched successfully",
        members
      );

    }
  );

export const getParishMembersDropdown =
  catchAsync(
    async (
      req: MemberAuthRequest,
      res: Response
    ) => {

      const gender =
        req.query.gender as Gender | undefined;

      const members =
        await getParishMembersDropdownService(
          req.tenant_id as string,
          gender
        );

      return sendResponse(
        res,
        200,
        "Parish members fetched successfully",
        members
      );

    }
  );
