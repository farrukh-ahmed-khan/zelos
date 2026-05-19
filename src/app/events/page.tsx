import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getEventsWithRsvpStatus } from "@/lib/events/service";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEventsWithRsvpStatus();
  const now = new Date();
  const upcoming = events.filter((event) => new Date(event.date) >= now && event.status !== "cancelled");
  const past = events.filter((event) => new Date(event.date) < now || event.status === "cancelled");

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12">
        <p className="eyebrow-red">Events</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Upcoming & Past Events
        </h1>
        {[
          { title: "Upcoming Events", items: upcoming },
          { title: "Past Events & Recaps", items: past },
        ].map((group) => (
          <section key={group.title} className="mt-8">
            <h2 className="font-bebas text-4xl uppercase leading-none">{group.title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.items.length ? group.items.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="overflow-hidden rounded-md border-2 border-[#212121] bg-white !text-[#202020] shadow-[0_4px_0_#111]">
                  {event.coverImageUrl ? (
                    <img src={event.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
                  ) : null}
                  <div className="p-4">
                    <p className="text-xs font-black uppercase text-[#b22222]">{event.type === "online" ? "Online" : "Physical"} / {event.status}</p>
                    <h3 className="font-bebas text-3xl uppercase leading-none">{event.title}</h3>
                    <p className="mt-2 text-sm text-[#555]">{new Date(event.date).toLocaleString()} / {event.type === "online" ? "Online" : event.location}</p>
                  </div>
                </Link>
              )) : (
                <p className="rounded-md bg-white px-4 py-3 text-sm text-[#555]">No {group.title.toLowerCase()} yet.</p>
              )}
            </div>
          </section>
        ))}
      </section>
      <Footer />
    </main>
  );
}
