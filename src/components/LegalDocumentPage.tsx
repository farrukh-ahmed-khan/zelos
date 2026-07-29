import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  legalDocumentLinks,
  type LegalDocument,
  type LegalSubsection,
} from "@/content/legal-documents";

function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Paragraphs({ paragraphs }: { paragraphs?: string[] }) {
  if (!paragraphs?.length) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {paragraphs.map((paragraph) => (
        <p className="text-[15px] leading-7 text-[#4f4a43] sm:text-base" key={paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function BulletList({ bullets }: { bullets?: string[] }) {
  if (!bullets?.length) {
    return null;
  }

  return (
    <ul className="grid gap-2.5 pl-0">
      {bullets.map((bullet) => (
        <li
          className="flex gap-3 text-[15px] leading-7 text-[#4f4a43] sm:text-base"
          key={bullet}
        >
          <span
            aria-hidden="true"
            className="mt-[0.68rem] h-2 w-2 shrink-0 rounded-full bg-[#b22222]"
          />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function Subsection({ subsection }: { subsection: LegalSubsection }) {
  return (
    <div className="rounded-lg bg-[#f7f1e5] p-4 sm:p-5">
      <h3 className="text-base font-extrabold leading-snug text-[#24211f]">
        {subsection.title}
      </h3>
      <div className="mt-3 grid gap-4">
        <Paragraphs paragraphs={subsection.paragraphs} />
        <BulletList bullets={subsection.bullets} />
      </div>
    </div>
  );
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      <section className="rounded-b-[2rem] bg-[#750000] px-4 py-5 text-white shadow-[inset_0_0_120px_rgba(0,0,0,0.32)] sm:px-6">
        <Header />
        <div className="banner-content-width py-12 sm:py-16 lg:py-20">
          <p className="eyebrow-white banner-eyebrow">Legal</p>
          <h1 className="mt-3 max-w-5xl font-bebas text-[clamp(3rem,8vw,6.6rem)] uppercase leading-[0.88]">
            {document.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
            {document.description}
          </p>
          {document.effectiveDate || document.lastUpdated ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {document.effectiveDate ? (
                <p className="rounded-full border border-white/30 bg-black/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/90">
                  Effective date: {document.effectiveDate}
                </p>
              ) : null}
              {document.lastUpdated ? (
                <p className="rounded-full border border-white/30 bg-black/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/90">
                  Last updated: {document.lastUpdated}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:px-10 lg:py-14">
        <aside className="rounded-xl border-2 border-[#25211f] bg-white p-5 shadow-[0_5px_0_#171717] lg:sticky lg:top-5">
          <p className="font-bebas text-2xl uppercase leading-none text-[#b22222]">
            Legal Documents
          </p>
          <nav aria-label="Legal documents" className="mt-4 grid gap-1.5">
            {legalDocumentLinks.map((link) => {
              const isCurrent = link.href === `/${document.slug}`;

              return (
                <Link
                  aria-current={isCurrent ? "page" : undefined}
                  className={`rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    isCurrent
                      ? "bg-[#b22222] !text-white"
                      : "!text-[#4f4a43] hover:bg-[#f7f1e5] hover:!text-[#b22222]"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {document.slug === "privacy" ? (
            <Link
              className="mt-5 block rounded-md border-2 border-[#25211f] bg-[#faff8d] px-4 py-3 text-center text-sm font-black !text-[#25211f] shadow-[0_3px_0_#171717] transition hover:-translate-y-0.5"
              href="/data-requests"
            >
              Submit a Data Request
            </Link>
          ) : null}
        </aside>

        <article className="min-w-0 rounded-xl border-2 border-[#25211f] bg-white p-5 shadow-[0_5px_0_#171717] sm:p-8 lg:p-10">
          {document.intro?.length ? (
            <div className="mb-8 rounded-lg border-l-4 border-[#b22222] bg-[#f7f1e5] p-5">
              <Paragraphs paragraphs={document.intro} />
            </div>
          ) : null}

          <div className="grid gap-6">
            {document.sections.map((section) => (
              <section
                className="scroll-mt-6 border-b border-[#e3dacb] pb-6 last:border-b-0 last:pb-0"
                id={toSectionId(section.title)}
                key={section.title}
              >
                <h2 className="font-bebas text-[clamp(2rem,5vw,2.8rem)] uppercase leading-none text-[#24211f]">
                  {section.title}
                </h2>
                <div className="mt-4 grid gap-4">
                  <Paragraphs paragraphs={section.paragraphs} />
                  <BulletList bullets={section.bullets} />
                  {section.subsections?.length ? (
                    <div className="grid gap-3 pt-1">
                      {section.subsections.map((subsection) => (
                        <Subsection key={subsection.title} subsection={subsection} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-lg bg-[#750000] p-5 text-white sm:p-6">
            <p className="font-bebas text-2xl uppercase leading-none">Questions?</p>
            <p className="mt-3 text-sm leading-6 text-white/85">
              Contact the Zelos Customer Experience Team at{" "}
              <a
                className="font-bold underline decoration-white/60 underline-offset-4"
                href="mailto:support@zelos.org"
              >
                support@zelos.org
              </a>
              .
            </p>
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
