import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EventRsvpButton } from "@/components/EventRsvpButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { getEventWithRsvpStatus, getEventsWithRsvpStatus } from "@/lib/events/service";
import User from "@/models/User";

export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#7a0505] px-5 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:px-9 lg:px-24">
        <video className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply" autoPlay loop muted playsInline aria-hidden="true">
          <source src="/assets/bg-video.mp4" type="video/quicktime" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.72),rgba(70,0,0,0.96)_72%)]" />
        <div className="relative z-10">
          <Header />
          <div className="container max-w-[980px] py-16">
            <p className="eyebrow-white">{event.type === "online" ? "Online Event" : "Physical Event"}</p>
            <h1 className="font-bebas text-[clamp(4rem,9vw,7rem)] uppercase leading-[0.84] text-white">{event.title}</h1>
            <p className="mt-3 inline-block bg-[#F2EBDA] px-2 py-1 font-bebas text-[22px] uppercase leading-none text-[#B22222]">
              RSVP to reserve your spot
            </p>
          </div>
        </div>
      </section>

      <section className="container max-w-[980px] py-10">
        <div className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
          {event.coverImageUrl ? <img src={event.coverImageUrl} alt="" className="mb-4 aspect-video w-full rounded-md object-cover" /> : null}
          <p className="font-bold">{new Date(event.date).toLocaleString()} / {event.timezone}</p>
          <p className="text-sm text-[#555]">{event.type === "online" ? "Online. RSVP to receive the meeting link by email." : event.location}</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
          <p className="mt-4 text-sm font-bold text-[#b22222]">{event.rsvpCount} RSVP</p>
          <div className="mt-4"><EventRsvpButton eventId={event.id} hasRsvped={event.hasRsvped} canRsvp={canRsvp} /></div>
        </div>
        {event.speakers.length ? (
          <>
            <h2 className="mt-8 font-bebas text-4xl uppercase">Speakers</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {event.speakers.map((speaker) => (
                <article key={`${speaker.name}-${speaker.title}`} className="rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_3px_0_#111]">
                  {speaker.imageUrl ? <img src={speaker.imageUrl} alt="" className="mb-3 aspect-square w-full rounded-md object-cover" /> : null}
                  <p className="font-bold">{speaker.name}</p>
                  {speaker.title ? <p className="text-xs font-black uppercase text-[#b22222]">{speaker.title}</p> : null}
                  {speaker.bio ? <p className="mt-2 text-sm text-[#555]">{speaker.bio}</p> : null}
                </article>
              ))}
            </div>
          </>
        ) : null}
        {event.recap || event.recapImageUrl ? (
          <section className="mt-8 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <h2 className="font-bebas text-3xl uppercase">Event Recap</h2>
            {event.recapImageUrl ? <img src={event.recapImageUrl} alt="" className="mt-3 aspect-video w-full rounded-md object-cover" /> : null}
            {event.recap ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#555]">{event.recap}</p> : null}
          </section>
        ) : null}
        <h2 className="mt-8 font-bebas text-3xl uppercase">Related Events</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {related.map((item) => (
            <a key={item.id} href={`/events/${item.id}`} className="rounded-md border-2 border-[#212121] bg-white p-4 text-sm font-bold !text-[#202020] shadow-[0_3px_0_#111]">{item.title}</a>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
