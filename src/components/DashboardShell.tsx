import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  LockOutlined,
  PlayCircleFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { LogoutButton } from "@/components/LogoutButton";

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
  order: number;
  completed: boolean;
  locked: boolean;
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

type DashboardChild = {
  id: string;
  name: string;
  age: number;
  ageTrack: string;
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
  childrenAccounts: DashboardChild[];
  subscriptionLabel: string;
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
      <p className="mt-2 font-bebas text-4xl leading-none">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#4a4a4a]">{detail}</p>
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

function VideoPanel({ videos, userRole }: { videos: DashboardVideo[]; userRole: string }) {
  if (!videos.length) {
    return (
      <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
        No videos are assigned yet for this account.
      </p>
    );
  }

  const nextVideo = videos.find((video) => !video.completed && !video.locked) ?? videos[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-md bg-[#151515]">
        {nextVideo.url ? (
          <video
            className="aspect-video w-full bg-black"
            controls
            controlsList="nodownload noplaybackrate"
            preload="metadata"
          >
            <source src={nextVideo.url} />
          </video>
        ) : (
          <div className="grid aspect-video place-items-center text-white">
            <LockOutlined className="text-4xl" />
          </div>
        )}
        <div className="bg-white p-4 text-[#202020]">
          <p className="text-xs font-black uppercase text-[#b22222]">
            {userRole === "teacher" ? "Teacher Preview" : "Next Lesson"}
          </p>
          <h3 className="font-bebas text-3xl uppercase leading-none">
            {nextVideo.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#4a4a4a]">
            {nextVideo.description}
          </p>
        </div>
      </div>

      <div className="grid content-start gap-2">
        {videos.slice(0, 6).map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee6d6] text-[#b22222]">
              {video.completed ? <CheckCircleOutlined /> : video.locked ? <LockOutlined /> : <PlayCircleFilled />}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-[#202020]">{video.title}</p>
              <p className="text-xs text-[#666]">
                {video.completed ? "Completed" : video.locked ? "Locked" : "Unlocked"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  videos,
  events,
  threads,
  childrenAccounts,
  subscriptionLabel,
  adminSummary,
}: DashboardShellProps) {
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .slice(0, 3);
  const isAdmin = ["forum-moderator", "sub-admin", "super-admin"].includes(user.role);
  const isSchoolUser = ["teacher", "student"].includes(user.role);
  const canManageFamily = user.role === "subscriber";

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
                user.role === "mentee" ? (
                  <Link
                    href="/signup"
                    className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
                  >
                    Upgrade
                  </Link>
                ) : null
              }
            >
              <VideoPanel videos={videos} userRole={user.role} />
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

            {canManageFamily ? (
              <SectionCard title="Family Accounts">
                {childrenAccounts.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {childrenAccounts.map((child) => (
                      <article key={child.id} className="rounded-md bg-white p-4">
                        <p className="font-bold">{child.name}</p>
                        <p className="text-sm text-[#666]">
                          {child.ageTrack} / age {child.age}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md bg-white px-4 py-3 text-sm text-[#4a4a4a]">
                    No family member accounts have been added yet.
                  </p>
                )}
              </SectionCard>
            ) : null}
          </div>

          <aside className="grid content-start gap-6">
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
