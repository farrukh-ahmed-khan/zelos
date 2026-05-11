import Link from "next/link";
import { getEventsWithRsvpStatus } from "@/lib/events/service";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEventsWithRsvpStatus();

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <section className="container">
        <p className="font-bebas text-sm uppercase text-[#b22222]">Events</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Upcoming & Past Events
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
              <p className="text-xs font-black uppercase text-[#b22222]">{event.type} / {event.status}</p>
              <h2 className="font-bebas text-3xl uppercase leading-none">{event.title}</h2>
              <p className="mt-2 text-sm text-[#555]">{new Date(event.date).toLocaleDateString()} / {event.location}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
