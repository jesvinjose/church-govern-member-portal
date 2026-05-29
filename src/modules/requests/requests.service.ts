import prisma from "../../config/prisma";

import { notifyTenantAdmins }
  from "../notifications/notification.helper";
import { createNotification } from "../notifications/notification.service";

type CreateRequestPayload = {

  tenant_id: string;

  member_id: string;

  family_id: string;

  type:
  | "BAPTISM"
  | "MARRIAGE"
  | "DEATH_REGISTRATION"
  | "CERTIFICATE";

  payload: any;

  notes?: string;
};

export const createRequestService =
  async (
    payload: CreateRequestPayload
  ) => {

    const request =
      await prisma.request.create({
        data: payload,
        include: {
          member: true,
        },
      });

    // Notify parish admins
    await notifyTenantAdmins({

      tenant_id: payload.tenant_id,

      title: "New Service Request",

      message:
        `${request.member.name} submitted a ${request.type} request`,

      type: "REQUEST",

      metadata: {
        request_id: request.id,
      },
    });

    return request;

  };

export const getMyRequestsService =
  async (
    member_id: string
  ) => {

    return prisma.request.findMany({
      where: {
        member_id,
      },

      orderBy: {
        created_at: "desc",
      },
    });

  };

export const getAllRequestsService =
  async (
    tenant_id: string
  ) => {

    return prisma.request.findMany({

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

export const getRequestByIdService =
  async (
    id: string,
    tenant_id: string
  ) => {

    return prisma.request.findFirst({

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

export const updateRequestStatusService =
  async (
    id: string,
    tenant_id: string,
    status:
      | "APPROVED"
      | "REJECTED"
  ) => {

    const request =
      await prisma.request.findFirst({

        where: {
          id,
          tenant_id,
        },

      });

    if (!request) {

      throw new Error(
        "Request not found"
      );

    }

    const updatedRequest = await prisma.request.update({

      where: {
        id,
      },

      data: {

        status,

        reviewed_at:
          status === "APPROVED"
            ? new Date()
            : null,

      },

    });

    // Notify member
    await createNotification({

      tenant_id: request.tenant_id,

      member_id: request.member_id,

      title:
        status === "APPROVED"
          ? "Request Approved"
          : "Request Rejected",

      message:
        status === "APPROVED"
          ? "Your request has been approved"
          : "Your request has been rejected",

      type: "REQUEST",

      metadata: {
        request_id: request.id,
        status,
      },

    });

    return updatedRequest;

  };