import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { AdminDonationsTable } from "@/components/admin/AdminDonationsTable";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import { connectToDatabase } from "@/lib/db";
import Donation from "@/models/Donation";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const user = await requireSuperOrPermission("billing.read");
  await connectToDatabase();
  const donations = await Donation.find().sort({ createdAt: -1 }).lean();

  return (
    <AdminChrome title="Donation History" eyebrow="Admin / Donations" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <AdminPanel title="One-Time Donations">
        <AdminDonationsTable
          donations={donations.map((donation) => ({
            id: donation._id.toString(),
            firstName: donation.firstName,
            lastName: donation.lastName,
            email: donation.email,
            amountCents: donation.amountCents,
            dedication: donation.dedication,
            status: donation.status,
            createdAt: donation.createdAt,
          }))}
        />
      </AdminPanel>
    </AdminChrome>
  );
}
