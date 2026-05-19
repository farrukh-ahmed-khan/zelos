"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
  PlayCircleFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { LogoutButton } from "@/components/LogoutButton";
import { api, isApiSuccess } from "@/lib/api/client";

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
  ageTrack: string;
  interests: string[];
  adminPermissions?: string[];
};

type DashboardVideo = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  ageTrack: string;
  audience: string;
  category: string;
  playlist: string;
  schoolScope?: "global" | "all-schools" | "specific-schools" | "district";
  schoolIds?: string[];
  district?: string | null;
  order: number;
  completed: boolean;
  locked: boolean;
};

type VideoCategoryGroup = {
  category: string;
  playlists: Array<{
    playlist: string;
    videos: DashboardVideo[];
  }>;
};

type DashboardEvent = {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  location: string;
  type: "online" | "physical";
  status: string;
  hasRsvped: boolean;
};

type DashboardThread = {
  id: string;
  title: string;
  category: string;
  replies: unknown[];
  createdAt: string | Date;
};

type DashboardAdminSummary = {
  usersCount: number;
  forumReportsCount: number;
  mentorApplicationsCount: number;
};

type DashboardShellProps = {
  user: DashboardUser;
  videos: DashboardVideo[];
  events: DashboardEvent[];
  threads: DashboardThread[];
  subscriptionLabel: string;
  hasVideoLibraryAccess: boolean;
  needsVideoSubscription: boolean;
  adminSummary?: DashboardAdminSummary;
};

