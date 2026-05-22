import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import { connectToDatabase } from "@/lib/db";
import Donation from "@/models/Donation";

export const dynamic = "force-dynamic";

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountCents / 100);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

export default async function AdminDonationsPage() {
  const user = await requireSuperOrPermission("billing.read");
  await connectToDatabase();
  const donations = await Donation.find().sort({ createdAt: -1 }).lean();

  return (
    <AdminChrome title="Donation History" eyebrow="Admin / Donations" isSuperAdmin={user.role === "super-admin"}>
      <AdminPanel title="One-Time Donations">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#edf0f3] text-xs font-black uppercase text-[#667085]">
                <th className="px-3 py-2">Donor</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Purpose</th>
                <th className="px-3 py-2">Dedication</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation._id.toString()} className="border-b border-[#edf0f3] last:border-b-0">
                  <td className="px-3 py-3">
                    <p className="font-bold">{donation.firstName} {donation.lastName}</p>
                    <p className="text-xs text-[#667085]">{donation.email}</p>
                  </td>
                  <td className="px-3 py-3 font-bold">{formatMoney(donation.amountCents)}</td>
                  <td className="px-3 py-3">Aiding students through Zelos programs</td>
                  <td className="px-3 py-3">{donation.dedication || "-"}</td>
                  <td className="px-3 py-3 font-bold uppercase text-[#8c0504]">{donation.status}</td>
                  <td className="px-3 py-3">{formatDate(donation.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminChrome>
  );
}
