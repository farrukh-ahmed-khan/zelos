import { CalendarOutlined, FieldTimeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { getEventsWithRsvpStatus } from "@/lib/events/service";

function timeLabel(date: Date): string {
  const day = date.getDate();
  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  const hour = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${weekday} : ${hour}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export async function UpcomingEvents() {
  const now = new Date();
  const allEvents = await getEventsWithRsvpStatus().catch(() => []);
  const events = allEvents
    .filter((e) => new Date(e.date) > now && e.status !== "cancelled")
    .slice(0, 3);

  if (!events.length) return null;

  return (
    <section className="bg-[#eee6d6] px-4 py-16 text-[#202020] sm:px-6 lg:py-20">
      <div className="container">
        <div className="mx-auto mb-8 max-w-130 text-center">
          <p className="eyebrow-red mb-1">Upcoming Special Events</p>
          <h2 className="home-section-heading bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Upcoming Events
          </h2>
          <p className="mt-2 text-sm text-[#202020]">
            Physical and digital events across the country.
          </p>
        </div>

        <div className="mx-auto flex max-w-210 flex-col gap-7">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const isOnline = event.type === "online";

            return (
              <article
                key={event.id}
                className="grid gap-5 rounded-lg bg-[#c82124] p-6 text-white shadow-[0_2px_0_rgba(0,0,0,0.12)] lg:grid-cols-[1.35fr_0.95fr_0.95fr_auto] lg:items-center lg:gap-0"
              >
                <div className="lg:border-r lg:border-[#9d1a1b] lg:pr-8">
                  <h3 className="font-bebas text-2xl uppercase leading-none text-white">
                    {event.title}
                  </h3>
                  <p className="mt-3 max-w-65 text-sm leading-relaxed text-white">
                    {event.description.slice(0, 100)}
                    {event.description.length > 100 ? "…" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-5 lg:border-r lg:border-[#9d1a1b] lg:px-8">
                  <FieldTimeOutlined className="text-[38px] text-[#f2ebda]" />
                  <div>
                    <p className="font-bebas text-lg uppercase leading-none text-white">
                      {event.location}
                    </p>
                    <p className="mt-1 font-bebas text-sm uppercase leading-none text-white">
                      {timeLabel(eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 lg:border-r lg:border-[#9d1a1b] lg:px-8">
                  <CalendarOutlined className="text-[38px] text-[#f2ebda]" />
                  <div>
                    <p className="font-bebas text-4xl uppercase leading-none text-white">
                      {eventDate.getDate()}
                    </p>
                    <p className="font-bebas text-sm uppercase leading-none text-white">
                      {monthLabel(eventDate)}
                    </p>
                  </div>
                </div>

                <div className="lg:pl-8">
                  <Link
                    href={`/events/${event.id}`}
                    className={
                      isOnline
                        ? "inline-flex min-w-24.5 justify-center rounded-sm bg-[#ffa0a5] px-6 py-3 font-bebas text-lg uppercase leading-none text-[#b22222]!"
                        : "inline-flex min-w-24.5 justify-center rounded-sm bg-[#faff8d] px-6 py-3 font-bebas text-lg uppercase leading-none text-[#b22222]!"
                    }
                  >
                    {isOnline ? "Digital" : "Physical"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-9 text-center">
          <Link
            href="/events"
            className="inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-2.5 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
}
