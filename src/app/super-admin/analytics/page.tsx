import {
  SuperAdminChrome,
  SuperAdminMetric,
  SuperAdminPanel,
  SuperAdminRow,
  SuperAdminTable,
} from "@/components/super-admin/SuperAdminChrome";
import { getSuperAdminAnalyticsDashboard } from "@/lib/super-admin/dashboard";
import { requireSuperAdminPage } from "@/lib/super-admin/guard";

export const dynamic = "force-dynamic";

export default async function SuperAdminAnalyticsPage() {
  await requireSuperAdminPage();
  const data = await getSuperAdminAnalyticsDashboard();
  const totalCompletions = data.lessonCompletion.reduce(
    (sum, lesson) => sum + lesson.completions,
    0,
  );

  return (
    <SuperAdminChrome title="Analytics" eyebrow="Super Admin / Analytics">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetric label="Video Completions" value={totalCompletions} detail={`${data.lessonCompletion.length} lessons tracked`} />
        <SuperAdminMetric label="Schools" value={data.schools.length} detail="License records" />
        {data.emails.map((email) => (
          <SuperAdminMetric key={email._id ?? "unknown"} label="Email Outbox" value={email.count} detail={email._id ?? "unknown"} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SuperAdminPanel title="Lesson Completion">
          <SuperAdminTable>
            {data.lessonCompletion
              .sort((a, b) => b.completions - a.completions)
              .slice(0, 12)
              .map((lesson) => (
                <SuperAdminRow
                  key={lesson.id}
                  title={lesson.title}
                  meta={`${lesson.audience} / ${lesson.ageTrack}`}
                  value={`${lesson.completions} complete`}
                />
              ))}
          </SuperAdminTable>
        </SuperAdminPanel>

        <SuperAdminPanel title="School Licenses">
          <SuperAdminTable>
            {data.schools.map((school) => (
              <SuperAdminRow
                key={school._id.toString()}
                title={school.name}
                meta={`Teachers ${school.teachersCount}/${school.teacherLimit} / students ${school.studentsCount}/${school.studentLimit}`}
                value={school.licenseStatus}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SuperAdminPanel title="Public Forms">
          <div className="grid gap-3 sm:grid-cols-2">
            {data.forms.map((form) => (
              <SuperAdminMetric key={form._id ?? "unknown"} label="Form Type" value={form.count} detail={form._id ?? "unknown"} />
            ))}
          </div>
        </SuperAdminPanel>

        <SuperAdminPanel title="Recent Events">
          <SuperAdminTable>
            {data.events.map((event) => (
              <SuperAdminRow
                key={event._id.toString()}
                title={event.title}
                meta={new Date(event.date).toLocaleDateString()}
                value={event.status}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>
    </SuperAdminChrome>
  );
}
