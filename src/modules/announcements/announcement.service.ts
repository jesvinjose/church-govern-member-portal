import prisma from "../../config/prisma";

type CreateAnnouncementPayload = {

  tenant_id: string;

  title: string;

  content: string;

  category:
  | "GENERAL"
  | "EVENT"
  | "PRAYER"
  | "SERVICE"
  | "PERSONAL";

  is_important?: boolean;

};

export const createAnnouncementService =
  async (
    payload: CreateAnnouncementPayload
  ) => {

    const announcement =
      await prisma.announcement.create({
        data: payload,
      });

    return announcement;

  };

export const getMemberAnnouncementsService =
  async (
    tenantId: string
  ) => {

    // DATABASE ANNOUNCEMENTS

    const announcements =
      await prisma.announcement.findMany({

        where: {
          tenant_id: tenantId,

          is_active: true,
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

          type: "birthday",

          title:
            `Happy Birthday ${member.name}`,

          content:
            `Wishing ${member.name} a blessed year ahead.`,

          date:
            member.dob,

        }));

    // FORMAT ANNOUNCEMENTS

    const formattedAnnouncements =
      announcements.map((announcement) => ({

        type: "announcement",

        title:
          announcement.title,

        content:
          announcement.content,

        category:
          announcement.category,

        created_at:
          announcement.created_at,

        is_important:
          announcement.is_important,

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
  await prisma.announcement.count({
    where: {
      tenant_id: tenantId
    }
  })
};

export const recentAnnouncements = async (
  tenantId: string
) => {
  await prisma.announcement.findMany({

    where: {
      tenant_id: tenantId
    },

    orderBy: {
      created_at: "desc"
    },

    take: 5
  });
}