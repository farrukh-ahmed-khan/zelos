import { AdminChrome, AdminMetric } from "@/components/admin/AdminChrome";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import { connectToDatabase } from "@/lib/db";
import EmailOutbox from "@/models/EmailOutbox";

export const dynamic = "force-dynamic";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not sent";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "sent") {
    return "bg-[#eef8e8] text-[#24551f]";
  }

  if (status === "failed") {
    return "bg-[#ffe8e6] text-[#8c0504]";
  }

  return "bg-[#fff8d9] text-[#8c5a04]";
}

export default async function AdminEmailsPage() {
  const user = await requireSuperOrPermission("users.manage-limited");
  await connectToDatabase();

  const [emails, sentCount, failedCount, pendingCount] = await Promise.all([
    EmailOutbox.find().sort({ createdAt: -1 }).limit(200).lean(),
    EmailOutbox.countDocuments({ status: "sent" }),
    EmailOutbox.countDocuments({ status: "failed" }),
    EmailOutbox.countDocuments({ status: "pending" }),
  ]);

  return (
    <AdminChrome title="Email Outbox" eyebrow="Admin / Notifications" isSuperAdmin={user.role === "super-admin"}>
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetric label="Sent" value={sentCount} detail="Delivered through configured mail transport" />
          <AdminMetric label="Failed" value={failedCount} detail="Needs mail config or delivery review" />
          <AdminMetric label="Pending" value={pendingCount} detail="Queued records awaiting delivery" />
        </div>

        <section className="overflow-hidden rounded-md border border-[#d9dde3] bg-white shadow-sm">
          <div className="border-b border-[#edf0f3] px-4 py-3">
            <h2 className="text-base font-black text-[#111827]">Recent Emails</h2>
            <p className="mt-1 text-xs text-[#667085]">Showing the latest 200 outbox records.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f3]">
                {emails.map((email) => (
                  <tr key={email._id.toString()} className="align-top">
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-2 py-1 text-xs font-black uppercase ${statusClass(email.status)}`}>
                        {email.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#111827]">{email.template}</td>
                    <td className="px-4 py-3 text-[#344054]">{email.recipient}</td>
                    <td className="px-4 py-3 text-[#667085]">{formatDate(email.sentAt)}</td>
                    <td className="px-4 py-3 text-[#667085]">{formatDate(email.createdAt)}</td>
                    <td className="px-4 py-3">
                      {email.error ? (
                        <p className="max-w-[320px] text-xs font-bold text-[#8c0504]">{email.error}</p>
                      ) : (
                        <details className="max-w-[360px]">
                          <summary className="cursor-pointer text-xs font-black uppercase text-[#8c0504]">
                            Payload
                          </summary>
                          <pre className="mt-2 max-h-44 overflow-auto rounded-md bg-[#f8fafc] p-3 text-xs text-[#344054]">
                            {JSON.stringify(email.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
                {!emails.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#667085]">
                      No email records found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminChrome>
  );
}
