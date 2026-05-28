import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import StaticPage from "@/models/StaticPage";

export function serializeStaticPage(page: {
  _id: { toString(): string };
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string; points?: string[] }>;
  isPublished: boolean;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: page._id.toString(),
    slug: page.slug,
    eyebrow: page.eyebrow,
    title: page.title,
    intro: page.intro,
    sections: page.sections ?? [],
    isPublished: page.isPublished,
    updatedBy: page.updatedBy ?? null,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

export async function getPublishedStaticPage(slug: string) {
  await connectToDatabase();
  const page = await StaticPage.findOne({ slug, isPublished: true }).lean();
  return page ? serializeStaticPage(page) : null;
}

export async function getStaticPages() {
  await connectToDatabase();
  const pages = await StaticPage.find().sort({ slug: 1 }).lean();
  return pages.map(serializeStaticPage);
}

export async function upsertStaticPage(params: {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string; points?: string[] }>;
  isPublished?: boolean;
  updatedBy: string;
}) {
  await connectToDatabase();

  const page = await StaticPage.findOneAndUpdate(
    { slug: params.slug },
    {
      $set: {
        eyebrow: params.eyebrow,
        title: params.title,
        intro: params.intro,
        sections: params.sections,
        isPublished: params.isPublished ?? true,
        updatedBy: params.updatedBy,
      },
    },
    { new: true, upsert: true, runValidators: true },
  );

  if (!page) {
    throw new ApiError(500, "Unable to save static page.");
  }

  return page;
}
