import prisma from "../../config/prisma";
import { AppError } from "../../utils/AppError";

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

    if (payload.type === "MARRIAGE") {

      const {
        groomMembership,
        brideMembership,
        groomMemberId,
        brideMemberId,
      } = payload.payload;

      if (
        groomMembership === "parish" &&
        !groomMemberId
      ) {
        throw new AppError(
          "Groom member is required",
          400
        );
      }

      if (
        brideMembership === "parish" &&
        !brideMemberId
      ) {
        throw new AppError(
          "Bride member is required",
          400
        );
      }

      if (
        groomMembership === "nonParish" &&
        brideMembership === "nonParish"
      ) {
        throw new AppError(
          "At least one party must be a parish member",
          400
        );

      }

      const groomMember =
        groomMemberId
          ? await prisma.member.findUnique({
            where: { id: groomMemberId },
            select: {
              id: true,
              family_id: true,
              tenant_id: true,
              is_deceased: true,
            },
          })
          : null;

      const brideMember =
        brideMemberId
          ? await prisma.member.findUnique({
            where: { id: brideMemberId },
            select: {
              id: true,
              family_id: true,
              tenant_id: true,
              husband_id: true,
              is_deceased: true,
            },
          })
          : null;

      if (
        groomMembership === "parish" &&
        !groomMember
      ) {
        throw new AppError(
          "Invalid groom selected",
          400
        );
      }

      if (
        brideMembership === "parish" &&
        !brideMember
      ) {
        throw new AppError(
          "Invalid bride selected",
          400
        );
      }

      // Tenant validation
      const groomValid =
        !groomMember ||
        groomMember.tenant_id === payload.tenant_id;

      const brideValid =
        !brideMember ||
        brideMember.tenant_id === payload.tenant_id;

      if (!groomValid || !brideValid) {
        throw new AppError(
          "Selected parish member does not belong to this parish",
          400
        );
      }

      if (groomMember?.is_deceased) {
        throw new AppError(
          "Deceased member cannot be selected as groom",
          400
        );
      }

      if (brideMember?.is_deceased) {
        throw new AppError(
          "Deceased member cannot be selected as bride",
          400
        );
      }

      if (
        brideMembership === "parish" &&
        brideMember?.husband_id
      ) {
        throw new AppError(
          "Bride is already married",
          400
        );
      }

      if (
        groomMembership === "parish" &&
        groomMember
      ) {

        const existingWife =
          await prisma.member.findFirst({
            where: {
              husband_id: groomMember.id,
              is_deleted: false,
              is_deceased: false,
            },
            select: {
              id: true,
            },
          });

        if (existingWife) {
          throw new AppError(
            "Groom is already married",
            400
          );
        }
      }

      // Same person validation
      if (
        groomMemberId &&
        brideMemberId &&
        groomMemberId === brideMemberId
      ) {
        throw new AppError(
          "Groom and Bride cannot be the same person",
          400
        );
      }

      // Same family validation
      if (
        groomMember &&
        brideMember &&
        groomMember.family_id === brideMember.family_id
      ) {
        throw new AppError(
          "Groom and Bride cannot belong to the same family",
          400
        );
      }

      if (
        groomMemberId &&
        brideMemberId
      ) {

        const existingRequests =
          await prisma.request.findMany({
            where: {
              tenant_id: payload.tenant_id,
              type: "MARRIAGE",
              status: "PENDING",
            },
            select: {
              payload: true,
            },
          });

        for (const request of existingRequests) {

          const existingPayload =
            request.payload as any;

          const sameCouple =
            (
              existingPayload.groomMemberId === groomMemberId &&
              existingPayload.brideMemberId === brideMemberId
            ) ||
            (
              existingPayload.groomMemberId === brideMemberId &&
              existingPayload.brideMemberId === groomMemberId
            );

          if (sameCouple) {
            throw new AppError(
              "A marriage request for this couple is already pending",
              400
            );
          }
        }
      }

      const belongsToFamily =
        groomMember?.family_id === payload.family_id ||
        brideMember?.family_id === payload.family_id;

      if (!belongsToFamily) {
        throw new AppError(
          "Either groom or bride must belong to your family",
          400
        );
      }
    }

    // =========================
    // BAPTISM VALIDATION
    // =========================

    if (payload.type === "BAPTISM") {

      const {
        fatherMembership,
        motherMembership,
        fatherMemberId,
        motherMemberId,
        fatherName,
        motherName,
        fatherParishName,
        motherParishName,
        officialName,
        dateOfBirth,
        baptismName,
        preferredDate
      } = payload.payload;

      if (!officialName?.trim()) {
        throw new AppError(
          "Child official name is required",
          400
        );
      }

      if (!baptismName?.trim()) {
        throw new AppError(
          "Child baptism name is required",
          400
        );
      }

      if (!dateOfBirth) {
        throw new AppError(
          "Date of birth is required",
          400
        );
      }

      if (preferredDate) {

        const selectedDate =
          new Date(preferredDate);

        selectedDate.setHours(0, 0, 0, 0);

        const today =
          new Date();

        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          throw new AppError(
            "Preferred baptism date cannot be in the past",
            400
          );
        }
      }

      if (!fatherMembership) {
        throw new AppError(
          "Father membership is required",
          400
        );
      }

      if (!motherMembership) {
        throw new AppError(
          "Mother membership is required",
          400
        );
      }

      if (
        fatherMembership &&
        !["parish", "nonParish"].includes(
          fatherMembership
        )
      ) {
        throw new AppError(
          "Invalid father membership type",
          400
        );
      }

      if (
        motherMembership &&
        !["parish", "nonParish"].includes(
          motherMembership
        )
      ) {
        throw new AppError(
          "Invalid mother membership type",
          400
        );
      }

      if (
        fatherMembership === "nonParish" &&
        !fatherName?.trim()
      ) {
        throw new AppError(
          "Father name is required",
          400
        );
      }

      if (
        motherMembership === "nonParish" &&
        !motherName?.trim()
      ) {
        throw new AppError(
          "Mother name is required",
          400
        );
      }

      if (
        fatherMembership === "nonParish" &&
        !fatherParishName?.trim()
      ) {
        throw new AppError(
          "Father parish name is required",
          400
        );
      }

      if (
        motherMembership === "nonParish" &&
        !motherParishName?.trim()
      ) {
        throw new AppError(
          "Mother parish name is required",
          400
        );
      }

      let father = null;
      let mother = null;

      if (fatherMembership === "parish") {

        if (!fatherMemberId) {
          throw new AppError(
            "Father member is required",
            400
          );
        }

        father =
          await prisma.member.findUnique({
            where: {
              id: fatherMemberId,
            },
            select: {
              id: true,
              family_id: true,
              tenant_id: true,
              husband_id: true,
              is_deceased: true,
            },
          });

        if (!father) {
          throw new AppError(
            "Invalid father selected",
            400
          );
        }

        if (
          father.tenant_id !== payload.tenant_id
        ) {
          throw new AppError(
            "Selected father does not belong to this parish",
            400
          );
        }

        if (father.is_deceased) {
          throw new AppError(
            "Deceased member cannot be selected as father",
            400
          );
        }
      }

      if (motherMembership === "parish") {

        if (!motherMemberId) {
          throw new AppError(
            "Mother member is required",
            400
          );
        }

        mother =
          await prisma.member.findUnique({
            where: {
              id: motherMemberId,
            },
            select: {
              id: true,
              family_id: true,
              tenant_id: true,
              husband_id: true,
              is_deceased: true,
            },
          });

        if (!mother) {
          throw new AppError(
            "Invalid mother selected",
            400
          );
        }

        if (
          mother.tenant_id !== payload.tenant_id
        ) {
          throw new AppError(
            "Selected mother does not belong to this parish",
            400
          );
        }

        if (mother.is_deceased) {
          throw new AppError(
            "Deceased member cannot be selected as mother",
            400
          );
        }
      }

      if (
        fatherMembership === "parish" &&
        father?.family_id !== payload.family_id
      ) {
        throw new AppError(
          "Father must belong to your family",
          400
        );
      }

      if (
        motherMembership === "parish" &&
        mother?.family_id !== payload.family_id
      ) {
        throw new AppError(
          "Mother must belong to your family",
          400
        );
      }

      if (
        fatherMembership === "parish" &&
        motherMembership === "parish"
      ) {

        if (
          fatherMemberId === motherMemberId
        ) {
          throw new AppError(
            "Father and Mother cannot be the same person",
            400
          );
        }

        if (
          mother?.husband_id !== father?.id
        ) {
          throw new AppError(
            "Selected Father and Mother are not spouses",
            400
          );
        }
      }

      const normalizedOfficialName =
        officialName.trim().toLowerCase();

      const existingRequests =
        await prisma.request.findMany({
          where: {
            tenant_id: payload.tenant_id,
            type: "BAPTISM",
            status: "PENDING",
          },
          select: {
            payload: true,
          },
        });

      for (const request of existingRequests) {

        const existingPayload =
          request.payload as any;

        if (
          existingPayload.officialName?.trim().toLowerCase() ===
          normalizedOfficialName &&
          existingPayload.dateOfBirth ===
          dateOfBirth
        ) {
          throw new AppError(
            "A baptism request for this child is already pending",
            400
          );
        }
      }
    }

    // =========================
    // DEATH_REGISTRATION VALIDATION
    // =========================

    if (payload.type === "DEATH_REGISTRATION") {

      const { deceasedMemberId } =
        payload.payload;

      if (!deceasedMemberId) {
        throw new AppError(
          "Deceased member is required",
          400
        );
      }

      const deceasedMember =
        await prisma.member.findUnique({
          where: {
            id: deceasedMemberId,
          },
          select: {
            id: true,
            tenant_id: true,
            is_deceased: true,
            family_id: true,
          },
        });

      if (!deceasedMember) {
        throw new AppError(
          "Invalid member selected",
          400
        );
      }

      if (
        deceasedMember.tenant_id !==
        payload.tenant_id
      ) {
        throw new AppError(
          "Member does not belong to this parish",
          400
        );
      }

      if (
        deceasedMember.family_id !==
        payload.family_id
      ) {
        throw new AppError(
          "You can only register deaths for members in your family",
          400
        );
      }

      if (
        deceasedMember.is_deceased
      ) {
        throw new AppError(
          "Member is already marked as deceased",
          400
        );
      }

      const existingRequests =
        await prisma.request.findMany({

          where: {
            tenant_id: payload.tenant_id,
            type: "DEATH_REGISTRATION",
            status: "PENDING",
          },

          select: {
            payload: true,
          },

        });

      for (const request of existingRequests) {

        const existingPayload =
          request.payload as any;

        if (
          existingPayload.deceasedMemberId ===
          deceasedMemberId
        ) {
          throw new AppError(
            "A death registration request for this member is already pending",
            400
          );
        }
      }
    }

    // =========================
    // CERTIFICATE VALIDATION
    // =========================

    if (payload.type === "CERTIFICATE") {

      const {
        memberId,
        certificateType,
      } = payload.payload;

      if (!memberId) {
        throw new AppError(
          "Member is required",
          400
        );
      }

      const member =
        await prisma.member.findUnique({
          where: {
            id: memberId,
          },
          select: {
            id: true,
            tenant_id: true,
            family_id: true,
          },
        });

      if (!member) {
        throw new AppError(
          "Invalid member selected",
          400
        );
      }

      if (
        member.tenant_id !==
        payload.tenant_id
      ) {
        throw new AppError(
          "Member does not belong to this parish",
          400
        );
      }

      if (
        member.family_id !==
        payload.family_id
      ) {
        throw new AppError(
          "You can only request certificates for members in your family",
          400
        );
      }

      const existingRequests =
        await prisma.request.findMany({

          where: {
            tenant_id: payload.tenant_id,
            type: "CERTIFICATE",
            status: "PENDING",
          },

          select: {
            payload: true,
          },

        });

      for (const request of existingRequests) {

        const existingPayload =
          request.payload as any;

        if (
          existingPayload.memberId === memberId &&
          existingPayload.certificateType === certificateType
        ) {
          throw new AppError(
            "A certificate request of this type is already pending for this member",
            400
          );
        }
      }
    }

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

