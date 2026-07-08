"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
  PaperClipOutlined,
  PlayCircleFilled,
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

type ChildAccount = DashboardUser & {
  status?: string;
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
  dripDelayMinutes?: number;
  dripUnlocksAt?: string | Date | null;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  attachmentMimeType?: string | null;
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

type DashboardSchoolResource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  fileName: string | null;
  audience: string;
  ageTrack: string;
  schoolScope: string;
  schoolIds: string[];
  district: string | null;
};

type DashboardSubscriberResource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  fileName: string | null;
  ageTrack: string;
};

type DashboardAdminSummary = {
  usersCount: number;
  forumReportsCount: number;
  mentorApplicationsCount: number;
};

type DashboardOrder = {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalCents: number;
  status: string;
  createdAt: string | Date;
};

type DashboardBroadcast = {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
};

type DashboardShellProps = {
  user: DashboardUser;
  videos: DashboardVideo[];
  paidIntroVideo: DashboardVideo | null;
  freePreviewVideos: DashboardVideo[];
  events: DashboardEvent[];
  threads: DashboardThread[];
  schoolResources: DashboardSchoolResource[];
  subscriberResources: DashboardSubscriberResource[];
  orders: DashboardOrder[];
  broadcasts: DashboardBroadcast[];
  childAccounts: ChildAccount[];
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
  parent: "Account Owner",
};

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatUnlockStatus(value: string | Date | null | undefined) {
  if (!value) {
    return "Locked";
  }

  return `Unlocks ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))}`;
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

function formatResourceScope(resource: DashboardSchoolResource) {
  if (resource.schoolScope === "specific-schools") {
    return "Your School";
  }

  if (resource.schoolScope === "district") {
    return resource.district ? `District: ${resource.district}` : "District";
  }

  return "All Schools";
}

function formatResourceAudience(resource: DashboardSchoolResource) {
  if (resource.audience === "teacher") {
    return "Teacher";
  }

  return `Student / ${resource.ageTrack}`;
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
    <section className="min-w-0 rounded-md border-2 border-[#212121] bg-[#f8f3e8] p-4 shadow-[0_4px_0_#111]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bebas text-[clamp(1.85rem,9vw,1.875rem)] uppercase leading-none text-[#202020]">
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
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="min-w-0 overflow-hidden rounded-md bg-[#151515]">
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
          <div className="mt-4 rounded-md border border-[#e4ded1] bg-[#fbf7ef] p-3">
            <p className="flex items-center gap-2 text-xs font-black uppercase text-[#8c0504]">
              <PaperClipOutlined />
              Lesson Document
            </p>
            {nextVideo.attachmentUrl ? (
              <a
                href={nextVideo.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
              >
                Open {nextVideo.attachmentFileName ?? "attached file"}
              </a>
            ) : (
              <p className="mt-1 text-sm text-[#666]">No document is attached to this lesson.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid min-w-0 max-h-[calc(100vh-10rem)] content-start gap-2 overflow-y-auto pr-1">
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
                  <span className="min-w-0">{playlistGroup.playlist}</span>
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
                      className={`flex min-w-0 items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
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
                                ? formatUnlockStatus(video.dripUnlocksAt)
                                : "Unlocked"}
                        </p>
                        {video.attachmentUrl ? (
                          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#8c0504]">
                            <PaperClipOutlined />
                            Document attached
                          </p>
                        ) : null}
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

function UpgradePrompt({ hasPreviewVideos }: { hasPreviewVideos: boolean }) {
  return (
    <section className="rounded-md border-2 border-[#212121] bg-[#faff8d] p-5 text-[#202020] shadow-[0_4px_0_#111]">
      <p className="text-xs font-black uppercase tracking-wide text-[#8c0504]">
        Upgrade available
      </p>
      <h2 className="mt-2 font-bebas text-4xl uppercase leading-none">
        Unlock the full Zelos video library
      </h2>
      <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-[#343434]">
        Your free account includes community, events, and
        {hasPreviewVideos ? " preview lessons." : " access to preview lessons when available."}
        Upgrade to continue through the full age-track curriculum and download subscriber resources.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/billing"
          className="rounded-md border-2 border-[#212121] bg-[#8c0504] px-5 py-3 text-sm font-black !text-white shadow-[0_3px_0_#111]"
        >
          View Subscription Plans
        </Link>
        <Link
          href="/events"
          className="rounded-md border-2 border-[#212121] bg-white px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
        >
          Browse Events
        </Link>
      </div>
    </section>
  );
}

function FreePreviewPanel({ videos }: { videos: DashboardVideo[] }) {
  if (!videos.length) {
    return (
      <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
        No free preview video is available for this age track yet.
      </p>
    );
  }

  return <VideoPanel videos={videos} userRole="subscriber" />;
}

function PaidIntroVideoPrompt({ video }: { video: DashboardVideo }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    void api.post("/api/account/paid-intro-video", {});
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <section className="mt-6 rounded-md border-2 border-[#212121] bg-white p-5 text-[#202020] shadow-[0_4px_0_#111]">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#8c0504]">
            Welcome to Premium
          </p>
          <h2 className="font-bebas text-4xl uppercase leading-none">{video.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black shadow-[0_3px_0_#111]"
        >
          Dismiss
        </button>
      </div>
      <div className="overflow-hidden rounded-md bg-black">
        <video
          className="aspect-video w-full"
          autoPlay
          muted
          playsInline
          controls
          controlsList="nodownload noplaybackrate"
        >
          <source src={video.url ?? ""} />
        </video>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#555]">{video.description}</p>
    </section>
  );
}

function SchoolResourcesPanel({
  resources,
}: {
  resources: DashboardSchoolResource[];
}) {
  const allSchoolResources = resources.filter((resource) => resource.schoolScope === "all-schools");
  const targetedResources = resources.filter((resource) => resource.schoolScope !== "all-schools");

  function renderResources(items: DashboardSchoolResource[], emptyMessage: string) {
    if (!items.length) {
      return (
        <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-[#e4ded1] bg-white p-4 !text-[#202020] transition hover:-translate-y-0.5 hover:shadow-[0_3px_0_#111]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-[#eaf3ff] px-2 py-1 text-[11px] font-black uppercase text-[#175cd3]">
                {formatResourceScope(resource)}
              </span>
              <span className="rounded-sm bg-[#fff3cd] px-2 py-1 text-[11px] font-black uppercase text-[#8c0504]">
                {formatResourceAudience(resource)}
              </span>
            </div>
            <p className="mt-3 font-bold">{resource.title}</p>
            {resource.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-[#555]">{resource.description}</p>
            ) : null}
            <p className="mt-3 truncate text-xs font-black uppercase text-[#8c0504]">
              {resource.fileName ?? resource.resourceType}
            </p>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="mb-3 text-sm font-black uppercase text-[#8c0504]">
          Specific To Your School
        </h3>
        {renderResources(targetedResources, "No school-specific resources are available yet.")}
      </div>
      <div>
        <h3 className="mb-3 text-sm font-black uppercase text-[#8c0504]">
          All Schools
        </h3>
        {renderResources(allSchoolResources, "No all-school resources are available yet.")}
      </div>
    </div>
  );
}

function SubscriberResourcesPanel({
  resources,
}: {
  resources: DashboardSubscriberResource[];
}) {
  const allTrackResources = resources.filter((resource) => resource.ageTrack === "all");
  const targetedResources = resources.filter((resource) => resource.ageTrack !== "all");

  function formatSubscriberAgeTrack(value: string) {
    if (value === "all") return "All tracks";
    return value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function renderResources(items: DashboardSubscriberResource[], emptyMessage: string) {
    if (!items.length) {
      return (
        <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-[#e4ded1] bg-white p-4 !text-[#202020] transition hover:-translate-y-0.5 hover:shadow-[0_3px_0_#111]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-[#eaf3ff] px-2 py-1 text-[11px] font-black uppercase text-[#175cd3]">
                {formatSubscriberAgeTrack(resource.ageTrack)}
              </span>
              <span className="rounded-sm bg-[#fff3cd] px-2 py-1 text-[11px] font-black uppercase text-[#8c0504]">
                {resource.resourceType}
              </span>
            </div>
            <p className="mt-3 font-bold">{resource.title}</p>
            {resource.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-[#555]">{resource.description}</p>
            ) : null}
            <p className="mt-3 truncate text-xs font-black uppercase text-[#8c0504]">
              {resource.fileName ?? resource.resourceType}
            </p>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="mb-3 text-sm font-black uppercase text-[#8c0504]">
          For Your Track
        </h3>
        {renderResources(targetedResources, "No track-specific subscriber resources are available yet.")}
      </div>
      <div>
        <h3 className="mb-3 text-sm font-black uppercase text-[#8c0504]">
          All Subscribers
        </h3>
        {renderResources(allTrackResources, "No all-subscriber resources are available yet.")}
      </div>
    </div>
  );
}

function OrderHistoryPanel({ orders }: { orders: DashboardOrder[] }) {
  if (!orders.length) {
    return (
      <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
        No store orders yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {orders.map((order) => (
        <article key={order.id} className="rounded-md bg-white p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">Order {order.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs uppercase text-[#b22222]">
                {new Date(order.createdAt).toLocaleDateString()} / {order.status}
              </p>
            </div>
            <p className="font-black">
              {(order.totalCents / 100).toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
              })}
            </p>
          </div>
          <p className="mt-2 text-[#555]">
            {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
          </p>
        </article>
      ))}
    </div>
  );
}

function NewsUpdatesPanel({ broadcasts }: { broadcasts: DashboardBroadcast[] }) {
  if (!broadcasts.length) {
    return (
      <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
        No news updates have been posted yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {broadcasts.map((broadcast) => (
        <article key={broadcast.id} className="rounded-md bg-white p-4">
          <p className="text-xs font-black uppercase text-[#b22222]">
            {formatDate(broadcast.createdAt)}
          </p>
          <h3 className="mt-1 font-bold">{broadcast.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#555]">{broadcast.content}</p>
        </article>
      ))}
    </div>
  );
}

function ParentLearnersPanel({ learners }: { learners: ChildAccount[] }) {
  const [items, setItems] = useState(learners);
  const [savingChildId, setSavingChildId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function formatTrack(value: string) {
    if (value === "child") return "Children";
    if (value === "teen") return "Teens";
    if (value === "young-adult") return "Young Adults";
    if (value === "adult") return "Adults";
    return value;
  }

  async function updateChild(childId: string, form: HTMLFormElement) {
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    setSavingChildId(childId);
    setMessage("");

    try {
      const response = await api.patch(`/api/account/children/${childId}`, {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        ...(password ? { password } : {}),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setMessage(result?.error?.message ?? "Unable to update learner.");
        return;
      }

      setItems((current) =>
        current.map((child) =>
          child.id === childId ? { ...child, ...result.data.child } : child,
        ),
      );
      form.reset();
      setMessage("Learner profile updated.");
    } finally {
      setSavingChildId(null);
    }
  }

  if (!items.length) {
    return (
      <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
        Learner profiles will appear here after a family checkout is completed.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {message ? <p className="rounded-md bg-white px-3 py-2 text-sm font-bold text-[#8c0504]">{message}</p> : null}
      {items.map((child) => (
        <form
          key={child.id}
          onSubmit={(event) => {
            event.preventDefault();
            void updateChild(child.id, event.currentTarget);
          }}
          className="grid gap-3 rounded-md bg-white p-4 text-sm md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <input name="name" defaultValue={child.name} className="rounded-md border border-[#d8d2c5] px-3 py-2" />
          <input name="email" type="email" defaultValue={child.email} className="rounded-md border border-[#d8d2c5] px-3 py-2" />
          <input name="password" type="password" placeholder={`${formatTrack(child.ageTrack)} password reset`} className="rounded-md border border-[#d8d2c5] px-3 py-2" />
          <button
            disabled={savingChildId === child.id}
            className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black shadow-[0_3px_0_#111] disabled:opacity-60"
          >
            {savingChildId === child.id ? "Saving..." : "Save"}
          </button>
        </form>
      ))}
    </div>
  );
}

export function DashboardShell({
  user,
  videos,
  paidIntroVideo,
  freePreviewVideos,
  events,
  threads,
  schoolResources,
  subscriberResources,
  orders,
  broadcasts,
  childAccounts,
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
  const isSubscriberUser = ["subscriber", "parent", "child"].includes(user.role);
  const isFreeSubscriber = user.role === "subscriber" && needsVideoSubscription && !hasVideoLibraryAccess;

  return (
    <main className="min-h-screen bg-[#eee6d6] p-3 text-[#202020] sm:p-6">
      <section className="rounded-[1.25rem] bg-[#8c0504] px-4 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.38)] sm:rounded-[2rem] sm:px-9 lg:px-14">
        <header className="container flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex h-12 items-center rounded-sm bg-white px-3 !text-[#343434] shadow-[0_3px_0_rgba(0,0,0,0.18)]"
          >
            <Image
              src="/assets/logo.png"
              alt="Zelos Logo"
              width={140}
              height={80}
              className="h-auto w-[104px] sm:w-[126px]"
            />
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/account"
              className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-3 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111] sm:px-4"
            >
              Account Settings
            </Link>
            <LogoutButton />
          </div>
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
        {isSubscriberUser ? (
          <div className="mb-6">
            <SectionCard title="News & Updates">
              <NewsUpdatesPanel broadcasts={broadcasts} />
            </SectionCard>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Account" value={roleLabels[user.role] ?? user.role} detail={user.email} />
          <StatCard label="Age Track" value={user.ageTrack} detail={`Age captured as ${user.age}`} />
          <StatCard label="Lessons" value={videos.length} detail={`${videos.filter((video) => video.completed).length} completed`} />
          <StatCard label="Access" value={subscriptionLabel} detail="Resolved from current account state" />
        </div>

            {isFreeSubscriber ? (
          <div className="mt-6">
            <UpgradePrompt hasPreviewVideos={freePreviewVideos.length > 0} />
          </div>
        ) : null}

        {paidIntroVideo?.url ? <PaidIntroVideoPrompt video={paidIntroVideo} /> : null}

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="grid min-w-0 gap-6">
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
                    Educator Portal
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
                isFreeSubscriber ? (
                  <FreePreviewPanel videos={freePreviewVideos} />
                ) : (
                  <VideoAccessGate userRole={user.role} />
                )
              ) : (
                <VideoPanel videos={videos} userRole={user.role} />
              )}
            </SectionCard>

            {isSchoolUser ? (
              <SectionCard title={user.role === "teacher" ? "Teacher Resources" : "Student Resources"}>
                <SchoolResourcesPanel resources={schoolResources} />
              </SectionCard>
            ) : null}

            {isSubscriberUser && hasVideoLibraryAccess ? (
              <SectionCard
                title="Subscriber Resources"
                action={
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/toolkit"
                      className="rounded-md border-2 border-[#212121] bg-white px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                    >
                      Money Toolkit
                    </Link>
                    <Link
                      href="/subscriber-content"
                      className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                    >
                      Open Library
                    </Link>
                  </div>
                }
              >
                <SubscriberResourcesPanel resources={subscriberResources} />
              </SectionCard>
            ) : null}

            {user.role === "parent" ? (
              <SectionCard title="Learner Profiles">
                <ParentLearnersPanel learners={childAccounts} />
              </SectionCard>
            ) : null}

            {!isSubscriberUser ? (
              <SectionCard title="News & Updates">
                <NewsUpdatesPanel broadcasts={broadcasts} />
              </SectionCard>
            ) : null}

            <SectionCard
              title="Store Orders"
              action={
                <Link
                  href="/store"
                  className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                >
                  Visit Store
                </Link>
              }
            >
              <OrderHistoryPanel orders={orders} />
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
            {["subscriber", "parent"].includes(user.role) ? (
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
              action={
                <Link
                  href="/events"
                  className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                >
                  All Events
                </Link>
              }
            >
              <div className="grid gap-3">
                {upcomingEvents.length ? (
                  upcomingEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`} className="rounded-md bg-white p-4 !text-[#202020] transition hover:bg-[#fff8d9]">
                      <p className="font-bold">{event.title}</p>
                      <p className="text-xs uppercase text-[#b22222]">
                        {formatDate(event.date)} / {event.type}
                      </p>
                      <p className="mt-2 text-sm text-[#555]">{event.location}</p>
                    </Link>
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
              action={
                <Link
                  href="/forum"
                  className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                >
                  View Forum
                </Link>
              }
            >
              <div className="grid gap-3">
                {threads.slice(0, 4).map((thread) => (
                  <Link key={thread.id} href={`/forum/${thread.id}`} className="rounded-md bg-white p-4 !text-[#202020] transition hover:bg-[#fff8d9]">
                    <p className="font-bold">{thread.title}</p>
                    <p className="text-xs uppercase text-[#b22222]">
                      {thread.category} / {thread.replies.length} replies
                    </p>
                  </Link>
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
