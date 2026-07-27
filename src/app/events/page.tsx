import Link from "next/link";
import { EventsBanner } from "@/components/EventsBanner";
import { Footer } from "@/components/Footer";
import { getEventsWithRsvpStatus } from "@/lib/events/service";
import styles from "./events.module.css";

export const dynamic = "force-dynamic";

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function EventsPage() {
  const events = await getEventsWithRsvpStatus();
  const now = new Date();
  const upcoming = events.filter((event) => new Date(event.date) >= now && event.status !== "cancelled");
  const past = events.filter((event) => new Date(event.date) < now || event.status === "cancelled");

  return (
    <main className="min-h-screen bg-white p-4 text-[#202020] sm:p-6">
      <EventsBanner />

      <div>
        {[
          { title: "Upcoming Events", items: upcoming, isPast: false },
          { title: "Past Events", items: past, isPast: true },
        ].map((group) => (
          <section
            key={group.title}
            className={
              group.isPast
                ? "-mx-4 bg-[#eee6d6] px-4 py-12 sm:-mx-6 sm:px-6 sm:py-16 lg:py-20"
                : "py-12 sm:py-16 lg:py-20"
            }
          >
            <div className="mx-auto w-full max-w-[1320px]">
              <h2 className="text-center font-bebas text-[clamp(2.75rem,5vw,4.5rem)] uppercase leading-none text-[#202020]">
                {group.title}
              </h2>

              <div className={`${styles.eventGrid} mt-8`}>
                {group.items.length ? group.items.map((event) => (
                  <article
                    key={event.id}
                    className="flex h-full min-w-0 flex-col overflow-hidden rounded-[7px] border border-[#dedede] bg-white"
                  >
                    <div className={styles.eventMedia}>
                      {/* Event images can use any administrator-provided URL. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.coverImageUrl || "/assets/event-placeholder.svg"}
                        alt={event.coverImageUrl ? `${event.title} event` : ""}
                        className={styles.eventImage}
                      />
                    </div>

                    <div className="flex flex-1 flex-col px-4 pb-5 pt-3">
                      <p className="font-bebas text-sm uppercase leading-none text-[#202020]">
                        {formatEventDate(new Date(event.date))}
                      </p>
                      <h3 className="mt-3 line-clamp-2 font-bebas text-[1.35rem] uppercase leading-[1.06] text-[#202020]">
                        {event.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-xs leading-[1.55] text-[#303030]">
                        {event.description}
                      </p>

                      <Link
                        href={`/events/${event.id}`}
                        className="mt-4 inline-flex w-fit min-w-[96px] items-center justify-center rounded-[4px] border border-[#202020] bg-[#faff8d] px-4 py-2 text-[11px] font-bold leading-none !text-[#202020] shadow-[0_2px_0_#202020] transition hover:-translate-y-px hover:bg-[#f5ff62] hover:shadow-[0_3px_0_#202020]"
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                )) : (
                  <p className="col-span-full rounded-md border border-[#dedede] bg-[#fafafa] px-5 py-8 text-center text-sm text-[#666]">
                    No {group.title.toLowerCase()} yet.
                  </p>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </main>
  );
}
