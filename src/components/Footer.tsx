import Link from "next/link";
import {
  CreditCardOutlined,
  FacebookFilled,
  InstagramOutlined,
  MailOutlined,
  XOutlined,
  YoutubeFilled,
} from "@ant-design/icons";

const footerGroups = [
  {
    title: "Program",
    links: [
      { label: "Financial Literacy", href: "/financial-literacy" },
      { label: "School Curriculum", href: "/school-curriculum" },
      { label: "Mentoring", href: "/mentoring" },
      { label: "Scholarship", href: "/scholarships" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Events", href: "/events" },
      { label: "Community Forum", href: "/forum" },
      { label: "Swag Store", href: "/store" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "About", href: "/about" },
      { label: "Donate", href: "/donate" },
      { label: "Mission", href: "/mission-video" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white px-4 py-12 text-[#202020] sm:px-6">
      <div className="container">
        <div className="row g-4">
          {footerGroups.map((group) => (
            <div className="col-12 col-md-6 col-lg-3" key={group.title}>
              <div className="h-full rounded-md border border-[#dedede] px-5 py-7 sm:px-8 sm:py-8">
                <h2 className="font-bebas text-2xl uppercase leading-none text-[#1d1d1d]">
                  {group.title}
                </h2>
                <nav className="mt-6 flex flex-col gap-4">
                  {group.links.map((link) => (
                    <Link
                      href={link.href}
                      className="font-bebas text-lg uppercase leading-none !text-[#969696] transition hover:!text-[#b22222]"
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          ))}

          <div className="col-12 col-md-6 col-lg-3">
            <div className="h-full rounded-md border border-[#dedede] px-5 py-7 sm:px-8 sm:py-8">
              <h2 className="font-bebas text-2xl uppercase leading-none text-[#1d1d1d]">
                Get In Touch
              </h2>
              <a
                href="mailto:support@zelos.com"
                className="mt-6 inline-flex items-center gap-2 text-sm uppercase !text-[#969696]"
              >
                <MailOutlined />
                support@zelos.com
              </a>
              <a
                href="tel:+14065550120"
                className="mt-3 block font-bebas text-[clamp(1.85rem,10vw,2.35rem)] uppercase leading-none !text-[#1d1d1d]"
              >
                +1 406 555-0120
              </a>
              <p className="mt-3 font-bebas text-sm uppercase leading-none text-[#969696]">
                2972 Westheimer Rd. Santa Ana, Illinois, USA
              </p>

              <div className="mt-7 flex gap-2">
                <a href="#" className="grid h-8 w-8 place-items-center rounded-sm bg-[#b22222] !text-white" aria-label="Facebook">
                  <FacebookFilled />
                </a>
                <a href="#" className="grid h-8 w-8 place-items-center rounded-sm bg-[#f4f4f4] !text-[#cfcfcf]" aria-label="Instagram">
                  <InstagramOutlined />
                </a>
                <a href="#" className="grid h-8 w-8 place-items-center rounded-sm bg-[#f4f4f4] !text-[#cfcfcf]" aria-label="X">
                  <XOutlined />
                </a>
                <a href="#" className="grid h-8 w-8 place-items-center rounded-sm bg-[#f4f4f4] !text-[#cfcfcf]" aria-label="YouTube">
                  <YoutubeFilled />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 h-[180px] overflow-hidden border-b border-[#e9e9e9] bg-white sm:h-[260px] lg:h-[300px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 600" preserveAspectRatio="none" aria-label="Zelos">
            <defs>
              <mask id="zelos-video-text-mask">
                <rect width="1600" height="600" fill="black" />
                <text x="800" y="300" fill="white" fontFamily="Bebas Neue, sans-serif" fontSize="546.689" fontStyle="normal" fontWeight="400" letterSpacing="108" textAnchor="middle" dominantBaseline="middle">
                  ZELOS
                </text>
              </mask>
            </defs>
            <foreignObject width="1600" height="600" mask="url(#zelos-video-text-mask)">
              <video className="h-full w-full object-cover" autoPlay loop muted playsInline aria-hidden="true">
                <source src="/assets/zelos-bg-gradient.mp4" type="video/mp4" />
              </video>
            </foreignObject>
          </svg>
        </div>

        <div className="flex flex-col gap-5 py-8 font-bebas text-sm uppercase text-[#9a9a9a] md:flex-row md:items-center md:justify-between">
          <p>
            Copyright © 2026 <span className="text-[#1d1d1d]">Zelos</span>. All Rights Reserved
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-8">
            <Link href="/terms" className="!text-[#9a9a9a] transition hover:!text-[#b22222]">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="!text-[#9a9a9a] transition hover:!text-[#b22222]">
              Privacy Policy
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#1d1d1d]">We Accept</span>
            <CreditCardOutlined className="text-2xl text-[#c9c9c9]" />
            <CreditCardOutlined className="text-2xl text-[#c9c9c9]" />
            <CreditCardOutlined className="text-2xl text-[#c9c9c9]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
