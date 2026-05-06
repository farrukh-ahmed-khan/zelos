import {
  DownOutlined,
  MenuOutlined,
  PlayCircleFilled,
  SmileFilled,
} from "@ant-design/icons";

const navItems = ["Home", "About", "Mission", "Program", "Community", "Store", "Contact"];

export function Header() {
  return (
    <header className="relative z-20 mx-auto flex items-center gap-3 container">
      

      <nav className="flex h-12 flex-1 items-center justify-between gap-4 rounded-sm bg-white px-3 text-[#1b1b1b] shadow-[0_3px_0_rgba(0,0,0,0.18)]">
        <a href="#" className="flex items-center gap-3 text-2xl font-bold text-[#343434]">
          <span className="grid h-8 w-8 place-items-center text-[#ff3038]">
            <PlayCircleFilled className="text-[22px]" />
          </span>
          Zelos
        </a>

        <div className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className={
                item === "Home"
                  ? "rounded-full bg-[#efe6d8] px-4 py-2"
                  : "px-1 py-2 transition hover:text-[#cf1e1e]"
              }
            >
              {item}
              {item === "Program" ? <DownOutlined className="ml-1 text-[10px]" /> : null}
            </a>
          ))}
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

      <a
        href="#"
        className="hidden h-11 items-center gap-4 rounded-md bg-white px-4 text-sm font-bold text-[#1b1b1b] shadow-[0_3px_0_rgba(0,0,0,0.18)] md:flex"
      >
        Donate Us
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#2d93cf] text-white">
          <SmileFilled />
        </span>
      </a>
    </header>
  );
}
