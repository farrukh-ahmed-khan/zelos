import Link from "next/link";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";
import { getForumThreads } from "@/lib/forum/service";
import { ForumThreadForm } from "@/components/ForumThreadForm";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const threads = await getForumThreads();

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <section className="container">
        <div className="sticky top-0 z-20 mb-6 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black shadow-[0_4px_0_#111]">
          Visitors can read. Sign up free or subscribe to post and reply.
        </div>
        <p className="eyebrow-red">Community</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Forum
        </h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="grid content-start gap-3">
            {FORUM_CATEGORIES.map((category) => (
              <div key={category} className="rounded-md bg-white p-4 font-bold">
                {category}
              </div>
            ))}
            <ForumThreadForm />
          </aside>
          <div className="grid gap-3">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/forum/${thread.id}`} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
                <p className="text-xs font-black uppercase text-[#b22222]">{thread.category}</p>
                <h2 className="font-bebas text-3xl uppercase leading-none">{thread.title}</h2>
                <p className="text-sm text-[#555]">{thread.replies.length} replies</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
