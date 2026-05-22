import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getScholarshipByIdOrSlug } from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

export default async function ScholarshipAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarshipDoc = await getScholarshipByIdOrSlug(id);

  if (!scholarshipDoc) {
    notFound();
  }

  redirect(`/scholarships/${scholarshipDoc.slug}`);
}
