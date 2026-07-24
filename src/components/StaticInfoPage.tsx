import Link from "next/link";
import { AboutBanner } from "@/components/AboutBanner";
import { AboutHowWeTeach } from "@/components/AboutHowWeTeach";
import { AboutMentors } from "@/components/AboutMentors";
import { AboutNonprofitCommitment } from "@/components/AboutNonprofitCommitment";
import { AboutOurVision } from "@/components/AboutOurVision";
import { AboutWhatWeDo } from "@/components/AboutWhatWeDo";
import { AboutWhoWeAre } from "@/components/AboutWhoWeAre";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonPostForm } from "@/components/JsonPostForm";
import { MentoringBanner } from "@/components/MentoringBanner";
import { MentoringIntro } from "@/components/MentoringIntro";
import { SchoolCurriculumBanner } from "@/components/SchoolCurriculumBanner";
import { SchoolCurriculumIntro } from "@/components/SchoolCurriculumIntro";
import { SchoolCurriculumReady } from "@/components/SchoolCurriculumReady";
import { SchoolCurriculumTeachers } from "@/components/SchoolCurriculumTeachers";
import { ScholarshipAudience } from "@/components/ScholarshipAudience";
import { ScholarshipBanner } from "@/components/ScholarshipBanner";
import { ScholarshipHowItWorks } from "@/components/ScholarshipHowItWorks";
import { ScholarshipIntro } from "@/components/ScholarshipIntro";
import { getPublishedStaticPage } from "@/lib/static-pages/service";

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function StaticInfoPage({
  eyebrow,
  title,
  intro,
  sections = [],
  form,
  actions,
  cmsSlug,
  heroVariant = "default",
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections?: { title: string; body: string; points?: string[] }[];
  form?: FormConfig;
  actions?: { href: string; label: string }[];
  cmsSlug?: string;
  heroVariant?: "default" | "about" | "mentoring" | "scholarship" | "school";
}) {
  const cmsPage = await getPublishedStaticPage(cmsSlug ?? slugify(title)).catch(() => null);
  const pageEyebrow = cmsPage?.eyebrow ?? eyebrow;
  const pageTitle = cmsPage?.title ?? title;
  const pageIntro = cmsPage?.intro ?? intro;
  const pageSections = cmsPage?.sections?.length ? cmsPage.sections : sections;

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      {heroVariant === "about" ? (
        <div className="padding-sections p-4 sm:p-6">
          <AboutBanner eyebrow={pageEyebrow} title={pageTitle} intro={pageIntro} />
        </div>
      ) : heroVariant === "mentoring" ? (
        <div className="padding-sections p-4 sm:p-6">
          <MentoringBanner eyebrow={pageEyebrow} intro={pageIntro} />
        </div>
      ) : heroVariant === "scholarship" ? (
        <div className="padding-sections p-4 sm:p-6">
          <ScholarshipBanner eyebrow={pageEyebrow} title={pageTitle} intro={pageIntro} />
        </div>
      ) : heroVariant === "school" ? (
        <div className="padding-sections p-4 sm:p-6">
          <SchoolCurriculumBanner
            eyebrow={pageEyebrow}
            title={pageTitle}
            intro={pageIntro}
          />
        </div>
      ) : (
        <section className="rounded-b-[2rem] bg-[#8c0504] px-4 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.35)] sm:px-6">
          <Header />
          <div className="container py-14">
            <p className="eyebrow-white">
              {pageEyebrow}
            </p>
            <h1 className="max-w-4xl font-bebas text-[clamp(3.5rem,8vw,7rem)] uppercase leading-[0.86]">
              {pageTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">
              {pageIntro}
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
      )}

      {heroVariant === "about" ? <AboutWhoWeAre /> : null}
      {heroVariant === "about" ? <AboutWhatWeDo /> : null}
      {heroVariant === "about" ? <AboutHowWeTeach /> : null}
      {heroVariant === "about" ? <AboutMentors /> : null}
      {heroVariant === "about" ? <AboutNonprofitCommitment /> : null}
      {heroVariant === "about" ? <AboutOurVision /> : null}

      {heroVariant === "mentoring" ? <MentoringIntro /> : null}
      {heroVariant === "scholarship" ? <ScholarshipIntro /> : null}
      {heroVariant === "scholarship" ? <ScholarshipHowItWorks /> : null}
      {heroVariant === "scholarship" ? <ScholarshipAudience /> : null}
      {heroVariant === "school" ? <SchoolCurriculumIntro /> : null}
      {heroVariant === "school" ? <SchoolCurriculumTeachers /> : null}
      {heroVariant === "school" ? <SchoolCurriculumReady /> : null}

      {heroVariant === "default" ? (
        <section className="container grid gap-5 py-10 lg:grid-cols-3">
          <div className="grid gap-5 lg:col-span-2">
            {pageSections.map((section) => (
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
                  This page is wired into the same public site shell as the home
                  page, with CMS-ready content areas and route-level separation.
                </p>
              </article>
            )}
          </aside>
        </section>
      ) : null}
      <Footer />
    </main>
  );
}
