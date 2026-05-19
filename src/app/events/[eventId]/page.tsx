import { notFound } from "next/navigation";
import { EventRsvpButton } from "@/components/EventRsvpButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getEventWithRsvpStatus, getEventsWithRsvpStatus } from "@/lib/events/service";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEventWithRsvpStatus(eventId);

  if (!event) notFound();

  const related = (await getEventsWithRsvpStatus()).filter((item) => item.id !== event.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12 max-w-[980px]">
        <p className="eyebrow-red">{event.type === "online" ? "Online" : "Physical Event"}</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">{event.title}</h1>
        <div className="mt-6 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
          {event.coverImageUrl ? <img src={event.coverImageUrl} alt="" className="mb-4 aspect-video w-full rounded-md object-cover" /> : null}
          <p className="font-bold">{new Date(event.date).toLocaleString()} / {event.timezone}</p>
          <p className="text-sm text-[#555]">{event.type === "online" ? "Online. RSVP to receive the meeting link by email." : event.location}</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
          <p className="mt-4 text-sm font-bold text-[#b22222]">{event.rsvpCount} RSVP</p>
          <div className="mt-4"><EventRsvpButton eventId={event.id} hasRsvped={event.hasRsvped} /></div>
        </div>
        {event.speakers.length ? (
          <>
            <h2 className="mt-8 font-bebas text-3xl uppercase">Speakers</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {event.speakers.map((speaker) => (
                <article key={`${speaker.name}-${speaker.title}`} className="rounded-md bg-white p-4 shadow-sm">
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
          <section className="mt-8 rounded-md border border-[#d9dde3] bg-white p-5 shadow-sm">
            <h2 className="font-bebas text-3xl uppercase">Event Recap</h2>
            {event.recapImageUrl ? <img src={event.recapImageUrl} alt="" className="mt-3 aspect-video w-full rounded-md object-cover" /> : null}
            {event.recap ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#555]">{event.recap}</p> : null}
          </section>
        ) : null}
        <h2 className="mt-8 font-bebas text-3xl uppercase">Related Events</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {related.map((item) => (
            <a key={item.id} href={`/events/${item.id}`} className="rounded-md bg-white p-4 text-sm font-bold !text-[#202020]">{item.title}</a>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
