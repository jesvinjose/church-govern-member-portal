import prisma from "../../config/prisma";
import { getIO } from "../../socket/socket";
import { NotificationType } from "@prisma/client";

interface CreateNotificationPayload {
  tenant_id: string;

  user_id?: string;
  member_id?: string;

  title: string;
  message: string;

  type: NotificationType;

  metadata?: any;
}

export const createNotification = async (
  payload: CreateNotificationPayload
) => {

  const notification = await prisma.notification.create({
    data: payload,
  });

  const io = getIO();

  // Notify user
  if (payload.user_id) {
    io.to(`user_${payload.user_id}`).emit(
      "new_notification",
      notification
    );
  }

  console.log(
    "Sending notification to user_id:",
    payload.user_id
  );

  // Notify member
  if (payload.member_id) {
    io.to(`member_${payload.member_id}`).emit(
      "new_notification",
      notification
    );
  }

  console.log(
    "Sending notification to member_id:",
    payload.member_id
  );

  return notification;
};