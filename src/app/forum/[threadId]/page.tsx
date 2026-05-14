import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ForumReplyForm } from "@/components/ForumReplyForm";
import { ForumReportButton } from "@/components/forum/ForumReportButton";
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
        <article className="mt-4 rounded-md border border-[#d9dde3] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-[#b22222]">{thread.category}</p>
          <h1 className="mt-1 text-3xl font-black">{thread.title}</h1>
          <p className="mt-2 text-sm text-[#555]">
            {thread.author?.name ?? "Unknown"} {["forum-moderator", "super-admin", "sub-admin"].includes(thread.author?.role ?? "") ? "/ Moderator" : thread.author?.role === "teacher" ? "/ Teacher" : ""}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{thread.content}</p>
          <div className="mt-4">
            <ForumReportButton targetType="thread" targetId={thread.id} />
          </div>
        </article>
        <div className="mt-6 grid gap-3">
          {thread.replies.map((reply) => (
            <article key={String(reply.id)} className="rounded-md border border-[#d9dde3] bg-white p-4 text-sm shadow-sm">
              <p className="mb-2 text-xs font-black uppercase text-[#667085]">
                {typeof reply.author === "object" && reply.author && "name" in reply.author ? String(reply.author.name) : "Unknown"}
              </p>
              <p>{String(reply.content)}</p>
              <div className="mt-3">
                <ForumReportButton targetType="reply" targetId={String(reply.id)} />
              </div>
            </article>
          ))}
          <ForumReplyForm threadId={thread.id} />
          <div className="rounded-md border border-[#d9dde3] bg-white p-4 text-sm font-bold shadow-sm">
            Visitors: <Link href="/signup" className="!text-[#8c0504]">sign up free</Link> or <Link href="/billing" className="!text-[#8c0504]">subscribe</Link> to reply.
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
