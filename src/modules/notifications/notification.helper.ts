import prisma from "../../config/prisma";
import { getIO } from "../../socket/socket";

export const notifyTenantAdmins = async ({
  tenant_id,
  title,
  message,
  type,
  metadata,
}: {
  tenant_id: string;
  title: string;
  message: string;
  type: any;
  metadata?: any;
}) => {

  // Save notifications for all admins
  const admins = await prisma.user.findMany({
    where: {
      tenant_id,
      roles: {

        some: {

          role: {

            name: "ADMIN",

          },

        },

      },

    },
    select: {
      id: true,
    },
  });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      tenant_id,
      user_id: admin.id,
      title,
      message,
      type,
      metadata,
    })),
  });

  // Real-time emit
  const io = getIO();

  io.to(`tenant_${tenant_id}_admins`).emit(
    "new_notification",
    {
      title,
      message,
      type,
      metadata,
      created_at: new Date(),
    }
  );
};