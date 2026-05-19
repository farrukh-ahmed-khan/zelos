import nodemailer from "nodemailer";
import { TRANSACTIONAL_EMAIL_TEMPLATES, type TransactionalEmailTemplate } from "@/lib/notifications/templates";

type EmailPayload = Record<string, unknown>;

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

type TemplateName = TransactionalEmailTemplate | "school-teacher-invite";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

function schoolInviteEmailContent(payload: EmailPayload, role: "teacher" | "student"): EmailContent {
  const inviteUrl = String(payload.inviteUrl ?? "");
  const expiresAt = payload.expiresAt ? new Date(String(payload.expiresAt)).toLocaleString() : "soon";
  const schoolId = String(payload.schoolId ?? "your school");
  const roleLabel = role === "teacher" ? "teacher" : "student";
  const escapedInviteUrl = escapeHtml(inviteUrl);
  const escapedExpiresAt = escapeHtml(expiresAt);
  const escapedSchoolId = escapeHtml(schoolId);

  return {
    subject: "You're invited to join a Zelos school",
    text: [
      `You have been invited to join a Zelos school as a ${roleLabel}.`,
      `School ID: ${schoolId}`,
      `Invite expires: ${expiresAt}`,
      `Open this link to accept: ${inviteUrl}`,
    ].join("\n\n"),
    html: `
      <div style="margin:0;background:#f4f5f7;padding:28px 16px;font-family:Arial,sans-serif;color:#202020">
        <div style="max-width:560px;margin:0 auto;overflow:hidden;border:1px solid #d9dde3;border-radius:10px;background:#ffffff">
          <div style="background:#8c0504;padding:24px;color:#ffffff">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Zelos School Invite</p>
            <h1 style="margin:0;font-size:26px;line-height:1.2">You're invited to join Zelos</h1>
          </div>
          <div style="padding:24px;line-height:1.6">
            <p style="margin:0 0 16px;font-size:16px">You have been invited to join a Zelos school workspace as a <strong>${roleLabel}</strong>.</p>
            <div style="margin:0 0 20px;border-radius:8px;background:#f8fafc;padding:14px 16px">
              <p style="margin:0;font-size:14px"><strong>School ID:</strong> ${escapedSchoolId}</p>
              <p style="margin:6px 0 0;font-size:14px"><strong>Invite expires:</strong> ${escapedExpiresAt}</p>
            </div>
            <a href="${escapedInviteUrl}" style="display:inline-block;border-radius:6px;background:#202020;padding:12px 18px;color:#ffffff;font-weight:700;text-decoration:none">Accept invitation</a>
            <p style="margin:20px 0 0;font-size:12px;color:#667085">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:6px 0 0;word-break:break-all;font-size:12px;color:#667085">${escapedInviteUrl}</p>
          </div>
        </div>
      </div>
    `,
  };
}

