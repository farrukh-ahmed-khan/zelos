import Link from "next/link";
import { PlayCircleFilled } from "@ant-design/icons";
import { AuthForm } from "@/components/AuthForm";

type AuthPageShellProps = {
  mode: "login" | "signup";
};

export function AuthPageShell({ mode }: AuthPageShellProps) {
  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] bg-[#8c0504] px-5 py-5 shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-3rem)] sm:px-9 lg:px-24">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="/assets/bg-video.mp4" type="video/quicktime" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.72),rgba(70,0,0,0.96)_72%)]" />

        <div className="container relative z-10">
          <header className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex h-12 items-center gap-3 rounded-sm bg-white px-4 text-2xl font-bold !text-[#343434] shadow-[0_3px_0_rgba(0,0,0,0.18)]"
            >
              <span className="grid h-8 w-8 place-items-center text-[#ff3038]">
                <PlayCircleFilled className="text-[22px]" />
              </span>
              Zelos
            </Link>

            <Link
              href={isSignup ? "/login" : "/signup"}
              className="rounded-md border-2 border-[#212121] bg-[#f4f1e9] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-white"
            >
              {isSignup ? "Log In" : "Sign Up"}
            </Link>
          </header>

          <div className="grid min-h-[calc(100vh-9rem)] gap-10 py-12 lg:grid-cols-[1fr_520px] lg:items-center">
            <div className="max-w-[700px] text-white">
              <p className="mb-3 font-bebas text-[13px] uppercase leading-none tracking-wide text-white/80 sm:text-base">
                {isSignup ? "Join Zelos" : "Welcome Back"}
              </p>
              <h1 className="font-bebas text-[clamp(3.2rem,7vw,6rem)] uppercase leading-[0.86] text-white">
                {isSignup ? "Start Building" : "Continue Your"}
                <span className="block">
                  {isSignup ? (
                    <>
                      Your <span className="text-transparent [-webkit-text-stroke:1.5px_white]">Future</span>
                    </>
                  ) : (
                    <>
                      Money <span className="text-transparent [-webkit-text-stroke:1.5px_white]">Journey</span>
                    </>
                  )}
                </span>
              </h1>
              <p className="mt-3 inline-block bg-[#F2EBDA] px-2 py-1 font-bebas text-[17px] uppercase leading-tight text-[#B22222] sm:text-xl">
                Financial literacy, mentorship, scholarships, and opportunity.
              </p>
              <p className="mt-3 max-w-[620px] text-lg leading-snug text-white sm:text-xl">
                {isSignup
                  ? "Create a mentee or subscriber account and get access to the Zelos tools made for practical growth."
                  : "Log in to pick up your learning, community, events, and opportunities right where you left them."}
              </p>
            </div>

            <div>
              <div className="mb-4 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black uppercase tracking-wide text-[#212121] shadow-[0_4px_0_#111]">
                {isSignup ? "Create Account" : "Member Login"}
              </div>
              <AuthForm mode={mode} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
