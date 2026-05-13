import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ForumReplyForm } from "@/components/ForumReplyForm";
import { Header } from "@/components/Header";
import { getForumThreadById } from "@/lib/forum/service";

export const dynamic = "force-dynamic";

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = await getForumThreadById(threadId);

  if (!thread) notFound();

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12 max-w-[920px]">
        <Link href="/forum" className="text-sm font-bold !text-[#b22222]">Back to forum</Link>
        <article className="mt-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
          <p className="text-xs font-black uppercase text-[#b22222]">{thread.category}</p>
          <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">{thread.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{thread.content}</p>
        </article>
        <div className="mt-6 grid gap-3">
          {thread.replies.map((reply) => (
            <article key={String(reply.id)} className="rounded-md bg-white p-4 text-sm">
              {String(reply.content)}
            </article>
          ))}
          <ForumReplyForm threadId={thread.id} />
          <div className="rounded-md bg-[#8c0504] p-4 text-sm font-bold text-white">
            Visitors: sign up free or subscribe to reply.
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
