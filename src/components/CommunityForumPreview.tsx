import { RetweetOutlined } from "@ant-design/icons";
import Link from "next/link";
import { getForumThreads } from "@/lib/forum/service";

const FALLBACK_IMAGES = [
  "/assets/fifteen-year-old.png",
  "/assets/first-paycheck.png",
  "/assets/emergency.png",
];

function timeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins || 1} minute${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
}

export async function CommunityForumPreview() {
  const threads = await getForumThreads().catch(() => []);
  const topics = threads.slice(0, 3);

  if (!topics.length) return null;

  return (
    <section className="bg-white px-4 py-16 text-[#111] sm:px-6 lg:py-20">
      <div className="container">
        <div className="mx-auto max-w-355">
          <p className="eyebrow-red mb-1">Forum</p>
          <h2 className="home-section-heading mb-9.5 bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Community Forum Preview
          </h2>

          <div className="row g-4">
            {topics.map((topic, index) => {
              const hasMentorReply = topic.replies.some(
                (r) => (r as { author?: { role?: string } }).author?.role === "mentor",
              );
              const status = hasMentorReply
                ? { label: "Mentor Replied", color: "text-[#5b88ff]" }
                : topic.replies.length > 0
                  ? { label: "Active", color: "text-[#14bd47]" }
                  : { label: "New", color: "text-[#b22222]" };

              const image = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

              return (
                <div className="col-12 col-md-6 col-lg-4" key={topic.id}>
                  <Link
                    href={`/forum?thread=${topic.id}`}
                    className="flex h-full flex-col overflow-hidden rounded-lg border border-[#e8e8e8] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  >
                    <div className="relative h-67.75 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-sm bg-[#b22222] px-3 py-1 font-dm text-[15px] font-bold uppercase leading-none tracking-wide text-white">
                        {topic.category}
                      </span>
                    </div>

                    <div className="flex min-h-49 flex-col px-4 py-4">
                      <p className="font-dm text-[17px] font-medium leading-10 text-[#6777A1]">
                        {timeAgo(topic.createdAt)}
                      </p>
                      <h3 className="mt-5 font-sans text-[24px] font-semibold leading-7.5 text-black">
                        {topic.title}
                      </h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-[#e8e8e8] px-4 py-4">
                      <p className={`font-dm text-[18px] font-bold leading-10 ${status.color}`}>
                        {status.label}
                      </p>
                      <div className="flex items-center gap-2 font-sans text-[17px] font-medium leading-10 text-[#6777A1]">
                        <RetweetOutlined className="text-[17px]" />
                        {topic.replies.length}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-9 text-center">
            <Link
              href="/forum"
              className="inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-2.5 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
            >
              Visit the Forum
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
