"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

type EmailRecord = {
  id: string;
  template: string;
  recipient: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  sentAt?: string | Date | null;
  error?: string | null;
  createdAt: string | Date;
};

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

function statusColor(status: string) {
  if (status === "sent") return "green";
  if (status === "failed") return "red";
  return "gold";
}

export function AdminEmailsTable({ emails }: { emails: EmailRecord[] }) {
  const templates = Array.from(new Set(emails.map((email) => email.template))).map((template) => ({
    text: template,
    value: template,
  }));

  const columns: ColumnsType<EmailRecord> = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Sent", value: "sent" },
        { text: "Failed", value: "failed" },
        { text: "Pending", value: "pending" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: "Template",
      dataIndex: "template",
      key: "template",
      width: 230,
      filters: templates,
      onFilter: (value, record) => record.template === value,
      sorter: (a, b) => a.template.localeCompare(b.template),
    },
    {
      title: "Recipient",
      dataIndex: "recipient",
      key: "recipient",
      width: 260,
      sorter: (a, b) => a.recipient.localeCompare(b.recipient),
    },
    {
      title: "Sent",
      dataIndex: "sentAt",
      key: "sentAt",
      width: 180,
      sorter: (a, b) => new Date(a.sentAt ?? 0).getTime() - new Date(b.sentAt ?? 0).getTime(),
      render: formatDate,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: formatDate,
    },
    {
      title: "Details",
      key: "details",
      width: 360,
      render: (_, email) =>
        email.error ? (
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
        ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={emails}
      rowKey="id"
      scroll={{ x: 1330 }}
      pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
    />
  );
}
