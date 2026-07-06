import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Footer } from "@/components/Footer";
import { ForumReplyForm } from "@/components/ForumReplyForm";
import { ForumDeleteButton } from "@/components/forum/ForumDeleteButton";
import { ForumReportButton } from "@/components/forum/ForumReportButton";
import { ForumRichText } from "@/components/forum/ForumRichText";
import { Header } from "@/components/Header";
import {
  canAccessForum,
  getForumAccessDeniedReason,
  getForumThreadById,
} from "@/lib/forum/service";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token).catch(() => null) : null;
  let canPost = false;
  let canView = false;
  let canModerate = false;
  let readOnlyReason = "Sign in with a Young Adults or account owner profile to access the forum.";

  if (payload?.sub) {
    await connectToDatabase();
    const user = await User.findById(payload.sub).select(
      "ageTrack adminPermissions emailVerifiedAt forumPostingRevoked isBanned role status",
    );
    canView = canAccessForum(user);

    if (user?.isBanned || user?.status === "banned") {
      readOnlyReason = "Banned accounts can read the forum but cannot post or reply.";
    } else if (user?.forumPostingRevoked) {
      readOnlyReason = "Your forum posting access has been revoked.";
    } else if (user && canView) {
      canPost = true;
      readOnlyReason = "";
    } else if (user) {
      readOnlyReason = getForumAccessDeniedReason(user);
    }

    canModerate = Boolean(
      user &&
        user.emailVerifiedAt &&
        !user.isBanned &&
        !["banned", "deactivated", "suspended"].includes(user.status ?? "") &&
        hasAdminPermission(user.role, user.adminPermissions, "forum.moderate"),
    );
  }

  if (!canView) {
    return (
      <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
        <Header />
        <section className="container max-w-[720px] py-16">
          <div className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <p className="eyebrow-red">Community Forum</p>
            <h1 className="font-bebas text-4xl uppercase leading-none">Track access required</h1>
            <p className="mt-3 text-sm font-semibold text-[#555]">{readOnlyReason}</p>
            <Link href="/login" className="mt-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]">
              Log in
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const thread = await getForumThreadById(threadId);

  if (!thread) notFound();

  return (
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#7a0505] px-5 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:px-9 lg:px-24">
        <video className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-multiply" autoPlay loop muted playsInline aria-hidden="true">
          <source src="/assets/bg-video.mp4" type="video/quicktime" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.72),rgba(70,0,0,0.96)_72%)]" />
        <div className="relative z-10">
          <Header />
          <div className="container max-w-[980px] py-14">
            <Link href="/forum" className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]">Back to forum</Link>
            <p className="eyebrow-white mt-10">{thread.category}</p>
            <h1 className="font-bebas text-[clamp(3.6rem,8vw,6.5rem)] uppercase leading-[0.84] text-white">{thread.title}</h1>
            <p className="mt-3 text-white/90">
              {thread.author?.name ?? "Unknown"} {["forum-moderator", "super-admin", "sub-admin"].includes(thread.author?.role ?? "") ? "/ Moderator" : thread.author?.role === "teacher" ? "/ Teacher" : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="container max-w-[920px] py-10">
        <article className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
          <p className="text-xs font-black uppercase text-[#b22222]">{thread.category}</p>
          <div className="mt-4">
            <ForumRichText content={thread.content} />
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-2">
            <ForumReportButton targetType="thread" targetId={thread.id} />
            {canModerate ? <ForumDeleteButton targetType="thread" targetId={thread.id} /> : null}
          </div>
        </article>
        <div className="mt-6 grid gap-3">
          {thread.replies.map((reply) => (
            <article key={String(reply.id)} className="rounded-md border-2 border-[#212121] bg-white p-4 text-sm shadow-[0_3px_0_#111]">
              <p className="mb-2 text-xs font-black uppercase text-[#667085]">
                {typeof reply.author === "object" && reply.author && "name" in reply.author ? String(reply.author.name) : "Unknown"}
                {typeof reply.author === "object" && reply.author && "role" in reply.author && ["forum-moderator", "super-admin", "sub-admin"].includes(String(reply.author.role)) ? " / Moderator" : null}
                {typeof reply.author === "object" && reply.author && "role" in reply.author && String(reply.author.role) === "teacher" ? " / Teacher" : null}
              </p>
              <ForumRichText content={String(reply.content)} />
              <div className="mt-3 flex flex-wrap items-start gap-2">
                <ForumReportButton targetType="reply" targetId={String(reply.id)} />
                {canModerate ? <ForumDeleteButton targetType="reply" targetId={String(reply.id)} /> : null}
              </div>
            </article>
          ))}
          <ForumReplyForm threadId={thread.id} canPost={canPost} readOnlyReason={readOnlyReason} />
          {!payload?.sub ? (
            <div className="rounded-md border-2 border-[#212121] bg-[#faff8d] p-4 text-sm font-black shadow-[0_4px_0_#111]">
              <Link href="/login" className="!text-[#8c0504]">Log in</Link> with a Young Adults or account owner profile to reply.
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}
