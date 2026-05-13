"use client";

import Link from "next/link";
import {
  DownOutlined,
  MenuOutlined,
  SmileFilled,
} from "@ant-design/icons";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Mission", href: "/mission-video" },
  { label: "Program", href: "/financial-literacy" },
  { label: "Community", href: "/forum" },
  { label: "Store", href: "/store" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const navLinkClass =
    "px-1 py-2 font-[Inter] text-[18.1px] font-medium leading-[22.58px] tracking-[-0.722px] !text-[#2C2E2A] transition hover:text-[#cf1e1e]";
  const activeNavLinkClass = "rounded-full bg-[#efe6d8] px-4";

  return (
    <header className="container relative z-20 mx-auto flex items-center gap-3">
      <nav className="flex h-12 flex-1 items-center justify-between gap-4 rounded-sm bg-white px-3 !py-[30px]
       text-[#1b1b1b] shadow-[0_3px_0_rgba(0,0,0,0.18)] ">
        <Link href="/" className="flex items-center font-bold text-[#343434]">
          <Image src="/assets/logo.png" alt="Zelos Logo" width={140} height={80} />
        </Link>

        <div className="hidden items-center gap-5 text-sm font-medium lg:flex">
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
          className="grid h-9 w-9 place-items-center rounded-full bg-[#83ce54] text-[#1d3b31] lg:hidden"
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>

        <button
          className="hidden h-9 w-9 place-items-center rounded-full bg-[#83ce54] text-[#1d3b31] lg:grid"
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>
      </nav>

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
  );
}
