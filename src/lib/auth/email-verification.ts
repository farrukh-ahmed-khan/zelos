import { createHash, randomBytes } from "node:crypto";
import User, { type UserDocument } from "@/models/User";
import { queueEmail } from "@/lib/notifications/service";

function hashEmailVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildVerificationUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return `${baseUrl}/verify-email?token=${token}`;
}

export async function issueEmailVerification(user: UserDocument) {
  const rawToken = randomBytes(32).toString("hex");

  user.emailVerificationToken = hashEmailVerificationToken(rawToken);
  user.emailVerificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await user.save();

  await queueEmail({
    template: "email-confirmation",
    recipient: user.pendingEmail ?? user.email,
    payload: {
      name: user.name,
      verificationUrl: buildVerificationUrl(rawToken),
      expiresAt: user.emailVerificationExpiresAt,
    },
  });

  return {
    verificationToken: rawToken,
    verificationUrl: buildVerificationUrl(rawToken),
    expiresAt: user.emailVerificationExpiresAt,
  };
}

export async function verifyEmailToken(token: string) {
  const hashedToken = hashEmailVerificationToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpiresAt");

  if (!user) {
    return null;
  }

  if (user.pendingEmail) {
    user.email = user.pendingEmail;
    user.pendingEmail = null;
  }

  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  return user;
}
