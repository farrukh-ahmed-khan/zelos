import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Donation from "@/models/Donation";
import { markOrderPaid } from "@/lib/store/service";
import GiftCard from "@/models/GiftCard";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

function verifyStripeSignature(payload: string, signatureHeader: string | null) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new ApiError(503, "Stripe webhook secret is not configured.");
  }

  const parts = Object.fromEntries(
    (signatureHeader ?? "").split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    throw new ApiError(400, "Missing Stripe signature.");
  }

  const expected = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new ApiError(400, "Invalid Stripe signature.");
  }
}

function addInterval(startDate: Date, interval: "monthly" | "annual") {
  const expiryDate = new Date(startDate);

  if (interval === "monthly") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  return expiryDate;
}

function parseCheckoutSeats(value: unknown, fallbackAgeTrack: string) {
  if (typeof value !== "string" || !value) {
    return [{ label: "Learner 1", email: "", ageTrack: fallbackAgeTrack }];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [{ label: "Learner 1", email: "", ageTrack: fallbackAgeTrack }];
    }

    return parsed
      .map((seat, index) => ({
        label:
          typeof seat?.label === "string" && seat.label.trim()
            ? seat.label.trim()
            : `Learner ${index + 1}`,
        email: typeof seat?.email === "string" ? seat.email.trim().toLowerCase() : "",
        ageTrack:
          ["child", "teen", "young-adult", "adult"].includes(seat?.ageTrack)
            ? seat.ageTrack
            : fallbackAgeTrack,
      }))
      .slice(0, 12);
  } catch {
    return [{ label: "Learner 1", email: "", ageTrack: fallbackAgeTrack }];
  }
}

function generatePassword() {
  return `Zelos${Math.random().toString(36).slice(2, 8)}${Math.floor(1000 + Math.random() * 9000)}!`;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    verifyStripeSignature(rawBody, request.headers.get("stripe-signature"));
    const event = JSON.parse(rawBody);

    await connectToDatabase();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.metadata?.kind === "donation" && session.metadata?.donationId) {
        const donation = await Donation.findById(session.metadata.donationId);
        if (donation) {
          donation.status = "paid";
          donation.providerPaymentId = session.payment_intent ?? session.id;
          await donation.save();

          await queueEmail({
            template: "donation-receipt",
            recipient: donation.email,
            payload: {
              donorName: `${donation.firstName} ${donation.lastName}`,
              amountCents: donation.amountCents,
              donationId: donation._id.toString(),
              purpose:
                donation.purpose === "scholarship" && donation.scholarshipName
                  ? donation.scholarshipName
                  : "Aiding students through Zelos programs",
            },
          });
        }

        return successResponse({ received: true });
      }

      if (session.metadata?.kind === "store" && session.metadata?.orderId) {
        await markOrderPaid({
          orderId: session.metadata.orderId,
          providerPaymentId: session.payment_intent ?? session.id,
          stripeCheckoutSessionId: session.id,
        });

        return successResponse({ received: true });
      }

      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const user = userId ? await User.findById(userId).select("+stripeCustomerId") : null;
      const plan = planId ? await SubscriptionPlan.findById(planId) : null;

      if (user && plan) {
        user.stripeCustomerId = session.customer ?? user.stripeCustomerId ?? null;
        await user.save();

        const startDate = new Date();
        const expiryDate = addInterval(startDate, plan.interval);
        const fallbackAgeTrack = session.metadata?.ageTrack || user.ageTrack;
        const checkoutSeats = parseCheckoutSeats(session.metadata?.seats, fallbackAgeTrack);
        const createdSeats = [];

        if (user.role === "parent") {
          for (const [index, seat] of checkoutSeats.entries()) {
            const password = generatePassword();
            const childEmail =
              seat.email ||
              `${user.email.replace(/@/, `+learner${Date.now()}${index}@`)}`;
            const existingChild = await User.findOne({ email: childEmail });

            if (existingChild) {
              createdSeats.push({
                childUserId: existingChild._id.toString(),
                label: seat.label,
                ageTrack: existingChild.ageTrack,
                email: existingChild.email,
              });
              continue;
            }

            const child = await User.create({
              name: seat.label,
              email: childEmail,
              password: await hashPassword(password),
              role: "child",
              age:
                seat.ageTrack === "child"
                  ? 10
                  : seat.ageTrack === "teen"
                    ? 15
                    : seat.ageTrack === "young-adult"
                      ? 19
                      : 30,
              ageTrack: seat.ageTrack,
              parentId: user._id.toString(),
              interests: [],
              emailVerifiedAt: new Date(),
              termsAcceptedAt: new Date(),
              termsVersion: "v1",
              status: "active",
            });

            createdSeats.push({
              childUserId: child._id.toString(),
              label: seat.label,
              ageTrack: seat.ageTrack,
              email: child.email,
            });

            await queueEmail({
              template: "child-seat-credentials",
              recipient: user.email,
              payload: {
                parentName: user.name,
                childName: child.name,
                childEmail: child.email,
                temporaryPassword: password,
                ageTrack: child.ageTrack,
              },
            });
          }
        }

        await Subscription.create({
          userId: user._id.toString(),
          planType: plan.interval,
          planId: plan._id.toString(),
          planName: plan.name,
          ageTrack: user.role === "parent" ? null : fallbackAgeTrack,
          seatCount: user.role === "parent" ? createdSeats.length : 1,
          seats: user.role === "parent" ? createdSeats : checkoutSeats,
          startDate,
          expiryDate,
          status: "active",
          billingStatus: "active",
          paymentStatus: "paid",
          graceEndsAt: new Date(expiryDate.getTime() + 1000 * 60 * 60 * 48),
          renewalEligibleAt: expiryDate,
          stripeSubscriptionId: session.subscription ?? null,
          stripeCheckoutSessionId: session.id,
        });

        const giftCardCode = session.metadata?.giftCardCode;
        const giftCardAppliedCents = Number(session.metadata?.giftCardAppliedCents ?? 0);

        if (giftCardCode && giftCardAppliedCents > 0) {
          const giftCard = await GiftCard.findOne({ code: giftCardCode });

          if (giftCard) {
            giftCard.remainingAmountCents = Math.max(
              0,
              giftCard.remainingAmountCents - giftCardAppliedCents,
            );
            giftCard.status = giftCard.remainingAmountCents > 0 ? "active" : "redeemed";
            await giftCard.save();
          }
        }

        await queueEmail({
          template: "subscription-confirmation",
          recipient: user.email,
          payload: {
            name: user.name,
            planName: plan.name,
            expiryDate,
          },
        });
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const user = invoice.customer
        ? await User.findOne({ stripeCustomerId: invoice.customer }).select("+stripeCustomerId")
        : null;

      if (user) {
        await queueEmail({
          template: "subscription-renewal-notification",
          recipient: user.email,
          payload: {
            name: user.name,
            invoiceId: invoice.id,
            hostedInvoiceUrl: invoice.hosted_invoice_url,
          },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const stripeSubscription = event.data.object;
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: stripeSubscription.id,
      }).sort({ createdAt: -1 });

      if (subscription) {
        subscription.status = "canceled";
        subscription.canceledAt = new Date();
        await subscription.save();
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
