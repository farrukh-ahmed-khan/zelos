import nodemailer from "nodemailer";
import { TRANSACTIONAL_EMAIL_TEMPLATES, type TransactionalEmailTemplate } from "@/lib/notifications/templates";

type EmailPayload = Record<string, unknown>;

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

export type TransactionalMailerTemplate =
  | TransactionalEmailTemplate
  | "school-teacher-invite"
  | "event-updated"
  | "event-cancelled";

type EmailAction = {
  label: string;
  url: string;
};

type EmailInfoRow = {
  label: string;
  value: string;
};

type BrandedEmailParams = {
  title: string;
  preheader: string;
  headerLabel: string;
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  action?: EmailAction;
  infoTitle?: string;
  infoRows?: EmailInfoRow[];
};

type TemplateCopy = {
  subject: string;
  preheader: string;
  headerLabel: string;
  eyebrow: string;
  heading: string;
  body: string[];
  action?: EmailAction;
};

const GENERIC_TEMPLATE_COPY: Record<string, Omit<TemplateCopy, "action"> & { actionPath?: string; actionLabel?: string }> = {
  "welcome-mentee": {
    subject: "Welcome to Zelos",
    preheader: "Your Zelos account is ready.",
    headerLabel: "Welcome",
    eyebrow: "Welcome to Zelos",
    heading: "Your account is ready",
    body: [
      "Welcome to Zelos. You now have access to programs, resources, and community support built for your financial journey.",
      "Sign in anytime to explore your dashboard and continue where you left off.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "welcome-subscriber": {
    subject: "Welcome to Zelos",
    preheader: "Your Zelos subscriber access is ready.",
    headerLabel: "Welcome",
    eyebrow: "Welcome to Zelos",
    heading: "Your subscriber access is ready",
    body: [
      "Welcome to Zelos. Your subscriber account is active, and you can now access subscriber resources and programs.",
      "Visit your dashboard to get started.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "welcome-parent": {
    subject: "Welcome to Zelos",
    preheader: "Your Zelos account owner access is ready.",
    headerLabel: "Welcome",
    eyebrow: "Welcome to Zelos",
    heading: "Your family account is ready",
    body: [
      "Welcome to Zelos. Your account owner profile is active and ready to manage learner access.",
      "Visit your dashboard to review learner profiles, course access, and billing.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "child-seat-credentials": {
    subject: "A Zelos learner profile is ready",
    preheader: "Here are the learner login details for your account.",
    headerLabel: "Learner access",
    eyebrow: "Learner profile",
    heading: "A learner profile is ready",
    body: [
      "A learner profile has been created under your Zelos account.",
      "Share these credentials only with the learner assigned to this profile. You can reset access from account management when needed.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "welcome-teacher": {
    subject: "Welcome to Zelos",
    preheader: "Your Zelos teacher access is ready.",
    headerLabel: "School",
    eyebrow: "Welcome, teacher",
    heading: "Your school access is active",
    body: [
      "Welcome to Zelos. Your teacher account is active and ready for school resources.",
      "Visit the schools area to manage student access and curriculum materials.",
    ],
    actionPath: "/schools",
    actionLabel: "Open schools",
  },
  "welcome-student": {
    subject: "Welcome to Zelos",
    preheader: "Your Zelos student access is ready.",
    headerLabel: "School",
    eyebrow: "Welcome, student",
    heading: "Your student access is active",
    body: [
      "Welcome to Zelos. Your student account is active and ready for your assigned resources.",
      "Visit your dashboard to begin learning.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "subscription-confirmation": {
    subject: "Your Zelos subscription is active",
    preheader: "Your subscription has been confirmed.",
    headerLabel: "Subscription",
    eyebrow: "Subscription confirmed",
    heading: "Your subscription is active",
    body: [
      "Your Zelos subscription has been confirmed and your access is active.",
      "You can review your plan and account details from your dashboard.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "subscription-renewal-notification": {
    subject: "Your Zelos subscription renewed",
    preheader: "Your subscription renewal was successful.",
    headerLabel: "Subscription",
    eyebrow: "Renewal confirmed",
    heading: "Your subscription renewed",
    body: [
      "Your Zelos subscription renewal was successful.",
      "Thank you for continuing with Zelos. Your subscriber access remains active.",
    ],
    actionPath: "/billing",
    actionLabel: "View billing",
  },
  "subscription-cancellation-confirmation": {
    subject: "Your Zelos subscription was canceled",
    preheader: "Your cancellation has been confirmed.",
    headerLabel: "Subscription",
    eyebrow: "Cancellation confirmed",
    heading: "Your subscription was canceled",
    body: [
      "Your Zelos subscription cancellation has been confirmed.",
      "Your access will remain available until the end of your current paid period.",
    ],
    actionPath: "/billing",
    actionLabel: "View billing",
  },
  "physical-event-rsvp-confirmation": {
    subject: "Your Zelos event RSVP is confirmed",
    preheader: "Your RSVP has been confirmed.",
    headerLabel: "Event",
    eyebrow: "RSVP confirmed",
    heading: "You're on the list",
    body: [
      "Your RSVP for this Zelos event has been confirmed.",
      "We look forward to seeing you there.",
    ],
    actionPath: "/events",
    actionLabel: "View events",
  },
  "digital-event-link-delivery": {
    subject: "Your Zelos event link",
    preheader: "Here are your digital event details.",
    headerLabel: "Event",
    eyebrow: "Event access",
    heading: "Your event link is ready",
    body: [
      "Your RSVP for this Zelos digital event has been confirmed.",
      "Use the event details below to join when it is time.",
    ],
    actionPath: "/events",
    actionLabel: "View events",
  },
  "swag-order-confirmation": {
    subject: "Your Zelos order is confirmed",
    preheader: "We received your Zelos swag order.",
    headerLabel: "Order",
    eyebrow: "Order confirmed",
    heading: "We received your order",
    body: [
      "Thank you for your Zelos swag order. We received it and will keep you updated as it moves forward.",
      "Your order details are included below for your records.",
    ],
    actionPath: "/store",
    actionLabel: "Visit store",
  },
  "swag-order-status-update": {
    subject: "Your Zelos order was updated",
    preheader: "There is an update on your Zelos swag order.",
    headerLabel: "Order",
    eyebrow: "Order update",
    heading: "Your order was updated",
    body: [
      "There is an update on your Zelos swag order.",
      "Review the details below for the latest status.",
    ],
    actionPath: "/store",
    actionLabel: "Visit store",
  },
  "gift-card-delivery": {
    subject: "Your Zelos gift card",
    preheader: "Your Zelos gift card is ready.",
    headerLabel: "Gift card",
    eyebrow: "Gift card delivery",
    heading: "Your gift card is ready",
    body: [
      "Your Zelos gift card is ready to use.",
      "Keep the code below somewhere safe.",
    ],
    actionPath: "/store",
    actionLabel: "Visit store",
  },
  "mentor-application-acknowledgment": {
    subject: "We received your mentor application",
    preheader: "Thank you for applying to mentor with Zelos.",
    headerLabel: "Mentoring",
    eyebrow: "Application received",
    heading: "We received your application",
    body: [
      "Thank you for applying to become a Zelos mentor.",
      "Our team will review your submission and follow up if we need anything else.",
    ],
    actionPath: "/mentoring",
    actionLabel: "View mentoring",
  },
  "scholarship-application-acknowledgment": {
    subject: "We received your scholarship application",
    preheader: "Your scholarship application was submitted.",
    headerLabel: "Scholarship",
    eyebrow: "Application received",
    heading: "Your application was submitted",
    body: [
      "Thank you for submitting your scholarship application.",
      "Our team will review it and follow up as the process moves forward.",
    ],
    actionPath: "/scholarships",
    actionLabel: "View scholarships",
  },
  "contact-confirmation": {
    subject: "We received your message",
    preheader: "Thanks for contacting Zelos.",
    headerLabel: "Contact",
    eyebrow: "Message received",
    heading: "We received your message",
    body: [
      "Thank you for contacting Zelos.",
      "Our team has received your message and will follow up when appropriate.",
    ],
    actionPath: "/",
    actionLabel: "Visit Zelos",
  },
  "school-demo-confirmation": {
    subject: "We received your school demo request",
    preheader: "Thanks for requesting a Zelos school demo.",
    headerLabel: "School",
    eyebrow: "Demo request received",
    heading: "We received your request",
    body: [
      "Thank you for requesting a Zelos school demo.",
      "Our team will review your request and follow up with next steps.",
    ],
    actionPath: "/schools",
    actionLabel: "View schools",
  },
  "scholarship-inquiry-confirmation": {
    subject: "We received your scholarship inquiry",
    preheader: "Thanks for contacting Zelos about scholarships.",
    headerLabel: "Scholarship",
    eyebrow: "Inquiry received",
    heading: "We received your inquiry",
    body: [
      "Thank you for reaching out about Zelos scholarships.",
      "Our team will review your inquiry and follow up when appropriate.",
    ],
    actionPath: "/scholarships",
    actionLabel: "View scholarships",
  },
  "data-access-confirmation": {
    subject: "We received your data access request",
    preheader: "Your data access request was received.",
    headerLabel: "Account",
    eyebrow: "Request received",
    heading: "We received your request",
    body: [
      "We received your data access request.",
      "Our team will review it and follow up according to the applicable process.",
    ],
    actionPath: "/account",
    actionLabel: "Open account",
  },
  "data-deletion-confirmation": {
    subject: "We received your data deletion request",
    preheader: "Your data deletion request was received.",
    headerLabel: "Account",
    eyebrow: "Request received",
    heading: "We received your request",
    body: [
      "We received your data deletion request.",
      "Our team will review it and follow up according to the applicable process.",
    ],
    actionPath: "/account",
    actionLabel: "Open account",
  },
  "admin-broadcast": {
    subject: "A new update from Zelos",
    preheader: "You have a new message from Zelos.",
    headerLabel: "Update",
    eyebrow: "Zelos update",
    heading: "A new update from Zelos",
    body: [
      "You have a new update from the Zelos team.",
      "Review the details below for more information.",
    ],
    actionPath: "/dashboard",
    actionLabel: "Open dashboard",
  },
  "account-deactivation-confirmation": {
    subject: "Your Zelos account was deactivated",
    preheader: "Your Zelos account deactivation is confirmed.",
    headerLabel: "Account",
    eyebrow: "Account deactivated",
    heading: "Your account was deactivated",
    body: [
      "Your Zelos account has been deactivated.",
      "You have been signed out and access is paused unless an administrator reactivates the account.",
    ],
    actionPath: "/contact",
    actionLabel: "Contact support",
  },
  "event-updated": {
    subject: "A Zelos event was updated",
    preheader: "There are updated details for a Zelos event.",
    headerLabel: "Event",
    eyebrow: "Event update",
    heading: "Event details were updated",
    body: [
      "A Zelos event you RSVP'd to has updated details.",
      "Review the event information below before attending.",
    ],
    actionPath: "/events",
    actionLabel: "View events",
  },
  "event-cancelled": {
    subject: "A Zelos event was cancelled",
    preheader: "A Zelos event you RSVP'd to was cancelled.",
    headerLabel: "Event",
    eyebrow: "Event cancelled",
    heading: "This event was cancelled",
    body: [
      "A Zelos event you RSVP'd to has been cancelled.",
      "We are sorry for the change and will share future opportunities through the events page.",
    ],
    actionPath: "/events",
    actionLabel: "View events",
  },
};

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

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

function formatDate(value: unknown) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value: unknown, fallback = "soon") {
  if (!value) {
    return fallback;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatCurrencyFromCents(value: unknown) {
  const cents = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function paragraph(value: string) {
  return `<p class="text-body" style="margin:0 0 16px 0; font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height:26px; color:#403733;">${value}</p>`;
}

function renderAction(action?: EmailAction) {
  if (!action?.url || !action.label) {
    return "";
  }

  const escapedUrl = escapeHtml(action.url);
  const escapedLabel = escapeHtml(action.label);

  return `
            <tr><td class="px" align="left" style="padding:0 40px 36px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn-fluid"><tr>
                <td align="center" bgcolor="#890600" style="border-radius:6px;">
                  <a href="${escapedUrl}" target="_blank" style="display:inline-block; padding:15px 38px; font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height:20px; font-weight:bold; letter-spacing:0.5px; color:#ffffff; background-color:#890600; border-radius:6px; border:1px solid #890600;">${escapedLabel}</a>
                </td>
              </tr></table>
            </td></tr>`;
}

function renderInfoBox(title?: string, rows?: EmailInfoRow[]) {
  if (!title || !rows?.length) {
    return "";
  }

  const renderedRows = rows
    .map(
      (row) => `
                      <tr>
                        <td class="text-muted" style="font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:22px; color:#6f615c; padding:4px 0;">${escapeHtml(row.label)}</td>
                        <td class="text-body" align="right" style="font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:22px; color:#2b1f1d; font-weight:bold; padding:4px 0;">${escapeHtml(row.value)}</td>
                      </tr>`,
    )
    .join("");

  return `
            <tr><td class="px" style="padding:0 40px 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="info-box" style="background-color:#fbf9f3; border-left:4px solid #FAFE8D; border-radius:4px;">
                <tr><td style="padding:22px 26px;">
                  <p style="margin:0 0 4px 0; font-family:Helvetica,Arial,sans-serif; font-size:12px; line-height:16px; letter-spacing:1.5px; text-transform:uppercase; color:#890600; font-weight:bold;">${escapeHtml(title)}</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
${renderedRows}
                  </table>
                </td></tr>
              </table>
            </td></tr>`;
}

function brandedEmailLayout(params: BrandedEmailParams) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(params.title)}</title>
  <style>
    html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
    * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; border-collapse:collapse !important; }
    img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    a { text-decoration:none; }
    .ExternalClass { width:100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height:100%; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
    @media screen and (max-width:600px) {
      .email-container { width:100% !important; margin:0 auto !important; }
      .px { padding-left:24px !important; padding-right:24px !important; }
      .py-lg { padding-top:32px !important; padding-bottom:32px !important; }
      .btn-fluid { width:100% !important; }
      .h1 { font-size:26px !important; line-height:32px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .bg-page { background-color:#1a1413 !important; }
      .card { background-color:#221a18 !important; }
      .text-body { color:#e8ddd9 !important; }
      .text-muted { color:#a99a95 !important; }
      .divider { border-color:#3a2c29 !important; }
      .info-box { background-color:#2a201d !important; }
      .code-box { background-color:#2a201d !important; color:#FAFE8D !important; }
      .footer-text { color:#9a8b86 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f1ee;">
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all; font-family:Helvetica,Arial,sans-serif; color:#f4f1ee;">
    ${escapeHtml(params.preheader)}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>
  <table role="presentation" class="bg-page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f1ee;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">
        <tr><td height="5" style="height:5px; background-color:#FAFE8D; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr>
          <td class="px" align="left" style="background-color:#890600; padding:30px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="left" valign="middle" style="font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:30px; font-weight:bold; letter-spacing:3px; color:#ffffff;">ZELOS</td>
              <td align="right" valign="middle" style="font-family:Helvetica,Arial,sans-serif; font-size:11px; line-height:14px; letter-spacing:1.5px; text-transform:uppercase; color:#f6c9c4;">${escapeHtml(params.headerLabel)}</td>
            </tr></table>
          </td>
        </tr>
        <tr><td class="card" style="background-color:#ffffff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td class="px py-lg" style="padding:40px 40px 8px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-family:Helvetica,Arial,sans-serif; font-size:12px; line-height:16px; letter-spacing:2px; text-transform:uppercase; color:#890600; font-weight:bold; padding-bottom:6px;">${escapeHtml(params.eyebrow)}</td></tr>
                <tr><td style="font-size:0; line-height:0; padding-bottom:18px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="44" height="4" style="width:44px; height:4px; background-color:#FAFE8D; font-size:0; line-height:0;">&nbsp;</td></tr></table>
                </td></tr>
              </table>
              <h1 class="h1 text-body" style="margin:0 0 18px 0; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:38px; font-weight:bold; color:#2b1f1d;">${escapeHtml(params.heading)}</h1>
              ${params.bodyHtml}
            </td></tr>
${renderAction(params.action)}
${renderInfoBox(params.infoTitle, params.infoRows)}
          </table>
        </td></tr>
        <tr><td class="card" style="background-color:#ffffff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td class="px" style="padding:0 40px;"><hr class="divider" style="border:none; border-top:1px solid #ece5e1; margin:0;"></td></tr>
            <tr><td class="px" style="padding:24px 40px 36px 40px;">
              <p class="text-body" style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:15px; line-height:24px; color:#403733;">Warmly,<br><strong style="color:#890600;">The Zelos Team</strong></p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#2b1f1d; padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="3" style="height:3px; background-color:#FAFE8D; font-size:0; line-height:0;">&nbsp;</td></tr></table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td class="px" align="center" style="padding:30px 40px 14px 40px;">
              <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:18px; line-height:20px; font-weight:bold; letter-spacing:2px; color:#ffffff;">ZELOS</p>
              <p class="footer-text" style="margin:8px 0 0 0; font-family:Helvetica,Arial,sans-serif; font-size:12px; line-height:18px; color:#b3a39d;">Financial literacy, mentoring, and scholarships for young people.</p>
            </td></tr>
            <tr><td align="center" style="padding:6px 40px 18px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="padding:0 10px;"><a href="${buildUrl("/")}" style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#FAFE8D; text-decoration:none;">Website</a></td>
                <td style="color:#5c4a46; font-size:12px;">|</td>
                <td style="padding:0 10px;"><a href="${buildUrl("/events")}" style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#FAFE8D; text-decoration:none;">Events</a></td>
                <td style="color:#5c4a46; font-size:12px;">|</td>
                <td style="padding:0 10px;"><a href="${buildUrl("/donate")}" style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#FAFE8D; text-decoration:none;">Donate</a></td>
              </tr></table>
            </td></tr>
            <tr><td class="px" align="center" style="padding:0 40px 30px 40px;">
              <p class="footer-text" style="margin:0 0 6px 0; font-family:Helvetica,Arial,sans-serif; font-size:11px; line-height:18px; color:#8f7f7a;">Zelos &middot; 25 SE 2nd Ave, Suite 550, Miami, FL 33131</p>
              <p class="footer-text" style="margin:0 0 14px 0; font-family:Helvetica,Arial,sans-serif; font-size:11px; line-height:18px; color:#8f7f7a;">Zelos is a registered nonprofit. Donations may be tax-deductible to the extent allowed by law.</p>
              <p class="footer-text" style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:11px; line-height:18px; color:#8f7f7a;">You're receiving this because you have an account with Zelos.<br>
                <a href="${buildUrl("/account")}" style="color:#b3a39d; text-decoration:underline;">Account settings</a></p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td height="20" style="height:20px; font-size:0; line-height:0;">&nbsp;</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function schoolInviteEmailContent(payload: EmailPayload, role: "teacher" | "student"): EmailContent {
  const inviteUrl = String(payload.inviteUrl ?? "");
  const expiresAt = formatDateTime(payload.expiresAt);
  const schoolId = String(payload.schoolId ?? "your school");
  const roleLabel = role === "teacher" ? "teacher" : "student";
  const escapedInviteUrl = escapeHtml(inviteUrl);

  return {
    subject: "You're invited to join a Zelos school",
    text: [
      `You have been invited to join a Zelos school as a ${roleLabel}.`,
      `School ID: ${schoolId}`,
      `Invite expires: ${expiresAt}`,
      `Open this link to accept: ${inviteUrl}`,
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: "You're invited to join a Zelos school",
      preheader: "You have been invited to join a Zelos school workspace.",
      headerLabel: "School invite",
      eyebrow: "Zelos school invite",
      heading: "You're invited to join Zelos",
      bodyHtml: [
        paragraph(`You have been invited to join a Zelos school workspace as a <strong>${roleLabel}</strong>.`),
        paragraph(`If the button does not work, copy and paste this link into your browser:<br><span style="word-break:break-all; color:#6f615c;">${escapedInviteUrl}</span>`),
      ].join(""),
      action: { label: "Accept invitation", url: inviteUrl },
      infoTitle: "Invite details",
      infoRows: [
        { label: "School ID", value: schoolId },
        { label: "Invite expires", value: expiresAt },
      ],
    }),
  };
}

function adminInviteEmailContent(payload: EmailPayload): EmailContent {
  const inviteUrl = String(payload.inviteUrl ?? "");
  const expiresAt = formatDateTime(payload.expiresAt);
  const role = String(payload.role ?? "admin");
  const roleLabel = role === "sub-admin" ? "Sub-Admin" : "Forum Moderator";
  const escapedInviteUrl = escapeHtml(inviteUrl);

  return {
    subject: `You're invited to join Zelos as ${roleLabel}`,
    text: [
      `You have been invited to join the Zelos admin console as ${roleLabel}.`,
      `Invite expires: ${expiresAt}`,
      `Open this link to accept: ${inviteUrl}`,
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: `You're invited to join Zelos as ${roleLabel}`,
      preheader: "You have been invited to help manage Zelos.",
      headerLabel: "Admin invite",
      eyebrow: "Zelos admin invite",
      heading: "Join the Zelos admin console",
      bodyHtml: [
        paragraph(`You have been invited to help manage Zelos as a <strong>${escapeHtml(roleLabel)}</strong>.`),
        paragraph(`If the button does not work, copy and paste this link into your browser:<br><span style="word-break:break-all; color:#6f615c;">${escapedInviteUrl}</span>`),
      ].join(""),
      action: { label: "Accept admin invite", url: inviteUrl },
      infoTitle: "Invite details",
      infoRows: [
        { label: "Role", value: roleLabel },
        { label: "Invite expires", value: expiresAt },
      ],
    }),
  };
}

function emailConfirmationContent(payload: EmailPayload): EmailContent {
  const name = String(payload.name ?? "there");
  const verificationUrl = String(payload.verificationUrl ?? "");
  const expiresAt = formatDateTime(payload.expiresAt, "24 hours");
  const escapedName = escapeHtml(name);
  const escapedVerificationUrl = escapeHtml(verificationUrl);

  return {
    subject: "Verify your Zelos email",
    text: [
      `Hi ${name},`,
      "Please verify your email address to activate your Zelos account.",
      `This verification link expires: ${expiresAt}`,
      `Verify your email: ${verificationUrl}`,
      "If you did not create a Zelos account, you can ignore this email.",
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: "Verify your Zelos email",
      preheader: "Please verify your email address to activate your Zelos account.",
      headerLabel: "Verification",
      eyebrow: "Zelos email verification",
      heading: "Confirm your email address",
      bodyHtml: [
        paragraph(`Hi ${escapedName},`),
        paragraph("Please verify your email address to activate your Zelos account."),
        paragraph(`This link expires: ${escapeHtml(expiresAt)}.`),
        paragraph(`If the button does not work, copy and paste this link into your browser:<br><span style="word-break:break-all; color:#6f615c;">${escapedVerificationUrl}</span>`),
        paragraph("If you did not create a Zelos account, you can ignore this email."),
      ].join(""),
      action: { label: "Verify email", url: verificationUrl },
    }),
  };
}

function passwordResetContent(payload: EmailPayload): EmailContent {
  const name = String(payload.name ?? "there");
  const resetUrl = String(payload.resetUrl ?? "");
  const expiresAt = formatDateTime(payload.expiresAt);
  const escapedName = escapeHtml(name);
  const escapedResetUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset your Zelos password",
    text: [
      `Hi ${name},`,
      "We received a request to reset your Zelos password.",
      `This reset link expires: ${expiresAt}`,
      `Reset your password: ${resetUrl}`,
      "If you did not request this, you can ignore this email.",
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: "Reset your Zelos password",
      preheader: "Use this secure link to reset your Zelos password.",
      headerLabel: "Password reset",
      eyebrow: "Zelos password reset",
      heading: "Reset your password",
      bodyHtml: [
        paragraph(`Hi ${escapedName},`),
        paragraph("We received a request to reset your Zelos password. Use the button below to choose a new one."),
        paragraph(`This link expires: ${escapeHtml(expiresAt)}.`),
        paragraph(`If the button does not work, copy and paste this link into your browser:<br><span style="word-break:break-all; color:#6f615c;">${escapedResetUrl}</span>`),
        paragraph("If you did not request this, you can ignore this email."),
      ].join(""),
      action: { label: "Reset password", url: resetUrl },
    }),
  };
}

function donationReceiptContent(payload: EmailPayload): EmailContent {
  const donorName = String(payload.donorName ?? "there");
  const amount = formatCurrencyFromCents(payload.amountCents);
  const donationId = String(payload.donationId ?? "N/A");
  const purpose = String(payload.purpose ?? "Aiding students through Zelos programs");
  const date = formatDate(payload.createdAt ?? new Date());
  const impactUrl = buildUrl("/donate");

  return {
    subject: "Thank you for your donation to Zelos",
    text: [
      `Hi ${donorName},`,
      "Thank you for your generous gift to Zelos. This email serves as your official receipt.",
      `Amount: ${amount}`,
      `Date: ${date}`,
      `Receipt no.: ${donationId}`,
      `Purpose: ${purpose}`,
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: "Thank you for your donation to Zelos",
      preheader: "Your donation receipt. Thank you for supporting students.",
      headerLabel: "Donation",
      eyebrow: "Thank you",
      heading: "Your donation supports students",
      bodyHtml: [
        paragraph(`Hi ${escapeHtml(donorName)},`),
        paragraph("Thank you for your generous gift to Zelos. Your support goes directly toward aiding students through our programs."),
        paragraph("This email serves as your official receipt. Please keep it for your records."),
      ].join(""),
      action: { label: "Give again", url: impactUrl },
      infoTitle: "Donation receipt",
      infoRows: [
        { label: "Amount", value: amount },
        { label: "Date", value: date },
        { label: "Receipt no.", value: donationId },
        { label: "Purpose", value: purpose },
      ],
    }),
  };
}

function adminWelcomeContent(payload: EmailPayload, role: "forum-moderator" | "sub-admin"): EmailContent {
  const name = String(payload.name ?? "there");
  const isSubAdmin = role === "sub-admin";
  const roleLabel = isSubAdmin ? "Sub-Admin" : "Forum Moderator";
  const destinationUrl = buildUrl(isSubAdmin ? "/admin" : "/forum");

  return {
    subject: isSubAdmin ? "Welcome to the Zelos admin team" : "Welcome to the Zelos moderation team",
    text: [
      `Hi ${name},`,
      isSubAdmin
        ? "Welcome to the Zelos admin team. Your account is now active with the permissions configured for the areas you'll be managing."
        : "Welcome to the Zelos moderation team. Your account is now active and your Moderator badge will appear on every post you make in the community forum.",
      isSubAdmin
        ? "Head to the admin panel to get started. If you need access to additional areas, reach out to the platform administrator."
        : "You can respond to members on behalf of Zelos, review reported posts and comments, and remove anything that breaks our community guidelines.",
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: isSubAdmin ? "Welcome to the Zelos admin team" : "Welcome to the Zelos moderation team",
      preheader: isSubAdmin
        ? "Your admin access is active. Here's what you can do."
        : "Your moderator access is active. Here's how to get started.",
      headerLabel: isSubAdmin ? "Admin" : "Community",
      eyebrow: isSubAdmin ? "Welcome to the team" : "Welcome, moderator",
      heading: isSubAdmin ? "Your admin access is active" : "Your moderator access is active",
      bodyHtml: [
        paragraph(`Hi ${escapeHtml(name)},`),
        paragraph(
          isSubAdmin
            ? "Welcome to the Zelos admin team. Your account is now active with the permissions configured for the areas you'll be managing."
            : "Welcome to the Zelos moderation team. Your account is now active and your Moderator badge will appear on every post you make in the community forum.",
        ),
        paragraph(
          isSubAdmin
            ? "Head to the admin panel to get started. If you need access to additional areas, reach out to the platform administrator."
            : "You can respond to members on behalf of Zelos, review reported posts and comments, and remove anything that breaks our community guidelines. Thank you for helping keep Zelos welcoming.",
        ),
      ].join(""),
      action: {
        label: isSubAdmin ? "Open the admin panel" : "Open the forum",
        url: destinationUrl,
      },
      infoTitle: isSubAdmin ? "Your access" : "Your role",
      infoRows: isSubAdmin
        ? [
            { label: "Role", value: roleLabel },
            { label: "Permission scope", value: "As configured by the administrator" },
          ]
        : [
            { label: "Role", value: roleLabel },
            { label: "Badge", value: "Visible on all your posts" },
            { label: "Tools", value: "Respond, review reports, remove posts" },
          ],
    }),
  };
}

function formatPayloadValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (key.toLowerCase().endsWith("cents")) {
    return formatCurrencyFromCents(value);
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime()) && /date|at$/i.test(key)) {
    return formatDate(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(", ");
  }

  if (typeof value === "object") {
    return "";
  }

  return String(value);
}

function humanizePayloadKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\bid\b/gi, "ID")
    .replace(/\burl\b/gi, "URL")
    .replace(/\bcents\b/gi, "")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function buildPayloadRows(payload: EmailPayload) {
  return Object.entries(payload)
    .filter(([key]) => !["name", "userName", "donorName"].includes(key))
    .map(([key, value]) => ({
      label: humanizePayloadKey(key),
      value: formatPayloadValue(key, value),
    }))
    .filter((row) => row.value);
}

function buildGenericTemplateContent(template: string, payload: EmailPayload): EmailContent | null {
  const copy = GENERIC_TEMPLATE_COPY[template];

  if (!copy) {
    return null;
  }

  const name = String(payload.name ?? payload.userName ?? payload.donorName ?? "");
  const greeting = name ? [paragraph(`Hi ${escapeHtml(name)},`)] : [];
  const action =
    copy.actionPath && copy.actionLabel
      ? { label: copy.actionLabel, url: buildUrl(copy.actionPath) }
      : undefined;
  const rows = buildPayloadRows(payload);

  return {
    subject: copy.subject,
    text: [
      ...(name ? [`Hi ${name},`] : []),
      ...copy.body,
      ...(rows.length ? ["Details:", ...rows.map((row) => `${row.label}: ${row.value}`)] : []),
    ].join("\n\n"),
    html: brandedEmailLayout({
      title: copy.subject,
      preheader: copy.preheader,
      headerLabel: copy.headerLabel,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      bodyHtml: [
        ...greeting,
        ...copy.body.map((line) => paragraph(escapeHtml(line))),
      ].join(""),
      action,
      infoTitle: rows.length ? "Details" : undefined,
      infoRows: rows.length ? rows : undefined,
    }),
  };
}

function fallbackContent(template: string, payload: EmailPayload): EmailContent {
  const prettyPayload = JSON.stringify(payload, null, 2);
  const escapedTemplate = escapeHtml(template);
  const escapedPayload = escapeHtml(prettyPayload);

  return {
    subject: `Zelos notification: ${template}`,
    text: `Template: ${template}\n\nPayload:\n${prettyPayload}`,
    html: brandedEmailLayout({
      title: `Zelos notification: ${template}`,
      preheader: "You have a new notification from Zelos.",
      headerLabel: "Notification",
      eyebrow: "Zelos notification",
      heading: "New notification",
      bodyHtml: [
        paragraph(`Template: <strong>${escapedTemplate}</strong>`),
        `<pre class="code-box" style="margin:0 0 20px 0; white-space:pre-wrap; word-break:break-word; font-family:Consolas,Monaco,monospace; font-size:12px; line-height:18px; color:#403733; background:#fbf9f3; border-left:4px solid #FAFE8D; border-radius:4px; padding:16px;">${escapedPayload}</pre>`,
      ].join(""),
    }),
  };
}

export function buildTransactionalEmail(template: TransactionalMailerTemplate, payload: EmailPayload): EmailContent {
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

  if (template === "password-reset") {
    return passwordResetContent(payload);
  }

  if (template === "donation-receipt") {
    return donationReceiptContent(payload);
  }

  if (template === "welcome-forum-moderator") {
    return adminWelcomeContent(payload, "forum-moderator");
  }

  if (template === "welcome-sub-admin") {
    return adminWelcomeContent(payload, "sub-admin");
  }

  const genericContent = buildGenericTemplateContent(template, payload);
  if (genericContent) {
    return genericContent;
  }

  if (TRANSACTIONAL_EMAIL_TEMPLATES.includes(template as TransactionalEmailTemplate)) {
    return fallbackContent(template, payload);
  }

  return fallbackContent(template, payload);
}

export async function sendTransactionalEmail(params: {
  template: TransactionalMailerTemplate;
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
