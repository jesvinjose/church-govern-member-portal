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
    tenantId: string,
    familyId: string
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

          family_id: familyId,

          is_deleted: false,
        },

      });

    // GENERATED BIRTHDAY EVENTS

    const birthdayEvents =
      members
        .filter((member) => member.is_active &&
          !member.is_deceased &&
          member.dob)
        .map((member) => ({

          id: `birthday-${member.id}`,

          type: "personal",

          subtype: "birthday",

          title:
            `Happy Birthday ${member.name}`,

          content:
            `Wishing ${member.name} a blessed year ahead.`,

          date:
            member.dob,

        }));

    const anniversaryEvents =
      members
        .filter((member) => member.is_active &&
          !member.is_deceased &&
          member.marriage_date)
        .map((member) => ({

          id: `anniversary-${member.id}`,

          type: "personal",

          subtype: "anniversary",

          title:
            `Happy Anniversary ${member.name}`,

          content:
            `Wishing ${member.name} many more blessed years together.`,

          date:
            member.marriage_date,

        }));

    const memorialEvents =
      members
        .filter(
          (member) =>
            member.is_deceased &&
            member.death_date
        )
        .map((member) => ({

          id: `memorial-${member.id}`,

          type: "personal",

          subtype: "memorial",

          title:
            `In Loving Memory of ${member.name}`,

          content:
            `Remembering ${member.name} in prayer and gratitude.`,

          date:
            member.death_date,

        }));

    // FORMAT ANNOUNCEMENTS

    const formattedAnnouncements =
      broadcasts.map((broadcast) => ({

        id: broadcast.id,

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

      ...anniversaryEvents,

      ...memorialEvents,

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