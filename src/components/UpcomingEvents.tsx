import { CalendarOutlined, FieldTimeOutlined } from "@ant-design/icons";

const events = [
  {
    title: "Financial Futures Forum",
    description: "Experts discuss future trends in finance and investments.",
    location: "Chicago, IL",
    schedule: "Sunday : 10:00 - 13:00",
    day: "10",
    month: "May 2026",
    format: "Physical",
    formatTone: "light",
  },
  {
    title: "Career Conversations: Medicine & Tech",
    description: "Professionals share experiences from medicine and tech industries.",
    location: "Online",
    schedule: "Friday : 10:00 - 13:00",
    day: "22",
    month: "May 2026",
    format: "Digital",
    formatTone: "pink",
  },
  {
    title: "Young Investors Workshop",
    description: "A practical workshop teaching youth the basics of investing.",
    location: "Atlanta, GA",
    schedule: "Thursday : 10:00 - 13:00",
    day: "4",
    month: "June 2026",
    format: "Physical",
    formatTone: "light",
  },
];

export function UpcomingEvents() {
  return (
    <section className="bg-[#eee6d6] px-4 py-16 text-[#202020] sm:px-6 lg:py-20">
      <div className="container">
        <div className="mx-auto mb-8 max-w-[520px] text-center">
          <p className="eyebrow-red mb-1">
            Upcoming Special Events
          </p>
          <h2 className="bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-center font-bebas text-[56px] font-bold uppercase leading-[50px] tracking-[-1px] text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] sm:text-[90px] sm:leading-[76px] sm:tracking-[-2px]">
            Upcoming Events
          </h2>
          <p className="mt-2 text-sm text-[#202020]">
            physical and digital events across the country.
          </p>
        </div>

        <div className="mx-auto flex max-w-[840px] flex-col gap-7">
          {events.map((event) => (
            <article
              className="grid gap-5 rounded-lg bg-[#c82124] p-6 text-white shadow-[0_2px_0_rgba(0,0,0,0.12)] lg:grid-cols-[1.35fr_0.95fr_0.95fr_auto] lg:items-center lg:gap-0"
              key={event.title}
            >
              <div className="lg:border-r lg:border-[#9d1a1b] lg:pr-8">
                <h3 className="font-bebas text-2xl uppercase leading-none text-white">
                  {event.title}
                </h3>
                <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-white">
                  {event.description}
                </p>
              </div>

              <div className="flex items-center gap-5 lg:border-r lg:border-[#9d1a1b] lg:px-8">
                <FieldTimeOutlined className="text-[38px] text-[#f2ebda]" />
                <div>
                  <p className="font-bebas text-lg uppercase leading-none text-white">
                    {event.location}
                  </p>
                  <p className="mt-1 font-bebas text-sm uppercase leading-none text-white">
                    {event.schedule}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 lg:border-r lg:border-[#9d1a1b] lg:px-8">
                <CalendarOutlined className="text-[38px] text-[#f2ebda]" />
                <div>
                  <p className="font-bebas text-4xl uppercase leading-none text-white">
                    {event.day}
                  </p>
                  <p className="font-bebas text-sm uppercase leading-none text-white">
                    {event.month}
                  </p>
                </div>
              </div>

              <div className="lg:pl-8">
                <a
                  href="#"
                  className={
                    event.formatTone === "pink"
                      ? "inline-flex min-w-[98px] justify-center rounded-sm bg-[#ffa0a5] px-6 py-3 font-bebas text-lg uppercase leading-none !text-[#b22222]"
                      : "inline-flex min-w-[98px] justify-center rounded-sm bg-[#faff8d] px-6 py-3 font-bebas text-lg uppercase leading-none !text-[#b22222]"
                  }
                >
                  {event.format}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 text-center">
          <a
            href="#"
            className="inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-2.5 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
          >
            View All Events
          </a>
        </div>
      </div>
    </section>
  );
}
