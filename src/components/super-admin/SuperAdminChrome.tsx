import Link from "next/link";
import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const navItems = [
  { href: "/super-admin", label: "Overview", icon: DashboardOutlined },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCardOutlined },
  { href: "/super-admin/content", label: "Content", icon: FolderOpenOutlined },
  { href: "/super-admin/access", label: "Access", icon: SafetyCertificateOutlined },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChartOutlined },
];

export function SuperAdminChrome({
  title,
  eyebrow = "Super Admin",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f5f7] text-[#202020]">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-[#d9dde3] bg-[#15171c] text-white lg:border-b-0 lg:border-r">
          <div className="flex min-h-16 items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5 lg:h-16 lg:py-0">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#b22222]">
              <AppstoreOutlined />
            </span>
            <div>
              <Link href="/" className="text-xl font-black !text-white">
                Zelos
              </Link>
              <p className="text-xs font-bold uppercase text-white/55">
                Super Admin
              </p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] lg:grid lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold !text-white/82 transition hover:bg-white/10 hover:!text-white"
                >
                  <Icon className="text-base text-white/60" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 flex gap-2 overflow-x-auto border-t border-white/10 py-3 [scrollbar-width:none] lg:mt-2 lg:grid lg:overflow-visible lg:pt-3 [&::-webkit-scrollbar]:hidden">
            <Link
              href="/admin"
              className="flex shrink-0 rounded-md px-3 py-2 text-sm font-bold !text-white/72 hover:bg-white/10 hover:!text-white"
            >
              Admin Operations
            </Link>
            <Link
              href="/dashboard"
              className="flex shrink-0 rounded-md px-3 py-2 text-sm font-bold !text-white/72 hover:bg-white/10 hover:!text-white"
            >
              User Dashboard
            </Link>
          </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin"
                  className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]"
                >
                  Admin Panel
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#202020] px-3 py-2 text-sm font-bold !text-white"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </header>

          <section className="min-w-0 px-4 py-5 sm:px-6">{children}</section>
        </div>
      </div>
    </main>
  );
}

export function SuperAdminMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className="mt-2 text-3xl font-black leading-none text-[#111827]">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#667085]">{detail}</p>
    </article>
  );
}

export function SuperAdminPanel({
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
      <div className="min-w-0 overflow-x-auto p-4">{children}</div>
    </section>
  );
}

export function SuperAdminTable({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#edf0f3]">
      <div className="divide-y divide-[#edf0f3]">{children}</div>
    </div>
  );
}

export function SuperAdminRow({
  title,
  meta,
  value,
}: {
  title: string;
  meta: string;
  value?: string | number;
}) {
  return (
    <div className="grid gap-2 bg-white px-3 py-3 text-sm hover:bg-[#f8fafc] sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-bold text-[#111827]">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[#667085]">{meta}</p>
      </div>
      {value !== undefined ? (
        <span className="w-fit rounded-sm bg-[#eef2f7] px-2 py-1 text-xs font-black text-[#344054]">
          {value}
        </span>
      ) : null}
    </div>
  );
}
