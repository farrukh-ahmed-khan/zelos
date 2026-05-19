import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StudentInviteForm } from "@/components/school/StudentInviteForm";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { getSchoolResourcesForUser, serializeSchoolResource } from "@/lib/school-resources/service";
import { getSchoolProgress, getSchoolStudents } from "@/lib/schools/service";
import User from "@/models/User";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

function formatResourceScope(resource: ReturnType<typeof serializeSchoolResource>) {
  if (resource.schoolScope === "specific-schools") {
    return "Your School";
  }

  if (resource.schoolScope === "district") {
    return resource.district ? `District: ${resource.district}` : "District";
  }

  return "All Schools";
}

export default async function EducatorPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user || user.role !== "teacher" || !user.schoolId) redirect("/dashboard");

  const [resources, progress, students, upcomingVideos] = await Promise.all([
    getSchoolResourcesForUser(user),
    getSchoolProgress(user.schoolId),
    getSchoolStudents(user.schoolId),
    Video.find({
      audience: { $in: ["teacher", "student"] },
      releaseDate: { $gt: new Date() },
    }).sort({ releaseDate: 1 }).limit(12).lean(),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-4 text-[#202020] sm:p-6">
      <Header />
      <section className="container mt-12">
        <p className="text-xs font-black uppercase tracking-wide text-[#8c0504]">Educator Portal</p>
        <h1 className="mt-2 text-3xl font-black">Teacher Workspace</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-[#667085]">Students</p>
            <p className="mt-2 text-3xl font-black">{students.length}</p>
          </article>
          <article className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-[#667085]">Lessons</p>
            <p className="mt-2 text-3xl font-black">{progress.videos.length}</p>
          </article>
          <article className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-[#667085]">Resources</p>
            <p className="mt-2 text-3xl font-black">{resources.length}</p>
          </article>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <h2 className="font-bold">Class Progress</h2>
            <div className="mt-3 grid gap-2">
              {progress.students.map((student) => (
                <div key={student.id} className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm">
                  <p className="font-bold">{student.name}</p>
                  <p className="text-[#555]">{student.completionPercent}% complete / {student.completedVideoIds.length} completed</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <h2 className="font-bold">Invite Students</h2>
            <StudentInviteForm />
            <h2 className="mt-6 font-bold">Upcoming Schedule</h2>
            <div className="mt-3 grid gap-2">
              {upcomingVideos.map((video) => (
                <div key={video._id.toString()} className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm">
                  <p className="font-bold">{video.title}</p>
                  <p className="text-[#555]">{video.audience} / {video.ageTrack} / {video.releaseDate ? new Date(video.releaseDate).toLocaleString() : ""}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
          <h2 className="font-bold">Teacher Resources</h2>
          <div className="mt-3 grid gap-4">
            {[
              {
                title: "Specific To Your School",
                items: resources.map(serializeSchoolResource).filter((resource) => resource.schoolScope !== "all-schools"),
              },
              {
                title: "All Schools",
                items: resources.map(serializeSchoolResource).filter((resource) => resource.schoolScope === "all-schools"),
              },
            ].map((group) => (
              <div key={group.title}>
                <p className="text-xs font-black uppercase text-[#8c0504]">{group.title}</p>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {group.items.length ? (
                    group.items.map((item) => (
                      <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="rounded-md bg-[#f8fafc] p-3 !text-[#202020]">
                        <span className="rounded-sm bg-[#eaf3ff] px-2 py-1 text-[11px] font-black uppercase text-[#175cd3]">
                          {formatResourceScope(item)}
                        </span>
                        <p className="mt-2 font-bold">{item.title}</p>
                        <p className="text-sm text-[#555]">{item.resourceType} / Teacher</p>
                      </a>
                    ))
                  ) : (
                    <p className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm text-[#555]">
                      No resources available.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
      <Footer />
    </main>
  );
}
