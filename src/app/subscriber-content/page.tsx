import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import {
  getSubscriberResourcesForUser,
  serializeSubscriberResource,
} from "@/lib/subscriber-resources/service";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function formatAgeTrack(value: string) {
  if (value === "all") return "All subscriber tracks";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SubscriberContentPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user || !["subscriber", "child"].includes(user.role)) redirect("/dashboard");

  const resourceDocs = await getSubscriberResourcesForUser(user).catch(() => null);
  if (!resourceDocs) redirect("/billing");

  const resources = resourceDocs.map(serializeSubscriberResource);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mb-20 mt-12">
        <p className="eyebrow-red">Subscriber Library</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Subscriber Content
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-sm bg-[#eaf3ff] px-2 py-1 text-[11px] font-black uppercase text-[#175cd3]">
                  {formatAgeTrack(resource.ageTrack)}
                </span>
                <span className="rounded-sm bg-[#fff3cd] px-2 py-1 text-[11px] font-black uppercase text-[#8c0504]">
                  {resource.resourceType}
                </span>
              </div>
              <h2 className="mt-3 font-bebas text-3xl uppercase leading-none">{resource.title}</h2>
              {resource.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#555]">{resource.description}</p>
              ) : null}
              <p className="mt-4 text-xs font-black uppercase text-[#8c0504]">
                {resource.fileName ?? "Open resource"}
              </p>
            </a>
          ))}
        </div>
        {!resources.length ? (
          <p className="mt-6 rounded-md border-2 border-[#212121] bg-white px-4 py-3 text-sm shadow-[0_4px_0_#111]">
            No subscriber resources are available for your account yet.
          </p>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}
