import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import EmailOutbox, { type EmailOutboxDocument } from "@/models/EmailOutbox";
import User from "@/models/User";
import {
  sendTransactionalEmail,
  type TransactionalMailerTemplate,
} from "@/lib/notifications/mailer";

type QueuedEmailTemplate = TransactionalMailerTemplate;

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
  template: QueuedEmailTemplate;
  recipient: string;
  payload: Record<string, unknown>;
}) {
  await connectToDatabase();

  const email = await EmailOutbox.create({
    template: params.template,
    recipient: params.recipient,
    payload: params.payload,
    status: "pending",
  });

  try {
    await sendTransactionalEmail({
      template: params.template,
      recipient: params.recipient,
      payload: params.payload,
    });

    email.status = "sent";
    email.sentAt = new Date();
    email.error = null;
    await email.save();
  } catch (error) {
    email.status = "failed";
    email.error = error instanceof Error ? error.message : "Unknown email delivery error.";
    await email.save();
    throw error;
  }

  return email;
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
  template: QueuedEmailTemplate;
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

  const emails = (await EmailOutbox.insertMany(
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
  )) as EmailOutboxDocument[];

  await Promise.all(
    emails.map(async (email) => {
      try {
        await sendTransactionalEmail({
          template: params.template,
          recipient: email.recipient,
          payload: email.payload,
        });

        email.status = "sent";
        email.sentAt = new Date();
        email.error = null;
        await email.save();
      } catch (error) {
        email.status = "failed";
        email.error = error instanceof Error ? error.message : "Unknown email delivery error.";
        await email.save();
      }
    }),
  );

  return emails;
}
