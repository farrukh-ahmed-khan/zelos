"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type StaticPage = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string; points?: string[] }>;
  isPublished: boolean;
};

const DEFAULT_SLUGS = [
  "about",
  "financial-confidence-for-real-life",
  "money-lessons-by-age-track",
  "contact",
  "mission-video",
  "school-curriculum",
  "mentoring",
  "schools",
  "privacy",
  "terms",
];

export function AdminStaticPagesManager({ pages }: { pages: StaticPage[] }) {
  const [items, setItems] = useState(pages);
  const [selected, setSelected] = useState<StaticPage | null>(pages[0] ?? null);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const sections = String(formData.get("sections") ?? "")
      .split("\n---\n")
      .map((block) => {
        const [title = "", ...bodyParts] = block.split("\n");
        return {
          title: title.trim(),
          body: bodyParts.join("\n").trim(),
          points: [],
        };
      })
      .filter((section) => section.title && section.body);

    const response = await api.post("/api/admin/static-pages", {
      slug: String(formData.get("slug") ?? ""),
      eyebrow: String(formData.get("eyebrow") ?? ""),
      title: String(formData.get("title") ?? ""),
      intro: String(formData.get("intro") ?? ""),
      sections,
      isPublished: formData.get("isPublished") === "on",
    });
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      setMessage(result?.error?.message ?? "Unable to save page.");
      return;
    }

    const saved = result.data.page;
    setItems((current) => {
      const withoutExisting = current.filter((page) => page.slug !== saved.slug);
      return [...withoutExisting, saved].sort((a, b) => a.slug.localeCompare(b.slug));
    });
    setSelected(saved);
    setMessage("Static page saved.");
  }

  const sectionText =
    selected?.sections
      ?.map((section) => [section.title, section.body].join("\n"))
      .join("\n---\n") ?? "";

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="grid content-start gap-2 rounded-md border border-[#d9dde3] bg-white p-3 shadow-sm">
        {[...new Set([...DEFAULT_SLUGS, ...items.map((page) => page.slug)])].map((slug) => {
          const page = items.find((item) => item.slug === slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() =>
                setSelected(
                  page ?? {
                    id: slug,
                    slug,
                    eyebrow: "Page",
                    title: slug.replace(/-/g, " "),
                    intro: "Draft page intro.",
                    sections: [],
                    isPublished: true,
                  },
                )
              }
              className="rounded-md px-3 py-2 text-left text-sm font-bold hover:bg-[#f2f4f7]"
            >
              {slug}
            </button>
          );
        })}
      </aside>

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
        <label className="grid gap-1 text-sm font-bold">
          Slug
          <input name="slug" defaultValue={selected?.slug} required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Eyebrow
          <input name="eyebrow" defaultValue={selected?.eyebrow} required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Title
          <input name="title" defaultValue={selected?.title} required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Intro
          <textarea name="intro" defaultValue={selected?.intro} required rows={3} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Sections
          <textarea
            name="sections"
            defaultValue={sectionText}
            rows={12}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isPublished" type="checkbox" defaultChecked={selected?.isPublished ?? true} />
          Published
        </label>
        <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black shadow-[0_3px_0_#111]">
          Save Page
        </button>
      </form>
    </div>
  );
}
