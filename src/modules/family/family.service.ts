import prisma from "../../config/prisma";

type CreateFamilyPayload = {
  tenant_id: string;

  serial_no: string;

  head_name: string;

  name: string;

  house_name?: string;

  phone?: string;

  address_line1?: string;

  address_line2?: string;

  city?: string;

  state?: string;

  postal_code?: string;

  notes?: string;
};

export const createFamilyService = async (
  payload: CreateFamilyPayload
) => {

  console.log("payload:", payload);

  const family = await prisma.family.create({
    data: {
      ...payload,
    },
  });

  return family;

};

export const getMyFamilyService =
  async (
    familyId: string,
    tenantId: string
  ) => {

    const family =
      await prisma.family.findUnique({
        where: {
          id: familyId,
          tenant_id: tenantId,  // ensure tenant isolation
        },

        include: {
          members: true,
        },
      });

    if (!family) {

      throw new Error(
        "Family not found"
      );

    }

    return family;

  };

type CreateMemberPayload = {

  tenant_id: string;

  family_id: string;

  name: string;

  gender: "MALE" | "FEMALE" | "OTHER";

  dob?: Date;

  phone?: string;

  email: string;

  profession?: string;

  christening_name?: string;

  relation?: string;
};

export const createMemberService = async (
  payload: CreateMemberPayload
) => {

  const member =
    await prisma.member.create({
      data: payload,
    });

  return member;

};