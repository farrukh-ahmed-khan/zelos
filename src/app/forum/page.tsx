import Link from "next/link";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";
import { getForumCategorySummary, getForumThreads } from "@/lib/forum/service";
import { Footer } from "@/components/Footer";
import { ForumThreadForm } from "@/components/ForumThreadForm";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
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
            <ForumThreadForm />
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
