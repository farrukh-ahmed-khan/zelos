import Link from "next/link";
import { cookies } from "next/headers";
import {
  getActiveForumCategories,
  getForumCategorySummary,
  getForumThreads,
} from "@/lib/forum/service";
import { Footer } from "@/components/Footer";
import { ForumThreadForm } from "@/components/ForumThreadForm";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type ForumSearchParams = {
  category?: string | string[];
  q?: string | string[];
  page?: string | string[];
  sort?: string | string[];
};

const THREADS_PER_PAGE = 5;

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildForumHref(params: {
  category?: string;
  page?: number;
  q?: string;
  sort?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.set("category", params.category);
  if (params.page && params.page > 1) searchParams.set("page", String(params.page));
  if (params.q) searchParams.set("q", params.q);
  if (params.sort && params.sort !== "latest") searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  return query ? `/forum?${query}` : "/forum";
}

function parsePage(value: string | string[] | undefined) {
  const parsed = Number(getParamValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<ForumSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeCategoryParam = getParamValue(resolvedSearchParams.category);
  const forumCategories = await getActiveForumCategories();
  const activeCategory = activeCategoryParam && forumCategories.includes(activeCategoryParam)
    ? activeCategoryParam
    : "";
  const searchQuery = (getParamValue(resolvedSearchParams.q) ?? "").trim();
  const requestedPage = parsePage(resolvedSearchParams.page);
  const sort = getParamValue(resolvedSearchParams.sort) === "most-replied" ? "most-replied" : "latest";
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token).catch(() => null) : null;
  let canPost = false;
  let readOnlyReason = "Visitors can read every thread. Sign in to create a public post.";

  if (payload?.sub) {
    await connectToDatabase();
    const user = await User.findById(payload.sub).select("age forumPostingRevoked status isBanned");

    if (user?.isBanned || user?.status === "banned") {
      readOnlyReason = "Banned accounts can read the forum but cannot post or reply.";
    } else if (user?.forumPostingRevoked) {
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
  const normalizedSearch = searchQuery.toLowerCase();
  const filteredThreads = threads
    .filter((thread) => (activeCategory ? thread.category === activeCategory : true))
    .filter((thread) => {
      if (!normalizedSearch) return true;

      return [
        thread.title,
        thread.excerpt,
        thread.category,
        thread.author?.name ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    })
    .sort((a, b) => {
      if (sort === "most-replied") {
        return b.replies.length - a.replies.length;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  const totalPages = Math.max(1, Math.ceil(filteredThreads.length / THREADS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStartIndex = (currentPage - 1) * THREADS_PER_PAGE;
  const paginatedThreads = filteredThreads.slice(pageStartIndex, pageStartIndex + THREADS_PER_PAGE);
  const pageRangeStart = filteredThreads.length ? pageStartIndex + 1 : 0;
  const pageRangeEnd = Math.min(pageStartIndex + THREADS_PER_PAGE, filteredThreads.length);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

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
            <Link
              href={buildForumHref({ q: searchQuery, sort })}
              className={`rounded-md border-2 border-[#212121] p-4 !text-[#202020] shadow-[0_3px_0_#111] transition ${activeCategory ? "bg-white hover:bg-[#fff8d9]" : "bg-[#faff8d]"}`}
            >
              <p className="font-bebas text-2xl uppercase leading-none">All Topics</p>
              <p className="mt-1 text-sm font-bold text-[#8c0504]">{threads.length} threads</p>
            </Link>
            {forumCategories.map((category) => {
              const summary = categories.find((entry) => entry.category === category);
              const isActive = activeCategory === category;
              return (
              <Link
                key={category}
                href={buildForumHref({ category, q: searchQuery, sort })}
                className={`rounded-md border-2 border-[#212121] p-4 !text-[#202020] shadow-[0_3px_0_#111] transition ${isActive ? "bg-[#faff8d]" : "bg-white hover:bg-[#fff8d9]"}`}
              >
                <p className="font-bebas text-2xl uppercase leading-none">{category}</p>
                <p className="mt-1 text-sm font-bold text-[#8c0504]">{summary?.threadCount ?? 0} threads</p>
                {summary?.lastActivityAt ? <p className="mt-1 text-xs text-[#667085]">Last activity {new Date(summary.lastActivityAt).toLocaleDateString()}</p> : null}
              </Link>
            )})}
            <ForumThreadForm
              canPost={canPost}
              categories={forumCategories}
              readOnlyReason={readOnlyReason}
            />
          </aside>
          <div className="rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#e4ded1] pb-4">
              <div>
                <p className="eyebrow-red">Recent Threads</p>
                <h2 className="font-bebas text-4xl uppercase leading-none">Community Board</h2>
              </div>
              <p className="text-sm font-bold text-[#667085]">
                {pageRangeStart}-{pageRangeEnd} of {filteredThreads.length} matched / {threads.length} public thread{threads.length === 1 ? "" : "s"}
              </p>
            </div>
            <form action="/forum" className="mb-4 grid gap-3 rounded-md border border-[#e4ded1] bg-[#fbf7ef] p-3 md:grid-cols-[1fr_220px_160px_auto]">
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Search
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search by title, topic, author..."
                  className="min-h-12 rounded-md border border-[#d8d2c5] bg-white px-3 py-2 text-sm font-medium normal-case text-[#202020] outline-none focus:border-[#8c0504]"
                />
              </label>
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Topic
                <select
                  name="category"
                  defaultValue={activeCategory}
                  className="min-h-12 rounded-md border border-[#d8d2c5] bg-white px-3 py-2 text-sm font-medium normal-case text-[#202020] outline-none focus:border-[#8c0504]"
                >
                  <option value="">All topics</option>
                  {forumCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Sort
                <select
                  name="sort"
                  defaultValue={sort}
                  className="min-h-12 rounded-md border border-[#d8d2c5] bg-white px-3 py-2 text-sm font-medium normal-case text-[#202020] outline-none focus:border-[#8c0504]"
                >
                  <option value="latest">Latest activity</option>
                  <option value="most-replied">Most replies</option>
                </select>
              </label>
              <div className="flex items-end gap-2">
                <button type="submit" className="min-h-12 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black text-[#202020] shadow-[0_3px_0_#111]">
                  Filter
                </button>
                {(activeCategory || searchQuery || sort !== "latest") ? (
                  <Link href="/forum" className="grid min-h-12 place-items-center rounded-md border-2 border-[#212121] bg-white px-4 py-2 text-sm font-black !text-[#202020] shadow-[0_3px_0_#111]">
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
            <div className="grid gap-3">
            {paginatedThreads.map((thread) => (
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
            {!filteredThreads.length ? (
              <p className="rounded-md border-2 border-[#212121] bg-white p-5 text-sm shadow-[0_4px_0_#111]">
                No threads match this filter yet.
              </p>
            ) : null}
            </div>
            {totalPages > 1 ? (
              <nav className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ded1] pt-4" aria-label="Thread pagination">
                <p className="text-sm font-bold text-[#667085]">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={buildForumHref({ category: activeCategory, q: searchQuery, sort, page: currentPage - 1 })}
                      className="grid min-h-10 place-items-center rounded-md border-2 border-[#212121] bg-white px-3 py-2 text-sm font-black !text-[#202020] shadow-[0_3px_0_#111]"
                    >
                      Previous
                    </Link>
                  ) : null}
                  {visiblePages.map((page, index) => {
                    const previousPage = visiblePages[index - 1];
                    const showGap = previousPage && page - previousPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showGap ? <span className="px-1 text-sm font-black text-[#667085]">...</span> : null}
                        <Link
                          href={buildForumHref({ category: activeCategory, q: searchQuery, sort, page })}
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`grid min-h-10 min-w-10 place-items-center rounded-md border-2 border-[#212121] px-3 py-2 text-sm font-black shadow-[0_3px_0_#111] ${
                            page === currentPage ? "bg-[#faff8d] !text-[#202020]" : "bg-white !text-[#202020]"
                          }`}
                        >
                          {page}
                        </Link>
                      </div>
                    );
                  })}
                  {currentPage < totalPages ? (
                    <Link
                      href={buildForumHref({ category: activeCategory, q: searchQuery, sort, page: currentPage + 1 })}
                      className="grid min-h-10 place-items-center rounded-md border-2 border-[#212121] bg-white px-3 py-2 text-sm font-black !text-[#202020] shadow-[0_3px_0_#111]"
                    >
                      Next
                    </Link>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