function adminInviteEmailContent(payload: EmailPayload): EmailContent {
  const inviteUrl = String(payload.inviteUrl ?? "");
  const expiresAt = payload.expiresAt ? new Date(String(payload.expiresAt)).toLocaleString() : "soon";
  const role = String(payload.role ?? "admin");
  const roleLabel = role === "sub-admin" ? "Sub-Admin" : "Forum Moderator";
  const escapedInviteUrl = escapeHtml(inviteUrl);
  const escapedExpiresAt = escapeHtml(expiresAt);
  const escapedRoleLabel = escapeHtml(roleLabel);

  return {
    subject: `You're invited to join Zelos as ${roleLabel}`,
    text: [
      `You have been invited to join the Zelos admin console as ${roleLabel}.`,
      `Invite expires: ${expiresAt}`,
      `Open this link to accept: ${inviteUrl}`,
    ].join("\n\n"),
    html: `
      <div style="margin:0;background:#f4f5f7;padding:28px 16px;font-family:Arial,sans-serif;color:#202020">
        <div style="max-width:560px;margin:0 auto;overflow:hidden;border:1px solid #d9dde3;border-radius:10px;background:#ffffff">
          <div style="background:#202020;padding:24px;color:#ffffff">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Zelos Admin Invite</p>
            <h1 style="margin:0;font-size:26px;line-height:1.2">Join the Zelos admin console</h1>
          </div>
          <div style="padding:24px;line-height:1.6">
            <p style="margin:0 0 16px;font-size:16px">You have been invited to help manage Zelos as a <strong>${escapedRoleLabel}</strong>.</p>
            <div style="margin:0 0 20px;border-radius:8px;background:#f8fafc;padding:14px 16px">
              <p style="margin:0;font-size:14px"><strong>Role:</strong> ${escapedRoleLabel}</p>
              <p style="margin:6px 0 0;font-size:14px"><strong>Invite expires:</strong> ${escapedExpiresAt}</p>
            </div>
            <a href="${escapedInviteUrl}" style="display:inline-block;border-radius:6px;background:#8c0504;padding:12px 18px;color:#ffffff;font-weight:700;text-decoration:none">Accept admin invite</a>
            <p style="margin:20px 0 0;font-size:12px;color:#667085">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:6px 0 0;word-break:break-all;font-size:12px;color:#667085">${escapedInviteUrl}</p>
          </div>
        </div>
      </div>
    `,
  };
}

function emailConfirmationContent(payload: EmailPayload): EmailContent {
  const name = String(payload.name ?? "there");
  const verificationUrl = String(payload.verificationUrl ?? "");
  const expiresAt = payload.expiresAt
    ? new Date(String(payload.expiresAt)).toLocaleString()
    : "24 hours";
  const escapedName = escapeHtml(name);
  const escapedVerificationUrl = escapeHtml(verificationUrl);
  const escapedExpiresAt = escapeHtml(expiresAt);

  return {
    subject: "Verify your Zelos email",
    text: [
      `Hi ${name},`,
      "Please verify your email address to activate your Zelos account.",
      `This verification link expires: ${expiresAt}`,
      `Verify your email: ${verificationUrl}`,
      "If you did not create a Zelos account, you can ignore this email.",
    ].join("\n\n"),
    html: `
      <div style="margin:0;background:#f4f5f7;padding:28px 16px;font-family:Arial,sans-serif;color:#202020">
        <div style="max-width:560px;margin:0 auto;overflow:hidden;border:1px solid #d9dde3;border-radius:10px;background:#ffffff">
          <div style="background:#8c0504;padding:24px;color:#ffffff">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Zelos Email Verification</p>
            <h1 style="margin:0;font-size:26px;line-height:1.2">Confirm your email address</h1>
          </div>
          <div style="padding:24px;line-height:1.6">
            <p style="margin:0 0 16px;font-size:16px">Hi ${escapedName},</p>
            <p style="margin:0 0 18px;font-size:16px">Please verify your email address to activate your Zelos account.</p>
            <a href="${escapedVerificationUrl}" style="display:inline-block;border-radius:6px;background:#8c0504;padding:12px 18px;color:#ffffff;font-weight:700;text-decoration:none">Verify email</a>
            <p style="margin:20px 0 0;font-size:13px;color:#667085">This link expires: ${escapedExpiresAt}</p>
            <p style="margin:14px 0 0;font-size:12px;color:#667085">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:6px 0 0;word-break:break-all;font-size:12px;color:#667085">${escapedVerificationUrl}</p>
            <p style="margin:20px 0 0;font-size:12px;color:#667085">If you did not create a Zelos account, you can ignore this email.</p>
          </div>
        </div>
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
    return schoolInviteEmailContent(payload, "teacher");
  }

  if (template === "student-invite") {
    return schoolInviteEmailContent(payload, "student");
  }

  if (template === "forum-moderator-invite" || template === "sub-admin-invite") {
    return adminInviteEmailContent(payload);
  }

  if (template === "email-confirmation") {
    return emailConfirmationContent(payload);
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