const roleLabels: Record<string, string> = {
  mentee: "Free Mentee",
  subscriber: "Subscriber",
  child: "Family Member",
  teacher: "Teacher",
  student: "Student",
  "forum-moderator": "Forum Moderator",
  "sub-admin": "Sub-Admin",
  "super-admin": "Super Admin",
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatSchoolScope(video: DashboardVideo) {
  if (!["teacher", "student"].includes(video.audience)) {
    return "Subscriber Library";
  }

  if (video.schoolScope === "specific-schools") {
    const count = video.schoolIds?.length ?? 0;
    return count === 1 ? "Specific School" : `${count} Schools`;
  }

  if (video.schoolScope === "district") {
    return video.district ? `District: ${video.district}` : "District";
  }

  return "All Schools";
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="rounded-md border-2 border-[#212121] bg-white p-4 text-[#202020] shadow-[0_4px_0_#111]">
      <p className="text-xs font-black uppercase tracking-wide text-[#b22222]">
        {label}
      </p>
      <p className="mt-2 line-clamp-2 wrap-break-word font-bebas text-[2.5rem] uppercase leading-[0.88] tracking-tight">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#4a4a4a]">{detail}</p>
    </article>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border-2 border-[#212121] bg-[#f8f3e8] p-4 shadow-[0_4px_0_#111]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bebas text-3xl uppercase leading-none text-[#202020]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function VideoPanel({
  videos: initialVideos,
  userRole,
}: {
  videos: DashboardVideo[];
  userRole: string;
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState("");
  const [completingVideoId, setCompletingVideoId] = useState<string | null>(null);
  const completedVideoIds = useMemo(
    () => new Set(videos.filter((video) => video.completed).map((video) => video.id)),
    [videos],
  );
  const groupedVideos = useMemo<VideoCategoryGroup[]>(() => {
    const categories = new Map<string, Map<string, DashboardVideo[]>>();

    for (const video of videos) {
      const categoryName = video.category || "General";
      const playlistName = video.playlist || "General";
      const playlistMap = categories.get(categoryName) ?? new Map<string, DashboardVideo[]>();
      const playlistVideos = playlistMap.get(playlistName) ?? [];

      playlistVideos.push(video);
      playlistMap.set(playlistName, playlistVideos);
      categories.set(categoryName, playlistMap);
    }

    return Array.from(categories.entries()).map(([category, playlistMap]) => ({
      category,
      playlists: Array.from(playlistMap.entries()).map(([playlist, playlistVideos]) => ({
        playlist,
        videos: playlistVideos,
      })),
    }));
  }, [videos]);

  if (!videos.length) {
    return (
      <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
        No videos are assigned yet for this account.
      </p>
    );
  }

  const selectedVideo = selectedVideoId
    ? videos.find((video) => video.id === selectedVideoId && !video.locked)
    : null;
  const nextVideo = selectedVideo ?? videos.find((video) => !video.completed && !video.locked) ?? videos[0];

  async function completeVideo(video: DashboardVideo, watchedPercentage: number) {
    if (video.locked || completedVideoIds.has(video.id) || completingVideoId === video.id) {
      return;
    }

    setCompletionError("");
    setCompletingVideoId(video.id);

    try {
      const response = await api.post(`/api/videos/${video.id}/complete`, { watchedPercentage });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setCompletionError(result?.error?.message ?? "Unable to unlock the next lesson.");
        return;
      }

      setVideos(result.data.videos);
    } finally {
      setCompletingVideoId(null);
    }
  }

  function maybeCompleteFromProgress(video: DashboardVideo, element: HTMLVideoElement) {
    if (!element.duration || Number.isNaN(element.duration)) {
      return;
    }

    const watchedPercentage = Math.min(
      100,
      Math.round((element.currentTime / element.duration) * 100),
    );

    if (watchedPercentage >= 95) {
      void completeVideo(video, watchedPercentage);
    }
  }

  return (
    <div className="grid gap-3">
      {completionError ? (
        <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">
          {completionError}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-md bg-[#151515]">
        {nextVideo.url ? (
          <video
            key={nextVideo.id}
            className="aspect-video w-full bg-black"
            controls
            controlsList="nodownload noplaybackrate"
            preload="metadata"
            onTimeUpdate={(event) => maybeCompleteFromProgress(nextVideo, event.currentTarget)}
            onEnded={(event) => maybeCompleteFromProgress(nextVideo, event.currentTarget)}
          >
            <source src={nextVideo.url} />
          </video>
        ) : (
          <div className="grid aspect-video place-items-center text-white">
            <LockOutlined className="text-4xl" />
          </div>
        )}
        <div className="bg-white p-4 text-[#202020]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase text-[#b22222]">
              {userRole === "teacher" ? "Teacher Preview" : userRole === "student" ? "Student Lesson" : "Next Lesson"}
            </p>
            {["teacher", "student"].includes(nextVideo.audience) ? (
              <span className="rounded-sm bg-[#eaf3ff] px-2 py-1 text-[11px] font-black uppercase text-[#175cd3]">
                {formatSchoolScope(nextVideo)}
              </span>
            ) : null}
          </div>
          <h3 className="font-bebas text-3xl uppercase leading-none">
            {nextVideo.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#4a4a4a]">
            {nextVideo.description}
          </p>
        </div>
      </div>

      <div className="grid content-start gap-2">
        {groupedVideos.map((categoryGroup) => (
          <div key={categoryGroup.category} className="grid gap-2 rounded-md bg-white p-2">
            <p className="rounded-sm bg-[#8c0504] px-2 py-1 text-xs font-black uppercase text-white">
              {categoryGroup.category}
            </p>
            {categoryGroup.playlists.map((playlistGroup) => (
              <details
                key={`${categoryGroup.category}-${playlistGroup.playlist}`}
                open={playlistGroup.videos.some((video) => video.id === nextVideo.id)}
                className="group rounded-md border border-[#e4ded1] bg-[#fbf7ef]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-black uppercase text-[#555]">
                  <span>{playlistGroup.playlist}</span>
                  <span className="rounded-sm bg-white px-2 py-1 text-[11px] text-[#8c0504]">
                    {playlistGroup.videos.length} lesson{playlistGroup.videos.length === 1 ? "" : "s"}
                  </span>
                </summary>
                <div className="grid gap-2 border-t border-[#e4ded1] p-2">
                  {playlistGroup.videos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      disabled={video.locked}
                      onClick={() => setSelectedVideoId(video.id)}
                      className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                        nextVideo.id === video.id
                          ? "bg-[#faff8d] ring-2 ring-[#8c0504]"
                          : "bg-white"
                      } ${video.locked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:bg-[#fff8d9]"}`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee6d6] text-[#b22222]">
                        {video.completed ? <CheckCircleOutlined /> : video.locked ? <LockOutlined /> : <PlayCircleFilled />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-bold text-[#202020]">{video.title}</p>
                          {["teacher", "student"].includes(video.audience) ? (
                            <span className="rounded-sm bg-[#eaf3ff] px-2 py-0.5 text-[10px] font-black uppercase text-[#175cd3]">
                              {formatSchoolScope(video)}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-[#666]">
                          {completingVideoId === video.id
                            ? "Completing..."
                            : video.completed
                              ? "Completed / replay"
                              : video.locked
                                ? "Locked"
                                : "Unlocked"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function VideoAccessGate({ userRole }: { userRole: string }) {
  const isChild = userRole === "child";

  return (
    <div className="rounded-md bg-white px-4 py-4 text-sm text-[#4a4a4a]">
      <p className="font-bold text-[#202020]">
        Active subscription required
      </p>
      <p className="mt-1 leading-relaxed">
        {isChild
          ? "This account can view lessons when subscription access is active."
          : "Subscribe to unlock the video library for your age track."}
      </p>
      {!isChild ? (
        <Link
          href="/billing"
          className="mt-3 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
        >
          View Plans
        </Link>
      ) : null}
    </div>
  );
}

export function DashboardShell({
  user,
  videos,
  events,
  threads,
  subscriptionLabel,
  hasVideoLibraryAccess,
  needsVideoSubscription,
  adminSummary,
}: DashboardShellProps) {
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .slice(0, 3);
  const isAdmin = ["forum-moderator", "sub-admin", "super-admin"].includes(user.role);
  const isSchoolUser = ["teacher", "student"].includes(user.role);

  return (
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="rounded-[2rem] bg-[#8c0504] px-5 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.38)] sm:px-9 lg:px-14">
        <header className="container flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex h-12 items-center gap-3 rounded-sm bg-white px-4 text-2xl font-bold !text-[#343434] shadow-[0_3px_0_rgba(0,0,0,0.18)]"
          >
            <span className="grid h-8 w-8 place-items-center text-[#ff3038]">
              <PlayCircleFilled className="text-[22px]" />
            </span>
            Zelos
          </Link>

          <LogoutButton />
        </header>

        <div className="container py-10">
          <p className="eyebrow-white">
            {roleLabels[user.role] ?? user.role}
          </p>
          <h1 className="font-bebas text-[clamp(3rem,7vw,5.8rem)] uppercase leading-[0.86]">
            Welcome, {user.name}
          </h1>
          <p className="mt-3 max-w-[760px] text-lg leading-snug text-white/90">
            Your role-based Zelos workspace is connected to the platform APIs
            available today, with upcoming modules reserved in the layout.
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Account" value={roleLabels[user.role] ?? user.role} detail={user.email} />
          <StatCard label="Age Track" value={user.ageTrack} detail={`Age captured as ${user.age}`} />
          <StatCard label="Lessons" value={videos.length} detail={`${videos.filter((video) => video.completed).length} completed`} />
          <StatCard label="Access" value={subscriptionLabel} detail="Resolved from current account state" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="grid gap-6">
            <SectionCard
              title={
                isSchoolUser
                  ? user.role === "teacher"
                    ? "Educator Portal"
                    : "Student Lessons"
                  : "Video Library"
              }
              action={
                user.role === "teacher" ? (
                  <Link
                    href="/educator"
                    className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                  >
                    Invite Students
                  </Link>
                ) : user.role === "mentee" ? (
                  <Link
                    href="/signup"
                    className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                  >
                    Upgrade
                  </Link>
                ) : null
              }
            >
              {needsVideoSubscription && !hasVideoLibraryAccess ? (
                <VideoAccessGate userRole={user.role} />
              ) : (
                <VideoPanel videos={videos} userRole={user.role} />
              )}
            </SectionCard>

            {isAdmin ? (
              <SectionCard title="Admin Control Room">
                <Link
                  href={user.role === "super-admin" ? "/super-admin" : "/admin"}
                  className="mb-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                >
                  {user.role === "super-admin" ? "Open Super Admin" : "Open Admin Panel"}
                </Link>
                <div className="grid gap-3 md:grid-cols-3">
                  <StatCard
                    label="Users"
                    value={adminSummary?.usersCount ?? 0}
                    detail="Registered accounts"
                  />
                  <StatCard
                    label="Reports"
                    value={adminSummary?.forumReportsCount ?? 0}
                    detail="Forum moderation queue"
                  />
                  <StatCard
                    label="Mentors"
                    value={adminSummary?.mentorApplicationsCount ?? 0}
                    detail="Applications inbox"
                  />
                </div>
              </SectionCard>
            ) : null}

          </div>

          <aside className="grid content-start gap-6">
            {user.role === "subscriber" ? (
              <SectionCard
                title="Subscription"
                action={<CreditCardOutlined className="text-2xl text-[#b22222]" />}
              >
                <div className="rounded-md bg-white px-4 py-4 text-sm text-[#4a4a4a]">
                  <p className="font-bold text-[#202020]">
                    Current access: {subscriptionLabel}
                  </p>
                  <p className="mt-1 leading-relaxed">
                    View your current subscription, upgrade plans, update payment details, or open the billing portal.
                  </p>
                  <Link
                    href="/billing"
                    className="mt-3 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                  >
                    Manage Billing
                  </Link>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard
              title="Upcoming Events"
              action={<CalendarOutlined className="text-2xl text-[#b22222]" />}
            >
              <div className="grid gap-3">
                {upcomingEvents.length ? (
                  upcomingEvents.map((event) => (
                    <article key={event.id} className="rounded-md bg-white p-4">
                      <p className="font-bold">{event.title}</p>
                      <p className="text-xs uppercase text-[#b22222]">
                        {formatDate(event.date)} / {event.type}
                      </p>
                      <p className="mt-2 text-sm text-[#555]">{event.location}</p>
                    </article>
                  ))
                ) : (
                  <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
                    No upcoming events are scheduled yet.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Community"
              action={<TeamOutlined className="text-2xl text-[#b22222]" />}
            >
              <div className="grid gap-3">
                {threads.slice(0, 4).map((thread) => (
                  <article key={thread.id} className="rounded-md bg-white p-4">
                    <p className="font-bold">{thread.title}</p>
                    <p className="text-xs uppercase text-[#b22222]">
                      {thread.category} / {thread.replies.length} replies
                    </p>
                  </article>
                ))}
                {!threads.length ? (
                  <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
                    No forum threads yet.
                  </p>
                ) : null}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </main>
  );
}