export const getMyRequestsService = async (
  member_id: string
) => {

  const requests = await prisma.request.findMany({
    where: {
      member_id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const memberIds = new Set<string>();

  requests.forEach((request) => {

    if (request.type === "MARRIAGE") {

      const payload = request.payload as any;

      if (payload?.groomMemberId) {
        memberIds.add(payload.groomMemberId);
      }

      if (payload?.brideMemberId) {
        memberIds.add(payload.brideMemberId);
      }
    }
  });

  const members = await prisma.member.findMany({
    where: {
      id: {
        in: [...memberIds],
      },
    },
    select: {
      id: true,
      name: true, // change if your field is full_name/member_name
    },
  });

  const memberMap = new Map(
    members.map((member) => [
      member.id,
      member.name,
    ])
  );

  return requests.map((request) => {

    const payload = request.payload as any;

    let summary = "-";

    switch (request.type) {

      case "BAPTISM":
        summary =
          payload?.officialName ||
          payload?.baptismName ||
          "-";
        break;

      case "MARRIAGE": {

        const groomName =
          payload?.groomName ||
          memberMap.get(
            payload?.groomMemberId
          );

        const brideName =
          payload?.brideName ||
          memberMap.get(
            payload?.brideMemberId
          );

        summary =
          `${groomName || "-"} & ${brideName || "-"}`;

        break;
      }

      case "DEATH_REGISTRATION":
        summary =
          payload?.relationToReporter ||
          payload?.relation_to_deceased ||
          "Death Registration";
        break;

      case "CERTIFICATE":
        summary =
          payload?.certificateType ||
          "-";
        break;
    }

    return {
      ...request,
      summary,
    };

  });

};

// export const getMyRequestsService =
//   async (
//     member_id: string
//   ) => {

//     return prisma.request.findMany({
//       where: {
//         member_id,
//       },

//       orderBy: {
//         created_at: "desc",
//       },
//     });

//   };

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