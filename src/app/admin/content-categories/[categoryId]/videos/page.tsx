import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminVideosManager } from "@/components/admin/AdminVideosManager";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import ContentCategory from "@/models/ContentCategory";
import School from "@/models/School";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function AdminPlaylistVideosPage({ params }: PageProps) {
  const user = await requireSuperOrPermission("content.manage");
  const { categoryId } = await params;

  if (!Types.ObjectId.isValid(categoryId)) {
    redirect("/admin/content-categories");
  }

  const category = await ContentCategory.findById(categoryId).lean();

  if (!category) {
    redirect("/admin/content-categories");
  }

  const [videos, schools] = await Promise.all([
    Video.find({
      audience: category.audience,
      ageTrack: category.ageTrack,
      category: category.name,
      playlist: category.playlist ?? "General",
    })
      .sort({ order: 1, createdAt: -1 })
      .lean(),
    School.find()
      .sort({ name: 1 })
      .select("name district")
      .lean(),
  ]);

  const serializedCategory = {
    id: category._id.toString(),
    name: category.name,
    playlist: category.playlist ?? "General",
    ageTrack: category.ageTrack,
    audience: category.audience,
  };

  return (
    <AdminChrome
      title={`Upload Videos: ${category.playlist ?? "General"}`}
      eyebrow="Admin / Content / Playlist"
      isSuperAdmin={user.role === "super-admin"}
    >
      <AdminVideosManager
        videos={JSON.parse(JSON.stringify(videos.map((video) => ({
          id: video._id.toString(),
          title: video.title,
          description: video.description,
          ageTrack: video.ageTrack,
          audience: video.audience,
          category: video.category,
          playlist: video.playlist ?? "General",
          schoolScope: video.schoolScope ?? (["teacher", "student"].includes(video.audience) ? "all-schools" : "global"),
          schoolIds: video.schoolIds ?? [],
          district: video.district ?? null,
          order: video.order,
          releaseDate: video.releaseDate,
          dripEnabled: video.dripEnabled,
          isFreePreview: video.isFreePreview,
          isMissionVideo: video.isMissionVideo,
        }))))}
        categories={[serializedCategory]}
        schools={JSON.parse(JSON.stringify(schools.map((school) => ({
          id: school._id.toString(),
          name: school.name,
          district: school.district ?? null,
        }))))}
        playlistContext={serializedCategory}
      />
    </AdminChrome>
  );
}
