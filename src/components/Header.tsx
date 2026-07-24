"use client";

import Link from "next/link";
import {
  CloseOutlined,
  DownOutlined,
  MenuOutlined,
  SmileFilled,
  UserOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Mission", href: "/mission-video" },
  { label: "Programs", href: "/financial-literacy" },
  { label: "Events", href: "/events" },
  { label: "Scholarships", href: "/scholarship-incubator" },
  { label: "Forum", href: "/forum" },
  { label: "Store", href: "/store" },
  { label: "Contact", href: "/contact" },
];

const programLinks = [
  { label: "Financial Literacy", href: "/financial-literacy" },
  // { label: "Children", href: "/financial-literacy?track=child" },
  // { label: "Teens", href: "/financial-literacy?track=teen" },
  // { label: "Young Adults", href: "/financial-literacy?track=young-adult" },
  // { label: "Adults", href: "/financial-literacy?track=adult" },
  { label: "School Curriculum", href: "/school-curriculum" },
  { label: "Mentoring", href: "/mentoring" },
  { label: "Scholarship Incubator", href: "/scholarship-incubator" },
];

function subscribeToHydration(callback: () => void) {
  const frame = window.requestAnimationFrame(callback);
  return () => window.cancelAnimationFrame(frame);
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export function Header() {
  const pathname = usePathname();
  const hasMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinkClass =
    "inline-flex items-center justify-center gap-1 whitespace-nowrap px-1 py-2 font-[Inter] text-[15px] font-medium leading-none tracking-normal !text-[#2C2E2A] transition hover:text-[#cf1e1e] 2xl:gap-1.5 2xl:text-[18.1px]";
  const activeNavLinkClass = "rounded-full bg-[#efe6d8] px-3 2xl:px-4";

  useEffect(() => {
    let isMounted = true;

    api.get("/api/me")
      .then((response) => {
        if (isMounted) {
          setIsLoggedIn(isApiSuccess(response.status));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (!hasMounted) {
    return (
      <div
        aria-hidden="true"
        className="container relative z-20 mx-auto h-[60px]"
        suppressHydrationWarning
      />
    );
  }

  return (
    <>
      <header className="container relative z-20 mx-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <nav className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 rounded-sm bg-white px-3 py-2
         text-[#1b1b1b] shadow-[0_3px_0_rgba(0,0,0,0.18)] ">
          <Link href="/" className="flex min-w-0 items-center font-bold text-[#343434]">
            <Image src="/assets/logo.png" alt="Zelos Logo" width={140} height={80} className="h-auto w-26 2xl:w-35" />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-3 text-sm font-medium xl:flex 2xl:gap-5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`) ||
                    (item.label === "Programs" && pathname === "/school-curriculum") ||
                    (item.label === "Scholarships" && pathname === "/scholarship-incubator");

              if (item.label === "Programs") {
                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className={`${navLinkClass} ${isActive ? activeNavLinkClass : ""}`}
                    >
                      <span>{item.label}</span>
                      <DownOutlined className="shrink-0 text-[11px] leading-none text-[#2C2E2A]!" />
                    </Link>
                    <div className="invisible absolute left-1/2 top-full z-30 grid w-64 -translate-x-1/2 gap-1 rounded-md border-2 border-[#212121] bg-white p-2 opacity-0 shadow-[0_4px_0_#111] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {programLinks.map((program) => (
                        <Link
                          key={program.href}
                          href={program.href}
                          className="rounded-sm px-3 py-2 text-sm font-bold !text-[#2C2E2A] hover:bg-[#efe6d8] hover:!text-[#cf1e1e]"
                        >
                          {program.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${navLinkClass} ${isActive ? activeNavLinkClass : ""}`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#83ce54] text-[#1d3b31] xl:hidden"
            aria-label="Open menu"
          >
            <MenuOutlined />
          </button>
        </nav>

        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          aria-label={isLoggedIn ? "Go to dashboard" : "Go to login"}
          title={isLoggedIn ? "Dashboard" : "Login"}
          className="hidden h-[60px] w-[60px] place-items-center rounded-md bg-white text-[22px] font-bold !text-[#000]
          shadow-[0_3px_0_rgba(0,0,0,0.18)] xl:grid"
        >
          <UserOutlined />
        </Link>

        <Link
          href="/donate"
          className="hidden min-h-[60px] items-center gap-2 rounded-md bg-white px-3 text-sm font-bold !text-[#000]
          shadow-[0_3px_0_rgba(0,0,0,0.18)] xl:flex xl:text-[15px] 2xl:gap-3 2xl:px-4 2xl:text-[18px]"
        >
          Donate Now
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#2d93cf] text-white">
            <SmileFilled />
          </span>
        </Link>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(340px,100vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee] px-5 py-4">
              <Link href="/" className="flex items-center font-bold text-[#343434]" onClick={() => setMobileOpen(false)}>
                <Image src="/assets/logo.png" alt="Zelos Logo" width={110} height={60} />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f4f4] text-[#1b1b1b]"
                aria-label="Close menu"
              >
                <CloseOutlined />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`) ||
                      (item.label === "Programs" && pathname === "/school-curriculum") ||
                      (item.label === "Scholarships" && pathname === "/scholarship-incubator");
                return (
                  <div key={item.href} className="contents">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-4 py-3 text-base font-semibold !text-[#2C2E2A] transition hover:bg-[#efe6d8] hover:!text-[#cf1e1e] ${isActive ? "bg-[#efe6d8] !text-[#cf1e1e]" : ""}`}
                  >
                    {item.label}
                  </Link>
                  {item.label === "Programs"
                    ? programLinks.map((program) => (
                        <Link
                          key={program.href}
                          href={program.href}
                          onClick={() => setMobileOpen(false)}
                          className="ml-4 rounded-md px-4 py-2 text-sm font-semibold !text-[#2C2E2A] hover:bg-[#efe6d8] hover:!text-[#cf1e1e]"
                        >
                          {program.label}
                        </Link>
                      ))
                    : null}
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-[#eee] px-4 py-4 flex flex-col gap-3">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
              >
                <UserOutlined />
                {isLoggedIn ? "Dashboard" : "Log In"}
              </Link>
              <Link
                href="/donate"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-[#2d93cf] px-4 py-3 text-sm font-black !text-white shadow-[0_3px_0_#111]"
              >
                <SmileFilled />
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
