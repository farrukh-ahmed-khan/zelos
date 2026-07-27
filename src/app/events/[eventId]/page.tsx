import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EventRsvpButton } from "@/components/EventRsvpButton";
import { EventsBanner } from "@/components/EventsBanner";
import { Footer } from "@/components/Footer";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { getEventWithRsvpStatus, getEventsWithRsvpStatus } from "@/lib/events/service";
import User from "@/models/User";
import styles from "./event-detail.module.css";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventWithRsvpStatus(eventId);

  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token).catch(() => null) : null;
  let userRole: string | null = null;
  if (payload?.sub) {
    await connectToDatabase();
    const user = await User.findById(payload.sub).select("role").lean();
    userRole = user?.role ?? null;
  }
  const canRsvp = userRole !== "forum-moderator";

  if (!event) notFound();

  const related = (await getEventsWithRsvpStatus()).filter((item) => item.id !== event.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-white p-4 text-[#202020] sm:p-6">
      <EventsBanner />

      <section className="mx-auto w-full max-w-[1320px] py-12 sm:py-16 lg:py-20">
        <p className="font-bebas text-sm uppercase tracking-[0.05em] text-[#b22222]">
          {event.type === "online" ? "Digital Event" : "In-Person Event"}
        </p>
        <h1 className="mt-1 max-w-[1100px] font-bebas text-[clamp(3rem,6vw,6rem)] uppercase leading-[0.92] text-[#202020]">
          {event.title}
        </h1>

        <div className={`${styles.overview} mt-7`}>
          <div className={styles.cover}>
            {/* Event images can use any administrator-provided URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.coverImageUrl || "/assets/event-placeholder.svg"}
              alt={event.coverImageUrl ? `${event.title} event` : ""}
              className={styles.coverImage}
            />
          </div>

          <aside className={styles.details}>
            <h2 className="font-bebas text-3xl uppercase leading-none text-[#202020]">
              Event Details
            </h2>
            <dl className={styles.detailsList}>
              {[
                { label: "Date", value: formatDate(new Date(event.date)) },
                { label: "Time", value: formatTime(new Date(event.date)) },
                { label: "Timezone", value: event.timezone },
                { label: "Format", value: event.type === "online" ? "Online" : "In person" },
                { label: "Location", value: event.type === "online" ? "Shared after RSVP" : event.location },
                { label: "Status", value: event.status },
              ].map((detail) => (
                <div className={styles.detailRow} key={detail.label}>
                  <dt className="font-bebas text-sm uppercase text-[#777]">
                    {detail.label}
                  </dt>
                  <dd className="m-0 break-words text-xs font-semibold leading-relaxed text-[#202020]">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 border-t border-[#d9d9d5] pt-5">
              <p className="mb-3 text-xs font-semibold text-[#555]">
                {event.rsvpCount} {event.rsvpCount === 1 ? "person has" : "people have"} RSVPed
              </p>
              <EventRsvpButton
                eventId={event.id}
                hasRsvped={event.hasRsvped}
                canRsvp={canRsvp}
              />
            </div>
          </aside>
        </div>

        <article className="mt-10 sm:mt-12">
          <h2 className="font-bebas text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none text-[#202020]">
            About {event.title}
          </h2>
          <p className={`${styles.prose} mt-4 text-sm leading-[1.75]`}>
            {event.description}
          </p>
        </article>

        <section className="mt-10 sm:mt-12">
          <h2 className="font-bebas text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none text-[#202020]">
            {event.type === "online" ? "Digital" : "In-Person"} Event Information
          </h2>
          <div className={`${styles.informationGrid} mt-4`}>
            <p className="whitespace-pre-wrap text-sm leading-[1.75] text-[#393939]">
              {event.information ||
                (event.type === "online"
                  ? "This event takes place online. RSVP to reserve your place and receive access information by email."
                  : `This event takes place at ${event.location}. RSVP to reserve your place and receive any event updates by email.`)}
            </p>
            <ul className={`${styles.factList} text-sm leading-[1.6] text-[#393939]`}>
              <li>{formatDate(new Date(event.date))} at {formatTime(new Date(event.date))}</li>
              <li>{event.timezone}</li>
              <li>{event.status === "cancelled" ? "This event has been cancelled." : "Registration is available through the RSVP panel."}</li>
            </ul>
          </div>
        </section>

        {event.speakers.length ? (
          <section className="mt-10 sm:mt-12">
            <h2 className="font-bebas text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none text-[#202020]">
              Event Speakers
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {event.speakers.map((speaker) => (
                <article key={`${speaker.name}-${speaker.title}`} className="border-t border-[#202020] pt-4">
                  {speaker.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={speaker.imageUrl} alt="" className="mb-4 aspect-[4/3] w-full rounded-[5px] object-cover" />
                  ) : null}
                  <h3 className="font-bebas text-2xl uppercase leading-none">{speaker.name}</h3>
                  {speaker.title ? <p className="mt-1 text-xs font-bold uppercase text-[#b22222]">{speaker.title}</p> : null}
                  {speaker.bio ? <p className="mt-3 text-sm leading-relaxed text-[#555]">{speaker.bio}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {event.recap || event.recapImageUrl || event.recapVideoUrl ? (
          <section className="mt-10 sm:mt-14">
            {event.recapVideoUrl ? (
              <video className={styles.recapMedia} controls preload="metadata">
                <source src={event.recapVideoUrl} />
              </video>
            ) : event.recapImageUrl ? (
              <div className={styles.recapMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.recapImageUrl} alt="" className={styles.recapImage} />
              </div>
            ) : null}
            <h2 className="mt-6 font-bebas text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none text-[#202020]">
              Event Recap
            </h2>
            {event.recap ? <p className={`${styles.prose} mt-4 text-sm leading-[1.75]`}>{event.recap}</p> : null}
          </section>
        ) : null}

        {related.length ? (
          <section className="mt-12 border-t border-[#dedede] pt-10 sm:mt-16">
            <h2 className="font-bebas text-[clamp(2rem,4vw,3.5rem)] uppercase leading-none text-[#202020]">
              Related Events
            </h2>
            <div className={`${styles.relatedGrid} mt-5`}>
              {related.map((item) => (
                <a
                  key={item.id}
                  href={`/events/${item.id}`}
                  className="rounded-[5px] border border-[#dedede] bg-white p-5 !text-[#202020] transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="font-bebas text-sm uppercase text-[#b22222]">
                    {formatDate(new Date(item.date))}
                  </p>
                  <h3 className="mt-2 font-bebas text-2xl uppercase leading-none">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#555]">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}
