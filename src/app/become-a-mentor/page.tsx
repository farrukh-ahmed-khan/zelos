import { MentorApplicationForm } from "@/components/MentorApplicationForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function BecomeAMentorPage() {
  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-10 text-[#202020] sm:px-6 lg:py-16">
      <Header />
      <section className="container mt-12">
        <div className="mx-auto grid max-w-[1080px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-lg bg-[#8c0504] p-7 text-white shadow-[0_5px_0_#111] lg:sticky lg:top-8">
            <p className="eyebrow-white mb-2">
              Become a Mentor
            </p>
            <h1 className="font-bebas text-[clamp(3rem,5vw,5rem)] uppercase leading-[0.84]">
              Share What You Know
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/90">
              Mentors are no longer created as a user type. Professionals now
              submit this application, and the admin team reviews it before
              approving mentor participation.
            </p>
          </div>

          <MentorApplicationForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
