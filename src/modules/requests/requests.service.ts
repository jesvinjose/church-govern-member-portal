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
    user_id: string,
    status:
      | "APPROVED"
      | "REJECTED"
      | "COMPLETED"
  ) => {

    const request =
      await prisma.request.findFirst({

        where: {
          id,
          tenant_id
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
          status !== "REJECTED"
            ? new Date()
            : null,

        reviewed_by: user_id

      },
    });

    /**
    * BUSINESS ACTIONS ON COMPLETION
    */

    if (
      status === "COMPLETED"
    ) {

      const payload =
        request.payload as any;

      switch (
      request.type
      ) {

        case "MARRIAGE":

          const member =
            await prisma.member.findUnique({

              where: {
                id: request.member_id,
              },

              select: {
                name: true,
              },

            });

          const spouseName =
            member?.name === payload.groom_name
              ? payload.bride_name
              : payload.groom_name;

          await prisma.member.update({

            where: {
              id: request.member_id,
            },

            data: {

              spouse_name:
                spouseName,

              marriage_date:
                payload.preferred_ceremony_date
                  ? new Date(
                    payload.preferred_ceremony_date
                  )
                  : null,

            },

          });

          break;

        case "DEATH_REGISTRATION":

          await prisma.member.update({

            where: {
              id: payload.deceased_member_id,
            },

            data: {

              is_deceased: true,

              death_date:
                payload.date_of_passing
                  ? new Date(
                    payload.date_of_passing
                  )
                  : new Date(),

              is_active: false

            },

          });

          break;

        case "BAPTISM":

          // Future implementation
          break;

        case "CERTIFICATE":

          // No member update required
          break;

        default:
          break;

      }

    }
    /**
   * MEMBER NOTIFICATION
   */

    let title =
      "Request Updated";

    let message =
      "Your request has been updated";

    if (
      status === "APPROVED"
    ) {

      title =
        "Request Approved";

      message =
        "Your request has been approved";

    }

    if (
      status === "REJECTED"
    ) {

      title =
        "Request Rejected";

      message =
        "Your request has been rejected";

    }

    if (
      status === "COMPLETED"
    ) {

      title =
        "Request Completed";

      message =
        "Your request has been completed";

    }

    await createNotification({

      tenant_id: request.tenant_id,

      member_id: request.member_id,

      title,

      message,

      type:
        "REQUEST",

      metadata: {
        request_id: request.id,
        request_type: request.type,
        status,
      },

    });

    return updatedRequest;

  };