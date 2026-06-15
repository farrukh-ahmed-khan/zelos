import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { getFormSubmissions } from "@/lib/forms/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

export default async function AdminFormsPage() {
  const user = await requireSuperOrPermission("users.manage-limited");
  const submissions = await getFormSubmissions("scholarship-inquiry");

  return (
    <AdminChrome title="Fund a Scholarship Leads" eyebrow="Admin / Forms" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <AdminPanel title="Scholarship Funder Leads">
        <div className="grid gap-3">
          {submissions.map((submission) => (
            <article key={submission._id.toString()} className="rounded-md border border-[#d9dde3] p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-black">{submission.name}</h2>
                  <p className="text-[#667085]">{submission.email}</p>
                </div>
                <p className="text-xs font-black uppercase text-[#8c0504]">{formatDate(submission.createdAt)}</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap">{submission.message}</p>
              <dl className="mt-3 grid gap-2 rounded-md bg-[#f8fafc] p-3 sm:grid-cols-2">
                <div><dt className="font-bold">Budget range</dt><dd>{submission.metadata?.budgetRange as string}</dd></div>
                <div><dt className="font-bold">Contact</dt><dd>{submission.metadata?.contact as string}</dd></div>
                <div><dt className="font-bold">Audience</dt><dd>{submission.metadata?.intendedAudience as string}</dd></div>
                <div><dt className="font-bold">Notes</dt><dd>{(submission.metadata?.notes as string) || "-"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </AdminPanel>
    </AdminChrome>
  );
}
