import { notFound } from "next/navigation";
import { EventRsvpButton } from "@/components/EventRsvpButton";
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
      <section className="container max-w-[980px]">
        <p className="font-bebas text-sm uppercase text-[#b22222]">{event.type === "online" ? "Online" : "Physical Event"}</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">{event.title}</h1>
        <div className="mt-6 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
          <p className="font-bold">{new Date(event.date).toLocaleString()}</p>
          <p className="text-sm text-[#555]">{event.location}</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
          <p className="mt-4 text-sm font-bold text-[#b22222]">{event.rsvpCount} RSVP</p>
          <div className="mt-4"><EventRsvpButton eventId={event.id} hasRsvped={event.hasRsvped} /></div>
        </div>
        <h2 className="mt-8 font-bebas text-3xl uppercase">Related Events</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {related.map((item) => (
            <div key={item.id} className="rounded-md bg-white p-4 text-sm font-bold">{item.title}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
