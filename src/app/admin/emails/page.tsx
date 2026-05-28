import { AdminChrome, AdminMetric } from "@/components/admin/AdminChrome";
import { AdminEmailsTable } from "@/components/admin/AdminEmailsTable";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import { connectToDatabase } from "@/lib/db";
import EmailOutbox from "@/models/EmailOutbox";

export const dynamic = "force-dynamic";

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
          <div className="p-4">
            <AdminEmailsTable
              emails={emails.map((email) => ({
                id: email._id.toString(),
                template: email.template,
                recipient: email.recipient,
                payload: email.payload,
                status: email.status,
                sentAt: email.sentAt,
                error: email.error,
                createdAt: email.createdAt,
              }))}
            />
          </div>
        </section>
      </div>
    </AdminChrome>
  );
}
