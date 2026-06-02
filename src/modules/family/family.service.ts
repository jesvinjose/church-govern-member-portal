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
          members: {
            include: {
              relation: true,
            },
          },
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

  relation_id?: string;
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

export const getFamiliesService =
  async (
    tenant_id: string
  ) => {

    return prisma.family.findMany({

      where: {
        tenant_id,
      },

      include: {

        members: {
          select: {
            id: true,
            name: true,
            gender: true,
            relation: true,
            phone: true,
            email: true,
          },
        },

      },

      orderBy: {
        created_at: "desc",
      },

    });

  };

export const updateMemberService =
  async (
    memberId: string,
    tenant_id: string,
    payload: {
      name?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      dob?: Date;
      phone?: string;
      email?: string;
      profession?: string;
      christening_name?: string;
      relation_id?: string;
    }
  ) => {

    const member =
      await prisma.member.findFirst({

        where: {
          id: memberId,
          tenant_id,
        },

      });

    if (!member) {

      throw new Error(
        "Member not found"
      );

    }

    let relation_name: string | undefined;

    if (payload.relation_id) {
      const relation = await prisma.relation.findUnique({
        where: {
          id: payload.relation_id,
        },
      });

      if (!relation) {
        throw new Error("Invalid relation");
      }

      relation_name = relation.name;
    }

    return prisma.member.update({

      where: {
        id: memberId,
      },

      data: {
        ...payload,
        ...(relation_name && { relation_name }),
      },

    });

  };

export const getFamilyMembersDropdownService =
  async (
    familyId: string,
    tenant_id: string
  ) => {

    return prisma.member.findMany({

      where: {
        family_id: familyId,
        tenant_id,
      },

      select: {

        id: true,

        name: true,

        gender: true,

        relation: {
          select: {
            id: true,
            name: true,
          },
        },

        dob: true,

      },

      orderBy: {
        name: "asc",
      },

    });

  };