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
import { useEffect, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Mission", href: "/mission-video" },
  { label: "Program", href: "/financial-literacy" },
  { label: "Events", href: "/events" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Forum", href: "/forum" },
  { label: "Store", href: "/store" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinkClass =
    "px-1 py-2 font-[Inter] text-[18.1px] font-medium leading-[22.58px] tracking-[-0.722px] !text-[#2C2E2A] transition hover:text-[#cf1e1e]";
  const activeNavLinkClass = "rounded-full bg-[#efe6d8] px-4";

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
    setMobileOpen(false);
  }, [pathname]);

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

  return (
    <>
      <header className="container relative z-20 mx-auto flex items-center gap-3">
        <nav className="flex h-12 flex-1 items-center justify-between gap-4 rounded-sm bg-white px-3 !py-[30px]
         text-[#1b1b1b] shadow-[0_3px_0_rgba(0,0,0,0.18)] ">
          <Link href="/" className="flex items-center font-bold text-[#343434]">
            <Image src="/assets/logo.png" alt="Zelos Logo" width={140} height={80} />
          </Link>

          <div className="hidden items-center gap-5 text-sm font-medium xl:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${navLinkClass} ${isActive ? activeNavLinkClass : ""}`}
                >
                  {item.label}
                  {item.label === "Program" ? <DownOutlined className="ml-1 text-[10px]" /> : null}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#83ce54] text-[#1d3b31] xl:hidden"
            aria-label="Open menu"
          >
            <MenuOutlined />
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            className="hidden h-9 w-9 place-items-center rounded-full bg-[#83ce54] text-[#1d3b31] lg:grid xl:hidden"
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
          shadow-[0_3px_0_rgba(0,0,0,0.18)] md:grid"
        >
          <UserOutlined />
        </Link>

        <Link
          href="/donate"
          className="hidden !py-[15px] items-center gap-4 rounded-md bg-white px-4 text-sm font-bold !text-[#000]
          shadow-[0_3px_0_rgba(0,0,0,0.18)] md:flex text-[18px]"
        >
          Donate Us
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
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-4 py-3 text-base font-semibold !text-[#2C2E2A] transition hover:bg-[#efe6d8] hover:!text-[#cf1e1e] ${isActive ? "bg-[#efe6d8] !text-[#cf1e1e]" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#eee] px-4 py-4 flex flex-col gap-3">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="flex items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
              >
                <UserOutlined />
                {isLoggedIn ? "Dashboard" : "Log In"}
              </Link>
              <Link
                href="/donate"
                className="flex items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-[#2d93cf] px-4 py-3 text-sm font-black !text-white shadow-[0_3px_0_#111]"
              >
                <SmileFilled />
                Donate Us
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
