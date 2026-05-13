import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonPostForm } from "@/components/JsonPostForm";

type FormConfig = {
  endpoint: string;
  submitLabel: string;
  fields: {
    name: string;
    label: string;
    type?: string;
    textarea?: boolean;
    value?: string;
  }[];
};

export function StaticInfoPage({
  eyebrow,
  title,
  intro,
  sections,
  form,
  actions,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; body: string; points?: string[] }[];
  form?: FormConfig;
  actions?: { href: string; label: string }[];
}) {
  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      <section className="rounded-b-[2rem] bg-[#8c0504] px-4 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.35)] sm:px-6">
        <Header />
        <div className="container py-14">
          <p className="eyebrow-white">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl font-bebas text-[clamp(3.5rem,8vw,7rem)] uppercase leading-[0.86]">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">
            {intro}
          </p>
          {actions?.length ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="container grid gap-5 py-10 lg:grid-cols-3">
        <div className="grid gap-5 lg:col-span-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-md border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]"
            >
              <h2 className="font-bebas text-4xl uppercase leading-none text-[#202020]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4a4a4a]">
                {section.body}
              </p>
              {section.points?.length ? (
                <div className="mt-5 grid gap-2">
                  {section.points.map((point) => (
                    <p
                      key={point}
                      className="rounded-md bg-[#f8f3e8] px-4 py-3 text-sm font-bold"
                    >
                      {point}
                    </p>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <aside className="grid content-start gap-5">
          {form ? (
            <JsonPostForm
              endpoint={form.endpoint}
              fields={form.fields}
              submitLabel={form.submitLabel}
            />
          ) : (
            <article className="rounded-md border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
              <h2 className="font-bebas text-3xl uppercase leading-none">
                Platform Note
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#555]">
                This page is wired into the same public site shell as the home page,
                with CMS-ready content areas and route-level separation.
              </p>
            </article>
          )}
        </aside>
      </section>
      <Footer />
    </main>
  );
}
