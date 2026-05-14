import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { getToolkitForUser } from "@/lib/toolkit/service";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function ToolkitPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user) redirect("/login");

  const resources = await getToolkitForUser(user);

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-4 text-[#202020] sm:p-6">
      <Header />
      <section className="container mt-12">
        <p className="text-xs font-black uppercase tracking-wide text-[#8c0504]">Money Toolkit</p>
        <h1 className="mt-2 text-3xl font-black">Downloads</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <article key={resource.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
              <p className="font-bold">{resource.title}</p>
              <p className="mt-1 text-sm text-[#555]">{resource.resourceType} / {resource.ageTrack}</p>
              {resource.answers.length ? (
                <details className="mt-3 text-sm">
                  <summary className="font-bold">Answers</summary>
                  <ul className="mt-2 list-inside list-disc text-[#555]">
                    {resource.answers.map((answer) => <li key={answer}>{answer}</li>)}
                  </ul>
                </details>
              ) : null}
              {resource.unlocked && resource.url ? (
                <a href={`/api/toolkit/${resource.id}/download`} className="mt-4 inline-flex rounded-md bg-[#202020] px-4 py-2 text-sm font-bold !text-white">
                  Download
                </a>
              ) : (
                <p className="mt-4 rounded-md bg-[#eef2f7] px-3 py-2 text-sm font-bold text-[#667085]">
                  Complete the linked lesson to unlock.
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
