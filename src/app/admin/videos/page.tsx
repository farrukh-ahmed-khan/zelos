import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminVideosManager } from "@/components/admin/AdminVideosManager";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import ContentCategory from "@/models/ContentCategory";
import School from "@/models/School";
import User from "@/models/User";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user || !hasAdminPermission(user.role, user.adminPermissions, "content.manage")) {
    redirect("/dashboard");
  }

  const [videos, categories, schools] = await Promise.all([
    Video.find()
      .sort({ audience: 1, ageTrack: 1, order: 1 })
      .lean(),
    ContentCategory.find({ isActive: true })
      .sort({ audience: 1, ageTrack: 1, order: 1, name: 1, playlist: 1 })
      .lean(),
    School.find()
      .sort({ name: 1 })
      .select("name district")
      .lean(),
  ]);

  return (
    <AdminChrome title="Video Library" eyebrow="Admin / Content" isSuperAdmin={user.role === "super-admin"}>
      <AdminVideosManager
        videos={JSON.parse(JSON.stringify(videos.map((video) => ({
          id: video._id.toString(),
          title: video.title,
          description: video.description,
          url: video.url,
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
        categories={JSON.parse(JSON.stringify(categories.map((category) => ({
          id: category._id.toString(),
          name: category.name,
          playlist: category.playlist ?? "General",
          ageTrack: category.ageTrack,
          audience: category.audience,
        }))))}
        schools={JSON.parse(JSON.stringify(schools.map((school) => ({
          id: school._id.toString(),
          name: school.name,
          district: school.district ?? null,
        }))))}
      />
    </AdminChrome>
  );
}
