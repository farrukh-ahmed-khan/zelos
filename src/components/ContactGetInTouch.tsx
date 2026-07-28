import {
  EnvironmentOutlined,
  FacebookFilled,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  XOutlined,
  YoutubeFilled,
} from "@ant-design/icons";

const socials = [
  { label: "Facebook", icon: <FacebookFilled />, href: "#" },
  { label: "Instagram", icon: <InstagramOutlined />, href: "#" },
  { label: "X", icon: <XOutlined />, href: "#" },
  { label: "YouTube", icon: <YoutubeFilled />, href: "#" },
];

export function ContactGetInTouch() {
  return (
    <article className="relative overflow-hidden rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_5px_0_#111] sm:p-7">
      <div className="absolute inset-x-0 top-0 h-2 bg-[#b22222]" aria-hidden="true" />

      <div className="flex items-start justify-between gap-6 pt-2">
        <div>
          <p className="eyebrow-red mb-2">Direct Support</p>
          <h2 className="font-bebas text-[clamp(2.5rem,6vw,4rem)] uppercase leading-[0.9] text-[#202020]">
            Get In Touch
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5f5b55] sm:text-base">
            Prefer to reach us directly? Choose the option that works best and a member of the
            Zelos team will get back to you.
          </p>
        </div>
        <div
          className="hidden h-16 w-16 shrink-0 rotate-3 place-items-center rounded-md border-2 border-[#212121] bg-[#faff8d] text-2xl text-[#212121] shadow-[3px_3px_0_#111] sm:grid"
          aria-hidden="true"
        >
          <MailOutlined />
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <a
          href="mailto:support@zelos.com"
          className="group flex min-w-0 items-center gap-4 rounded-md border border-[#e2d8c8] bg-[#f8f3e8] p-4 text-[#202020]! transition duration-200 hover:-translate-y-0.5 hover:border-[#b22222] hover:shadow-[0_5px_14px_rgba(0,0,0,0.1)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b22222] text-base text-white transition-transform duration-200 group-hover:scale-105">
            <MailOutlined />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c0504]">
              Email Us
            </span>
            <span className="mt-1 block break-all text-sm font-black sm:text-base">
              support@zelos.com
            </span>
          </span>
        </a>
        <a
          href="tel:+14065550120"
          className="group flex min-w-0 items-center gap-4 rounded-md border border-[#e2d8c8] bg-[#f8f3e8] p-4 text-[#202020]! transition duration-200 hover:-translate-y-0.5 hover:border-[#b22222] hover:shadow-[0_5px_14px_rgba(0,0,0,0.1)]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b22222] text-base text-white transition-transform duration-200 group-hover:scale-105">
            <PhoneOutlined />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c0504]">
              Call Us
            </span>
            <span className="mt-1 block text-sm font-black sm:text-base">
              +1 406 555-0120
            </span>
          </span>
        </a>
        <p className="flex min-w-0 items-center gap-4 rounded-md border border-[#e2d8c8] bg-[#f8f3e8] p-4 sm:col-span-2">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#212121] text-base text-white">
            <EnvironmentOutlined />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c0504]">
              Visit Us
            </span>
            <span className="mt-1 block text-sm font-black leading-relaxed sm:text-base">
              2972 Westheimer Rd. Santa Ana, Illinois, USA
            </span>
          </span>
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-[#e8e0d3] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bebas text-xl uppercase leading-none text-[#202020]">Follow Zelos</p>
          <p className="mt-1 text-xs text-[#7b756d]">Stay connected with our community.</p>
        </div>
        <div className="flex gap-2">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              title={social.label}
              className="grid h-10 w-10 place-items-center rounded-md border-2 border-[#212121] bg-[#f8f3e8] text-[#212121]! shadow-[0_2px_0_#111] transition duration-200 hover:-translate-y-0.5 hover:bg-[#b22222] hover:text-white! hover:shadow-[0_4px_0_#111] focus-visible:bg-[#b22222] focus-visible:text-white!"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
