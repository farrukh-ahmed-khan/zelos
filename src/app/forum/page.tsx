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
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#7a0505] px-5 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:px-9 lg:px-24">
        <video className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply" autoPlay loop muted playsInline aria-hidden="true">
          <source src="/assets/bg-video.mp4" type="video/quicktime" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.72),rgba(70,0,0,0.96)_72%)]" />
        <div className="relative z-10">
          <Header />
          <div className="container py-16 lg:py-24">
            <p className="eyebrow-white mb-3">Community Forum</p>
            <h1 className="font-bebas text-[clamp(4rem,9vw,7rem)] uppercase leading-[0.84] text-white">
              Public Money
              <span className="block">Conversation</span>
            </h1>
            <p className="mt-3 inline-block bg-[#F2EBDA] px-2 py-1 font-bebas text-[22px] uppercase leading-none text-[#B22222]">
              Read publicly. Post with an account. No private messages.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-md border-2 border-[#212121] bg-[#FAFF8D] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
                Sign Up Free
              </Link>
              <Link href="/billing" className="rounded-md border-2 border-[#212121] bg-[#f4f1e9] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        {!payload?.sub ? (
          <div className="sticky top-2 z-20 mb-6 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black text-[#212121] shadow-[0_4px_0_#111]">
            Visitors can read every thread. <Link href="/signup" className="!text-[#8c0504]">Sign up free</Link> or <Link href="/billing" className="!text-[#8c0504]">subscribe</Link> to post and reply.
          </div>
        ) : !canPost ? (
          <div className="sticky top-2 z-20 mb-6 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black text-[#212121] shadow-[0_4px_0_#111]">
            {readOnlyReason}
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="grid content-start gap-3">
            {FORUM_CATEGORIES.map((category) => {
              const summary = categories.find((entry) => entry.category === category);
              return (
              <div key={category} className="rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_3px_0_#111]">
                <p className="font-bebas text-2xl uppercase leading-none">{category}</p>
                <p className="mt-1 text-sm font-bold text-[#8c0504]">{summary?.threadCount ?? 0} threads</p>
                {summary?.lastActivityAt ? <p className="mt-1 text-xs text-[#667085]">Last activity {new Date(summary.lastActivityAt).toLocaleDateString()}</p> : null}
              </div>
            )})}
            <ForumThreadForm canPost={canPost} readOnlyReason={readOnlyReason} />
          </aside>
          <div className="rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#e4ded1] pb-4">
              <div>
                <p className="eyebrow-red">Recent Threads</p>
                <h2 className="font-bebas text-4xl uppercase leading-none">Community Board</h2>
              </div>
              <p className="text-sm font-bold text-[#667085]">{threads.length} public thread{threads.length === 1 ? "" : "s"}</p>
            </div>
            <div className="grid gap-3">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/forum/${thread.id}`} className="grid gap-4 rounded-md border border-[#e4ded1] bg-[#fbf7ef] p-4 !text-[#202020] transition hover:border-[#8c0504] hover:bg-[#fff8d9] md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-black uppercase text-[#b22222]">{thread.category}</p>
                  <h3 className="mt-1 font-bebas text-3xl uppercase leading-none">{thread.title}</h3>
                  <p className="mt-2 line-clamp-2 max-w-[720px] text-sm text-[#555]">{thread.excerpt}</p>
                  <p className="mt-3 text-xs font-bold uppercase text-[#667085]">By {thread.author?.name ?? "Unknown"} / {new Date(thread.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="grid min-w-[96px] place-items-center rounded-md border-2 border-[#212121] bg-white px-3 py-2 shadow-[0_3px_0_#111]">
                  <span className="font-bebas text-3xl leading-none text-[#8c0504]">{thread.replies.length}</span>
                  <span className="text-xs font-black uppercase text-[#202020]">Replies</span>
                </div>
              </Link>
            ))}
            {!threads.length ? <p className="rounded-md border-2 border-[#212121] bg-white p-5 text-sm shadow-[0_4px_0_#111]">No forum threads yet.</p> : null}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
