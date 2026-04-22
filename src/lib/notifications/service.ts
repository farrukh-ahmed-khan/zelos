import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import EmailOutbox from "@/models/EmailOutbox";
import User from "@/models/User";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
}) {
  await connectToDatabase();

  return Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link ?? null,
  });
}

export async function queueEmail(params: {
  template: string;
  recipient: string;
  payload: Record<string, unknown>;
}) {
  await connectToDatabase();

  return EmailOutbox.create({
    template: params.template,
    recipient: params.recipient,
    payload: params.payload,
    status: "pending",
  });
}

export async function notifyUsers(params: {
  userIds: string[];
  type: string;
  title: string;
  body: string;
  link?: string | null;
}) {
  await connectToDatabase();

  if (!params.userIds.length) {
    return [];
  }

  return Notification.insertMany(
    params.userIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    })),
  );
}

export async function queueEmailsForUserIds(params: {
  userIds: string[];
  template: string;
  payloadBuilder: (user: { id: string; email: string; name: string }) => Record<string, unknown>;
}) {
  await connectToDatabase();

  if (!params.userIds.length) {
    return [];
  }

  const users = await User.find({ _id: { $in: params.userIds } })
    .select("email name")
    .lean();

  if (!users.length) {
    return [];
  }

  return EmailOutbox.insertMany(
    users.map((user) => ({
      template: params.template,
      recipient: user.email,
      payload: params.payloadBuilder({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }),
      status: "pending",
    })),
  );
}
