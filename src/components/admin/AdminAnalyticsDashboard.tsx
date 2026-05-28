"use client";

import { Card, Progress, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

type CountRow = { _id: string | null; count: number };
type AnalyticsData = {
  subscribersByPlan: CountRow[];
  subscribersByTier: { free: number; paidRoleAccounts: number; byRole: CountRow[] };
  subscriptionsByCadenceAndStatus: Array<{
    _id: { planType: string; status: string; billingStatus: string };
    count: number;
  }>;
  subscriptionsByStatus: CountRow[];
  videoCompletionByTrack: Array<{ ageTrack: string; lessons: number; completions: number }>;
  videoCompletionByLesson: Array<{ id: string; title: string; ageTrack: string; audience: string; completions: number }>;
  schoolLicenseUtilization: Array<{ id: string; name: string; licenseStatus: string; teachers: string; students: string }>;
  swagStore: { orderVolume: number; paidRevenueCents: number };
  eventRsvpCounts: Array<{ id: string; title: string; status: string; rsvps: number }>;
  scholarshipListings: Array<{ id: string; name: string; status: string; awardAmountCents: number; numberOfRecipients: number; applicationDeadline: string }>;
  fundScholarshipLeadVolume: { total: number; byStatus: CountRow[] };
  engagement: { activeUsersLast30Days: number; completedLessons: number; totalEventRsvps: number };
  generalDonationHistory: Array<{ id: string; firstName: string; lastName: string; email: string; amountCents: number; status: string; createdAt: string }>;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function ChartCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; color?: string }>;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Card title={title} className="h-full rounded-md border-[#d9dde3]">
      <div className="grid gap-4">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-[#344054]">{row.label}</span>
              <span className="font-black text-[#8c0504]">{row.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#f2f4f7]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(4, (row.value / max) * 100)}%`,
                  backgroundColor: row.color ?? "#8c0504",
                }}
              />
            </div>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-[#667085]">No data yet.</p> : null}
      </div>
    </Card>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <Card className="rounded-md border-[#d9dde3]">
      <p className="text-xs font-black uppercase tracking-wide text-[#667085]">{label}</p>
      <p className="mt-2 text-3xl font-black leading-none text-[#111827]">{value}</p>
      <p className="mt-2 text-xs text-[#667085]">{detail}</p>
    </Card>
  );
}

export function AdminAnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const totalUsers = data.subscribersByTier.byRole.reduce((sum, row) => sum + row.count, 0);
  const lessonColumns: ColumnsType<AnalyticsData["videoCompletionByLesson"][number]> = [
    { title: "Lesson", dataIndex: "title", key: "title" },
    { title: "Audience", dataIndex: "audience", key: "audience", render: (value) => <Tag>{value}</Tag> },
    { title: "Age Track", dataIndex: "ageTrack", key: "ageTrack" },
    { title: "Completions", dataIndex: "completions", key: "completions", sorter: (a, b) => a.completions - b.completions },
  ];
  const schoolColumns: ColumnsType<AnalyticsData["schoolLicenseUtilization"][number]> = [
    { title: "School", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "licenseStatus", key: "licenseStatus", render: (value) => <Tag color={value === "active" ? "green" : "orange"}>{value}</Tag> },
    { title: "Teachers", dataIndex: "teachers", key: "teachers" },
    { title: "Students", dataIndex: "students", key: "students" },
  ];
  const eventColumns: ColumnsType<AnalyticsData["eventRsvpCounts"][number]> = [
    { title: "Event", dataIndex: "title", key: "title" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "RSVPs", dataIndex: "rsvps", key: "rsvps", sorter: (a, b) => a.rsvps - b.rsvps },
  ];
  const donationColumns: ColumnsType<AnalyticsData["generalDonationHistory"][number]> = [
    { title: "Donor", key: "donor", render: (_, row) => `${row.firstName} ${row.lastName}` },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Amount", dataIndex: "amountCents", key: "amountCents", render: money },
    { title: "Status", dataIndex: "status", key: "status", render: (value) => <Tag>{value}</Tag> },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={totalUsers} detail={`${data.engagement.activeUsersLast30Days} active in last 30 days`} />
        <MetricCard label="Subscribers" value={data.subscribersByTier.paidRoleAccounts} detail={`${data.subscribersByTier.free} free accounts`} />
        <MetricCard label="Store Revenue" value={money(data.swagStore.paidRevenueCents)} detail={`${data.swagStore.orderVolume} store orders`} />
        <MetricCard label="Scholarship Leads" value={data.fundScholarshipLeadVolume.total} detail="Fund-a-scholarship inquiries" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          title="Users by Role"
          rows={data.subscribersByTier.byRole.map((row) => ({ label: row._id ?? "unknown", value: row.count }))}
        />
        <ChartCard
          title="Subscriptions by Cadence"
          rows={data.subscribersByPlan.map((row) => ({ label: row._id ?? "unknown", value: row.count, color: "#b22222" }))}
        />
        <Card title="Engagement" className="rounded-md border-[#d9dde3]">
          <div className="grid gap-5">
            <Progress percent={Math.min(100, data.engagement.completedLessons)} strokeColor="#8c0504" format={() => `${data.engagement.completedLessons} lessons`} />
            <Progress percent={Math.min(100, data.engagement.totalEventRsvps)} strokeColor="#b22222" format={() => `${data.engagement.totalEventRsvps} RSVPs`} />
            <Progress percent={Math.min(100, data.engagement.activeUsersLast30Days)} strokeColor="#111827" format={() => `${data.engagement.activeUsersLast30Days} active users`} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Lesson Completion" className="rounded-md border-[#d9dde3]">
          <Table
            columns={lessonColumns}
            dataSource={data.videoCompletionByLesson}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 8 }}
          />
        </Card>
        <Card title="School License Utilization" className="rounded-md border-[#d9dde3]">
          <Table
            columns={schoolColumns}
            dataSource={data.schoolLicenseUtilization}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Event RSVPs" className="rounded-md border-[#d9dde3]">
          <Table columns={eventColumns} dataSource={data.eventRsvpCounts} rowKey="id" size="small" pagination={{ pageSize: 8 }} />
        </Card>
        <Card title="Donation History" className="rounded-md border-[#d9dde3]">
          <Table columns={donationColumns} dataSource={data.generalDonationHistory} rowKey="id" size="small" pagination={{ pageSize: 8 }} />
        </Card>
      </div>
    </div>
  );
}
