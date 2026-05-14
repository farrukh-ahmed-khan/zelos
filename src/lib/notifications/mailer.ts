import nodemailer from "nodemailer";
import { TRANSACTIONAL_EMAIL_TEMPLATES, type TransactionalEmailTemplate } from "@/lib/notifications/templates";

type EmailPayload = Record<string, unknown>;

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

type TemplateName = TransactionalEmailTemplate | "school-teacher-invite";

function getFromAddress() {
  return process.env.MAIL_FROM_ADDRESS?.trim();
}

function getFromName() {
  return process.env.MAIL_FROM_NAME?.trim() || "Zelos";
}

function getTransport() {
  const host = process.env.MAIL_HOST?.trim();
  const port = Number(process.env.MAIL_PORT ?? 587);
  const username = process.env.MAIL_USERNAME?.trim();
  const password = process.env.MAIL_PASSWORD?.trim();

  if (!host || !username || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.MAIL_ENCRYPTION === "ssl",
    auth: {
      user: username,
      pass: password,
    },
  });
}

function inviteEmailContent(payload: EmailPayload): EmailContent {
  const inviteUrl = String(payload.inviteUrl ?? "");
  const expiresAt = payload.expiresAt ? new Date(String(payload.expiresAt)).toLocaleString() : "soon";
  const schoolId = String(payload.schoolId ?? "your school");

  return {
    subject: "You're invited to join a Zelos school",
    text: [
      "You have been invited to join a Zelos school as a teacher.",
      `School ID: ${schoolId}`,
      `Invite expires: ${expiresAt}`,
      `Open this link to accept: ${inviteUrl}`,
    ].join("\n\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#202020;line-height:1.6">
        <h2 style="margin:0 0 12px">You're invited to join a Zelos school</h2>
        <p>You have been invited to join a Zelos school as a teacher.</p>
        <p><strong>School ID:</strong> ${schoolId}</p>
        <p><strong>Invite expires:</strong> ${expiresAt}</p>
        <p><a href="${inviteUrl}" style="display:inline-block;background:#202020;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px">Accept invitation</a></p>
        <p style="font-size:12px;color:#666">If the button does not work, open this link: ${inviteUrl}</p>
      </div>
    `,
  };
}

function fallbackContent(template: string, payload: EmailPayload): EmailContent {
  const prettyPayload = JSON.stringify(payload, null, 2);

  return {
    subject: `Zelos notification: ${template}`,
    text: `Template: ${template}\n\nPayload:\n${prettyPayload}`,
    html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">Template: ${template}\n\nPayload:\n${prettyPayload}</pre>`,
  };
}

export function buildTransactionalEmail(template: TemplateName, payload: EmailPayload): EmailContent {
  if (template === "teacher-invite" || template === "school-teacher-invite") {
    return inviteEmailContent(payload);
  }

  if (TRANSACTIONAL_EMAIL_TEMPLATES.includes(template as TransactionalEmailTemplate)) {
    return fallbackContent(template, payload);
  }

  return fallbackContent(template, payload);
}

export async function sendTransactionalEmail(params: {
  template: TemplateName;
  recipient: string;
  payload: EmailPayload;
}) {
  const transport = getTransport();
  const fromAddress = getFromAddress();

  if (!transport || !fromAddress) {
    throw new Error("Mail transport is not configured.");
  }

  const content = buildTransactionalEmail(params.template, params.payload);

  await transport.sendMail({
    from: `${getFromName()} <${fromAddress}>`,
    to: params.recipient,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}