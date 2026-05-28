"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

type DonationRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  amountCents: number;
  dedication?: string | null;
  status: string;
  createdAt: string | Date;
};

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountCents / 100);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function AdminDonationsTable({ donations }: { donations: DonationRecord[] }) {
  const statuses = Array.from(new Set(donations.map((donation) => donation.status))).map((status) => ({
    text: status,
    value: status,
  }));

  const columns: ColumnsType<DonationRecord> = [
    {
      title: "Donor",
      key: "donor",
      width: 260,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_, donation) => (
        <div>
          <p className="font-bold">{donation.firstName} {donation.lastName}</p>
          <p className="text-xs text-[#667085]">{donation.email}</p>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amountCents",
      key: "amountCents",
      width: 140,
      sorter: (a, b) => a.amountCents - b.amountCents,
      render: (amount) => <span className="font-bold">{formatMoney(amount)}</span>,
    },
    {
      title: "Purpose",
      key: "purpose",
      width: 260,
      render: () => "Aiding students through Zelos programs",
    },
    {
      title: "Dedication",
      dataIndex: "dedication",
      key: "dedication",
      width: 260,
      render: (value) => value || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      filters: statuses,
      onFilter: (value, record) => record.status === value,
      render: (status) => <Tag color={status === "paid" ? "green" : "gold"}>{status.toUpperCase()}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: formatDate,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={donations}
      rowKey="id"
      scroll={{ x: 1200 }}
      pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
    />
  );
}
