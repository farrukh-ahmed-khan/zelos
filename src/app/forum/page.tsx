import Link from "next/link";
import { cookies } from "next/headers";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";
import { getForumCategorySummary, getForumThreads } from "@/lib/forum/service";
import { Footer } from "@/components/Footer";
import { ForumThreadForm } from "@/components/ForumThreadForm";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token).catch(() => null) : null;
  let canPost = false;
  let readOnlyReason = "Visitors can read every thread. Sign in to create a public post.";

  if (payload?.sub) {
    await connectToDatabase();
    const user = await User.findById(payload.sub).select("age forumPostingRevoked");

    if (user?.forumPostingRevoked) {
      readOnlyReason = "Your forum posting access has been revoked.";
    } else if (user && user.age < 16) {
      readOnlyReason = "Accounts under 16 can read the forum but cannot post or reply.";
    } else if (user) {
      canPost = true;
      readOnlyReason = "";
    }
  }

  const threads = await getForumThreads();
  const categories = await getForumCategorySummary();

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12">
        <div className="sticky top-0 z-20 mb-6 rounded-md border border-[#d9dde3] bg-white px-4 py-3 text-sm font-bold shadow-sm">
          Visitors can read every thread. <Link href="/signup" className="!text-[#8c0504]">Sign up free</Link> or <Link href="/billing" className="!text-[#8c0504]">subscribe</Link> to post and reply.
        </div>
        <p className="eyebrow-red">Community</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Forum
        </h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="grid content-start gap-3">
            {FORUM_CATEGORIES.map((category) => {
              const summary = categories.find((entry) => entry.category === category);
              return (
              <div key={category} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
                <p className="font-bold">{category}</p>
                <p className="mt-1 text-sm text-[#555]">{summary?.threadCount ?? 0} threads</p>
              </div>
            )})}
            <ForumThreadForm canPost={canPost} readOnlyReason={readOnlyReason} />
          </aside>
          <div className="grid gap-3">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/forum/${thread.id}`} className="rounded-md border border-[#d9dde3] bg-white p-4 !text-[#202020] shadow-sm">
                <p className="text-xs font-black uppercase text-[#b22222]">{thread.category}</p>
                <h2 className="mt-1 text-xl font-black">{thread.title}</h2>
                <p className="text-sm text-[#555]">{thread.replies.length} replies / {thread.author?.name ?? "Unknown"}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
