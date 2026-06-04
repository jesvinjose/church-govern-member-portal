import prisma from "../../config/prisma";
import { notifyTenantAdmins } from "../notifications/notification.helper";
import { createNotification } from "../notifications/notification.service";

type CreateContributionPayload = {

  tenant_id: string;

  member_id: string;

  family_id: string;

  type:
  | "DONATION"
  | "SUBSCRIPTION";

  amount: number;

  purpose: string;

  payment_method:
  | "BANK_TRANSFER"
  | "CASH"
  | "UPI"
  | "CARD"
  | "CHEQUE";

  privacy:
  | "PUBLIC"
  | "PRIVATE";

  notes?: string;
};

export const createContributionService =
  async (
    payload: CreateContributionPayload
  ) => {

    const contribution =
      await prisma.contribution.create({

        data: {
          ...payload,

          status: "PENDING",
        },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    // Notify parish admins
    await notifyTenantAdmins({

      tenant_id:
        contribution.tenant_id,

      title:
        "New Contribution Submitted",

      message:
        `${contribution.member.name} submitted a contribution of ₹${contribution.amount}`,

      type:
        "CONTRIBUTION",

      metadata: {

        contribution_id:
          contribution.id,

      },

    });

    return contribution;

  };

export const getMyContributionsService =
  async (
    member_id: string,
    tenant_id: string,
    type?:
      | "DONATION"
      | "SUBSCRIPTION"
  ) => {

    return prisma.contribution.findMany({

      where: {
        member_id,
        tenant_id,
        ...(type && { type }),
      },

      orderBy: {
        created_at: "desc",
      },

    });

  };

export const getContributionSummaryService =
  async (
    member_id: string,
    tenant_id: string
  ) => {

    const contributions =
      await prisma.contribution.findMany({

        where: {
          member_id,
          tenant_id,
        },

      });

    const total_paid =
      contributions
        .filter(
          (c) =>
            c.status === "APPROVED"
        )
        .reduce(
          (sum, c) =>
            sum + Number(c.amount),
          0
        );

    const pending_amount =
      contributions
        .filter(
          (c) =>
            c.status === "PENDING"
        )
        .reduce(
          (sum, c) =>
            sum + Number(c.amount),
          0
        );

    const paid_count =
      contributions.filter(
        (c) =>
          c.status === "APPROVED"
      ).length;

    return {

      total_paid,

      transactions:
        contributions.length,

      paid_count,

      pending_amount,

    };

  };

export const getAllContributionsService =
  async (
    tenant_id: string
  ) => {

    return prisma.contribution.findMany({

      where: {
        tenant_id,
      },

      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        family: {
          select: {
            id: true,
            name: true,
            serial_no: true,
          },
        },
      },

      orderBy: {
        created_at: "desc",
      },

    });

  };

export const getContributionByIdService =
  async (
    id: string,
    tenant_id: string
  ) => {

    return prisma.contribution.findFirst({

      where: {
        id,
        tenant_id,
      },

      include: {
        member: true,
        family: true,
      },

    });

  };

export const updateContributionStatusService =
  async (
    id: string,
    tenant_id: string,
    status:
      | "APPROVED"
      | "REJECTED"
  ) => {

    const contribution =
      await prisma.contribution.findFirst({

        where: {
          id,
          tenant_id,
        },

      });

    if (!contribution) {

      throw new Error(
        "Contribution not found"
      );

    }

    const updatedContribution =
      await prisma.contribution.update({

        where: {
          id,
        },

        data: {

          status,

          verified_at:
            status === "APPROVED"
              ? new Date()
              : null,

          receipt_no:
            status === "APPROVED"
              ? `RCPT-${Date.now()}`
              : null,
        },

      });

    // Notify member
    await createNotification({

      tenant_id:
        contribution.tenant_id,

      member_id:
        contribution.member_id,

      title:
        status === "APPROVED"
          ? "Contribution Approved"
          : "Contribution Rejected",

      message:
        status === "APPROVED"
          ? "Your contribution has been approved"
          : "Your contribution has been rejected",

      type:
        "CONTRIBUTION",

      metadata: {

        contribution_id:
          contribution.id,

        status,

      },

    });

    return updatedContribution;

  };