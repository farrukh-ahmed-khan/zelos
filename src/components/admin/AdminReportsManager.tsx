"use client";

import { useMemo, useState } from "react";
import { Button, Card, Space, Table, Tag, message as antMessage } from "antd";
import type { ColumnsType } from "antd/es/table";
import { api, isApiSuccess } from "@/lib/api/client";

type Report = {
  id: string;
  targetType: "thread" | "reply";
  targetId: string;
  reason: string;
  reporterId: string;
  status: "open" | "resolved" | "dismissed";
  resolvedBy?: string | null;
  resolvedAt?: string | Date | null;
  resolutionNote?: string | null;
  createdAt: string | Date;
  target: {
    id: string;
    authorId: string;
    content?: string | null;
    title?: string | null;
    isHidden: boolean;
  } | null;
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "N/A";
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
  if (status === "open") return "orange";
  if (status === "resolved") return "green";
  return "default";
}

export function AdminReportsManager({ reports }: { reports: Report[] }) {
  const [items, setItems] = useState(reports);
  const [actionId, setActionId] = useState<string | null>(null);
  const counts = useMemo(
    () => ({
      open: items.filter((item) => item.status === "open").length,
      resolved: items.filter((item) => item.status === "resolved").length,
      dismissed: items.filter((item) => item.status === "dismissed").length,
    }),
    [items],
  );

  async function resolveReport(report: Report, action: "dismiss" | "hide-target" | "ban-author") {
    setActionId(report.id);

    try {
      const response = await api.post(`/api/admin/forum/reports/${report.id}/resolve`, {
        action,
        note: action,
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to update report.");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === report.id
            ? {
                ...item,
                status: action === "dismiss" ? "dismissed" : "resolved",
                resolutionNote: action,
                resolvedAt: new Date().toISOString(),
                target: action === "hide-target" && item.target ? { ...item.target, isHidden: true } : item.target,
              }
            : item,
        ),
      );
      antMessage.success("Report updated.");
    } finally {
      setActionId(null);
    }
  }

  const columns: ColumnsType<Report> = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Open", value: "open" },
        { text: "Resolved", value: "resolved" },
        { text: "Dismissed", value: "dismissed" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: "Reported Content",
      key: "target",
      width: 320,
      render: (_, record) => (
        <div>
          <div className="font-bold text-[#111827]">
            {record.target?.title ?? record.target?.content ?? "Content unavailable"}
          </div>
          <div className="mt-1 text-xs text-[#667085]">
            {record.targetType} / {record.targetId}
          </div>
          {record.target?.isHidden ? <Tag color="red" className="mt-2">HIDDEN</Tag> : null}
        </div>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 280,
      render: (reason: string) => <p className="max-w-[280px] whitespace-normal text-sm text-[#344054]">{reason}</p>,
    },
    {
      title: "Reporter",
      dataIndex: "reporterId",
      key: "reporterId",
      width: 180,
      render: (reporterId: string) => <span className="font-mono text-xs">{reporterId}</span>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: formatDate,
    },
    {
      title: "Resolved",
      dataIndex: "resolvedAt",
      key: "resolvedAt",
      width: 170,
      render: formatDate,
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 240,
      render: (_, record) =>
        record.status === "open" ? (
          <Space wrap>
            <Button size="small" loading={actionId === record.id} onClick={() => resolveReport(record, "dismiss")}>
              Dismiss
            </Button>
            <Button size="small" danger loading={actionId === record.id} onClick={() => resolveReport(record, "hide-target")}>
              Hide
            </Button>
            <Button size="small" type="primary" loading={actionId === record.id} onClick={() => resolveReport(record, "ban-author")}>
              Revoke Posting
            </Button>
          </Space>
        ) : (
          <span className="text-xs font-bold uppercase text-[#667085]">{record.resolutionNote ?? "Actioned"}</span>
        ),
    },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-md border-[#d9dde3]">
          <p className="text-xs font-black uppercase tracking-wide text-[#667085]">Open</p>
          <p className="mt-2 text-3xl font-black leading-none text-[#111827]">{counts.open}</p>
        </Card>
        <Card className="rounded-md border-[#d9dde3]">
          <p className="text-xs font-black uppercase tracking-wide text-[#667085]">Resolved</p>
          <p className="mt-2 text-3xl font-black leading-none text-[#111827]">{counts.resolved}</p>
        </Card>
        <Card className="rounded-md border-[#d9dde3]">
          <p className="text-xs font-black uppercase tracking-wide text-[#667085]">Dismissed</p>
          <p className="mt-2 text-3xl font-black leading-none text-[#111827]">{counts.dismissed}</p>
        </Card>
      </div>

      <Card title="Forum Reports" className="rounded-md border-[#d9dde3]">
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
