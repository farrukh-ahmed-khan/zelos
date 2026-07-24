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
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#7a0505] px-5 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:px-9 lg:px-24">
        <video className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply" autoPlay loop muted playsInline aria-hidden="true">
          <source src="/assets/bg-video.mp4" type="video/quicktime" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.72),rgba(70,0,0,0.96)_72%)]" />
        <div className="relative z-10">
          <Header />
          <div className="banner-content-width py-16 lg:py-24">
            <p className="eyebrow-white banner-eyebrow mb-3">Zelos Events</p>
            <h1 className="font-bebas text-[clamp(4rem,9vw,7rem)] uppercase leading-[0.84] text-white">
              Show Up.
              <span className="block text-transparent [-webkit-text-stroke:1.5px_white]">Level Up.</span>
            </h1>
            <p className="mt-3 inline-block bg-[#F2EBDA] px-2 py-1 font-bebas text-[22px] uppercase leading-none text-[#B22222]">
              Physical and digital events for learning, career exposure, and community.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-10">
        {[
          { title: "Upcoming Events", items: upcoming },
          { title: "Past Events & Recaps", items: past },
        ].map((group) => (
          <section key={group.title} className="mt-8">
            <p className="eyebrow-red">Events</p>
            <h2 className="home-section-heading bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">{group.title}</h2>
            <div className="mt-4 grid gap-5">
              {group.items.length ? group.items.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="grid gap-5 rounded-lg bg-[#c82124] p-6 !text-white shadow-[0_3px_0_rgba(0,0,0,0.18)] lg:grid-cols-[1.35fr_0.95fr_0.95fr_auto] lg:items-center lg:gap-0">
                  <div className="lg:border-r lg:border-[#9d1a1b] lg:pr-8">
                    <p className="text-xs font-black uppercase text-[#faff8d]">{event.type === "online" ? "Digital" : "Physical"} / {event.status}</p>
                    <h3 className="mt-1 font-bebas text-3xl uppercase leading-none text-white">{event.title}</h3>
                    <p className="mt-3 max-w-[360px] text-sm leading-relaxed text-white">{event.description}</p>
                  </div>
                  <div className="lg:border-r lg:border-[#9d1a1b] lg:px-8">
                    <p className="font-bebas text-2xl uppercase leading-none text-white">{event.type === "online" ? "Online" : event.location}</p>
                    <p className="mt-1 text-sm text-white/90">{event.timezone}</p>
                  </div>
                  <div className="lg:border-r lg:border-[#9d1a1b] lg:px-8">
                    <p className="font-bebas text-4xl uppercase leading-none text-white">{new Date(event.date).getDate()}</p>
                    <p className="font-bebas text-lg uppercase leading-none text-white">{new Date(event.date).toLocaleString("en", { month: "short", year: "numeric" })}</p>
                    <p className="mt-1 text-sm text-white/90">{new Date(event.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                  <span className="inline-flex min-w-[98px] justify-center rounded-sm bg-[#faff8d] px-6 py-3 font-bebas text-lg uppercase leading-none !text-[#b22222] lg:ml-8">
                    View
                  </span>
                </Link>
              )) : (
                <p className="rounded-md border-2 border-[#212121] bg-white px-4 py-3 text-sm text-[#555] shadow-[0_4px_0_#111]">No {group.title.toLowerCase()} yet.</p>
              )}
            </div>
          </section>
        ))}
      </section>
      <Footer />
    </main>
  );
}
