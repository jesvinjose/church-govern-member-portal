import prisma from "../../config/prisma";
import {
  BroadcastType,
  AnnouncementCategory,
} from "@prisma/client";

type CreateAnnouncementPayload = {
  tenant_id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  is_important?: boolean;
  created_by?: string;
};

export const createAnnouncementBroadcastService =
  async (
    payload: CreateAnnouncementPayload
  ) => {

    const broadcast =
      await prisma.broadcast.create({
        data: {
          ...payload,
          type: BroadcastType.ANNOUNCEMENT,
        },
      });

    return broadcast;

  };

export const getAnnouncementBroadcastsService =
  async (
    tenantId: string
  ) => {

    // DATABASE ANNOUNCEMENTS

    const broadcasts =
      await prisma.broadcast.findMany({

        where: {
          tenant_id: tenantId,

          type: BroadcastType.ANNOUNCEMENT,

          is_deleted: false,

          status: "PUBLISHED"
        },

        orderBy: {
          created_at: "desc",
        },

      });

    // MEMBERS FOR BIRTHDAY EVENTS

    const members =
      await prisma.member.findMany({

        where: {
          tenant_id: tenantId,

          is_active: true,
        },

      });

    // GENERATED BIRTHDAY EVENTS

    const birthdayEvents =
      members
        .filter((member) => member.dob)
        .map((member) => ({

          type: "personal",

          subtype: "birthday",

          title:
            `Happy Birthday ${member.name}`,

          content:
            `Wishing ${member.name} a blessed year ahead.`,

          date:
            member.dob,

        }));

    // FORMAT ANNOUNCEMENTS

    const formattedAnnouncements =
      broadcasts.map((broadcast) => ({

        type: broadcast.category?.toLowerCase() ?? "general",

        title:
          broadcast.title,

        content:
          broadcast.content,

        category:
          broadcast.category,

        created_at:
          broadcast.created_at,

        is_important:
          broadcast.is_important,

      }));

    // COMBINE FEED

    const feed = [

      ...formattedAnnouncements,

      ...birthdayEvents,

    ];

    return feed;

  };

export const announcementCount = async (
  tenantId: string
) => {
  return await prisma.broadcast.count({
    where: {
      tenant_id: tenantId,
      type: BroadcastType.ANNOUNCEMENT,
      is_deleted: false,
    }
  })
};

export const recentAnnouncements = async (
  tenantId: string
) => {
  return await prisma.broadcast.findMany({

    where: {
      tenant_id: tenantId,
      type: BroadcastType.ANNOUNCEMENT,
      is_deleted: false,
    },

    orderBy: {
      created_at: "desc"
    },

    take: 5
  });
}