import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChartOutlined,
  CalendarOutlined,
  DollarOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  FormOutlined,
  MailOutlined,
  PlaySquareOutlined,
  SafetyCertificateOutlined,
  TagsOutlined,
  TeamOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

const navItems = [
  { href: "/admin", label: "Overview", icon: DashboardOutlined },
  { href: "/admin/videos", label: "Videos", icon: PlaySquareOutlined },
  { href: "/admin/content-categories", label: "Categories", icon: FolderOpenOutlined },
  { href: "/admin/static-pages", label: "Static Pages", icon: FormOutlined },
  { href: "/admin/subscription-plans", label: "Plans", icon: TagsOutlined },
  { href: "/admin/users", label: "Users", icon: TeamOutlined },
  { href: "/admin/invites", label: "Invites", icon: UserAddOutlined },
  { href: "/admin/schools", label: "Schools", icon: SafetyCertificateOutlined },
  { href: "/admin/subscriber-content", label: "Subscriber Content", icon: FolderOpenOutlined },
  { href: "/admin/school-content", label: "School Content", icon: FolderOpenOutlined },
  { href: "/admin/toolkit", label: "Toolkit", icon: FormOutlined },
  { href: "/admin/forum-moderation", label: "Moderation", icon: SafetyCertificateOutlined },
  { href: "/admin/scholarships", label: "Scholarships", icon: SafetyCertificateOutlined },
];

const secondaryItems = [
  { href: "/admin/events", label: "Events", icon: CalendarOutlined },
  { href: "/admin/orders", label: "Store Orders", icon: DollarOutlined },
  { href: "/admin/donations", label: "Donations", icon: DollarOutlined },
  { href: "/admin/reports", label: "Reports", icon: SafetyCertificateOutlined },
  { href: "/admin/analytics", label: "Analytics", icon: BarChartOutlined },
  { href: "/admin/emails", label: "Email Outbox", icon: MailOutlined },
  { href: "/admin/forms", label: "Forms", icon: FormOutlined },
];

export function AdminChrome({
  title,
  eyebrow = "Admin",
  children,
  isSuperAdmin = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  isSuperAdmin?: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#f4f5f7] text-[#202020]">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-r border-[#d9dde3] bg-white">
          <div className="flex h-16 items-center gap-3 border-b border-[#edf0f3] px-5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#8c0504] text-white">
              <UsergroupAddOutlined />
            </span>
            <div>
              <Link href="/" className="text-xl font-black !text-[#202020]">
                Zelos
              </Link>
              <p className="text-xs font-bold uppercase text-[#667085]">
                Admin Console
              </p>
            </div>
          </div>

          <nav className="grid gap-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold !text-[#344054] transition hover:bg-[#f2f4f7] hover:!text-[#8c0504]"
                >
                  <Icon className="text-base text-[#8c0504]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 border-t border-[#edf0f3] pt-3">
            {secondaryItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold !text-[#667085] hover:bg-[#f2f4f7] hover:!text-[#202020]"
                >
                  <Icon className="text-sm" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {isSuperAdmin ? (
            <div className="mx-3 mt-3 border-t border-[#edf0f3] pt-3">
              <Link
                href="/super-admin"
                className="flex rounded-md bg-[#15171c] px-3 py-2 text-sm font-bold !text-white"
              >
                Super Admin
              </Link>
            </div>
          ) : null}
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[#d9dde3] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#8c0504]">
                  {eyebrow}
                </p>
                <h1 className="text-2xl font-black tracking-normal text-[#202020]">
                  {title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {isSuperAdmin ? (
                  <Link
                    href="/super-admin"
                    className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]"
                  >
                    Super Admin
                  </Link>
                ) : null}
                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#202020] px-3 py-2 text-sm font-bold !text-white"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </header>

          <section className="px-4 py-5 sm:px-6">{children}</section>
        </div>
      </div>
    </main>
  );
}

export function AdminMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <article className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-[#667085]">{label}</p>
      <p className="mt-2 text-3xl font-black leading-none text-[#111827]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[#667085]">{detail}</p> : null}
    </article>
  );
}

export function AdminPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-md border border-[#d9dde3] bg-white shadow-sm">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-[#edf0f3] px-4 py-3">
        <h2 className="text-base font-black tracking-normal text-[#111827]">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function AdminRow({
  title,
  meta,
  href,
}: {
  title: string;
  meta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="grid gap-2 border-b border-[#edf0f3] px-3 py-3 text-sm !text-[#202020] last:border-b-0 hover:bg-[#f8fafc] sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="min-w-0">
        <p className="truncate font-bold text-[#111827]">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[#667085]">{meta}</p>
      </div>
      <span className="text-xs font-black uppercase text-[#8c0504]">Open</span>
    </Link>
  );
}
