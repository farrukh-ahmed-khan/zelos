import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BillingPanel } from "@/components/BillingPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { getSubscriptionPlans, serializeSubscriptionPlan } from "@/lib/subscription-plans/service";
import { serializeSubscription } from "@/lib/subscriptions/serialize-subscription";
import { getLatestSubscriptionByUserId } from "@/lib/subscriptions/service";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user) redirect("/login");
  if (user.role === "child") redirect("/dashboard");

  const [plans, currentSubscription, history] = await Promise.all([
    getSubscriptionPlans(false),
    getLatestSubscriptionByUserId(user._id.toString()),
    Subscription.find({ userId: user._id.toString() }).sort({ createdAt: -1 }).limit(24),
  ]);

  return (
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <Header />
      <section className="container mb-16 mt-12">
        <div className="mx-auto max-w-[980px]">
          <p className="eyebrow-red">Billing</p>
          <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
            Plans & Payments
          </h1>
          <div className="mt-6">
            <BillingPanel
              plans={JSON.parse(JSON.stringify(plans.map(serializeSubscriptionPlan)))}
              subscription={JSON.parse(JSON.stringify(serializeSubscription(currentSubscription)))}
              history={JSON.parse(JSON.stringify(history.map(serializeSubscription)))}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
