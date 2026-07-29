"use client";

import Link from "next/link";
import {
  CloseOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { api, isApiSuccess } from "@/lib/api/client";
import { HeaderCartButton } from "@/components/HeaderCartButton";
import styles from "./Header.module.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/financial-literacy" },
  { label: "Events", href: "/events" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Forum", href: "/forum" },
  { label: "Store", href: "/store" },
  { label: "Contact", href: "/contact" },
];

const aboutLinks = [
  { label: "About Zelos", href: "/about" },
  { label: "The Mission", href: "/mission" },
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
  const [openMobileDropdown, setOpenMobileDropdown] = useState<
    "About" | "Programs" | null
  >(null);
  const navLinkClass =
    "inline-flex items-center justify-center gap-1 whitespace-nowrap px-1 py-3 font-[Inter] text-[14px] font-medium leading-none tracking-normal text-[#191919] transition hover:text-[#ed2631] 2xl:gap-1.5 2xl:text-[17px]";

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

      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setMobileOpen(false);
        }
      };

      window.addEventListener("keydown", closeOnEscape);

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", closeOnEscape);
      };
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenMobileDropdown(null);
  };

  if (!hasMounted) {
    return (
      <div
        aria-hidden="true"
        className={`${styles.headerRoot} site-header relative z-20 h-[60px]`}
        suppressHydrationWarning
      />
    );
  }

  return (
    <>
      <header className={`${styles.headerRoot} site-header relative z-20 flex min-w-0 items-center gap-2 sm:gap-3`}>
        <nav className="grid min-h-[60px] min-w-0 flex-1 grid-cols-[minmax(44px,1fr)_44px_44px] items-center gap-2 rounded-[7px] bg-white px-3 py-2 text-[#1b1b1b] shadow-[0_3px_0_#e02d36] sm:px-4 xl:flex xl:gap-3">
          <Link href="/" aria-label="Zelos home" className={styles.logoCrop}>
            <Image
              src="/assets/header-brand-logo.png"
              alt=""
              width={6535}
              height={5262}
              priority
              unoptimized
              className={styles.logoArtwork}
            />
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-2 text-sm font-medium xl:flex 2xl:gap-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`) ||
                    (item.label === "About" && pathname === "/mission") ||
                    (item.label === "Programs" && pathname === "/school-curriculum") ||
                    (item.label === "Scholarships" && pathname === "/scholarships");

              if (item.label === "About" || item.label === "Programs") {
                const dropdownLinks = item.label === "About" ? aboutLinks : programLinks;

                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className={`${navLinkClass} ${isActive ? styles.activeNav : ""}`}
                    >
                      <span>{item.label}</span>
                      <DownOutlined className="shrink-0 text-[11px] leading-none text-[#2C2E2A]!" />
                    </Link>
                    <div className="invisible absolute left-1/2 top-full z-30 grid w-64 -translate-x-1/2 gap-1 rounded-md border-2 border-[#212121] bg-white p-2 opacity-0 shadow-[0_4px_0_#111] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {dropdownLinks.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.href}
                          href={dropdownItem.href}
                          className="rounded-sm px-3 py-2 text-sm font-bold !text-[#2C2E2A] hover:bg-[#efe6d8] hover:!text-[#cf1e1e]"
                        >
                          {dropdownItem.label}
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
                  className={`${navLinkClass} ${isActive ? styles.activeNav : ""}`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <HeaderCartButton className="justify-self-end xl:ml-0" />

          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            aria-label={isLoggedIn ? "Go to dashboard" : "Go to login"}
            title={isLoggedIn ? "Dashboard" : "Login"}
            className="hidden h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[#ed2631] bg-white !text-[#000] xl:grid"
          >
            <Image
              src="/assets/header-profile.gif"
              alt=""
              width={640}
              height={640}
              unoptimized
              className={styles.profileImage}
            />
          </Link>

          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center justify-self-end rounded-full bg-[#ed2631] text-[18px] leading-none text-white transition hover:bg-[#cf1e28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed2631] xl:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <MenuOutlined />
          </button>
        </nav>

        <Link
          href="/donate"
          className="hidden min-h-[60px] shrink-0 items-center gap-2 rounded-[7px] bg-white px-4 text-sm font-semibold !text-[#111] shadow-[0_3px_0_#e02d36] xl:flex xl:text-[15px] 2xl:gap-3 2xl:px-5 2xl:text-[17px]"
        >
          Donate Now
          <Image
            src="/assets/header-heart.png"
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 object-contain"
          />
        </Link>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation"
            className="absolute right-0 top-0 flex h-dvh w-[min(360px,100vw)] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#eee] px-5 py-4">
              <Link
                href="/"
                aria-label="Zelos home"
                className={styles.logoCrop}
                onClick={closeMobileMenu}
              >
                <Image
                  src="/assets/header-brand-logo.png"
                  alt=""
                  width={6535}
                  height={5262}
                  unoptimized
                  className={styles.logoArtwork}
                />
              </Link>
              <button
                onClick={closeMobileMenu}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#f4f4f4] text-[17px] leading-none text-[#1b1b1b] transition hover:bg-[#e9e9e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed2631]"
                aria-label="Close menu"
              >
                <CloseOutlined />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`) ||
                      (item.label === "About" && pathname === "/mission") ||
                      (item.label === "Programs" &&
                        programLinks.some(
                          (program) =>
                            pathname === program.href ||
                            pathname.startsWith(`${program.href}/`),
                        ));
                const dropdownLinks =
                  item.label === "About"
                    ? aboutLinks
                    : item.label === "Programs"
                      ? programLinks
                      : [];

                if (dropdownLinks.length) {
                  const dropdownLabel = item.label as "About" | "Programs";
                  const isExpanded = openMobileDropdown === dropdownLabel;
                  const menuId = `mobile-${dropdownLabel.toLowerCase()}-menu`;

                  return (
                    <div
                      key={item.href}
                      className={`overflow-hidden rounded-lg border transition ${
                        isActive
                          ? "border-[#ed2631] bg-[#fff7f5]"
                          : "border-transparent"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMobileDropdown(isExpanded ? null : dropdownLabel)
                        }
                        aria-expanded={isExpanded}
                        aria-controls={menuId}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-base font-bold transition hover:bg-[#efe6d8] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#ed2631] ${
                          isActive ? "text-[#cf1e1e]" : "text-[#2C2E2A]"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f2e8dc] text-[11px] text-[#2C2E2A] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        >
                          <DownOutlined />
                        </span>
                      </button>

                      {isExpanded ? (
                        <div
                          id={menuId}
                          className="grid gap-1 border-t border-[#eadfd2] bg-white px-3 py-2"
                        >
                          {dropdownLinks.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              href={dropdownItem.href}
                              onClick={closeMobileMenu}
                              className={`flex min-h-11 items-center rounded-md border-l-2 px-4 py-2.5 text-sm font-semibold transition ${
                                pathname === dropdownItem.href
                                  ? "border-[#ed2631] bg-[#efe6d8] !text-[#cf1e1e]"
                                  : "border-transparent !text-[#2C2E2A] hover:border-[#ed2631] hover:bg-[#efe6d8] hover:!text-[#cf1e1e]"
                              }`}
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex min-h-12 items-center rounded-lg px-4 py-3 text-base font-semibold !text-[#2C2E2A] transition hover:bg-[#efe6d8] hover:!text-[#cf1e1e] ${
                      isActive ? "bg-[#efe6d8] !text-[#cf1e1e]" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#eee] px-4 py-4 flex flex-col gap-3">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
              >
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-[#ed2631] bg-white">
                  <Image
                    src="/assets/header-profile.gif"
                    alt=""
                    width={640}
                    height={640}
                    unoptimized
                    className="h-7 w-7 object-cover"
                  />
                </span>
                {isLoggedIn ? "Dashboard" : "Log In"}
              </Link>
              <Link
                href="/donate"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-white px-4 py-3 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
              >
                Donate Now
                <Image
                  src="/assets/header-heart.png"
                  alt=""
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
