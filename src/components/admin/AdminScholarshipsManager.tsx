"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Input, Modal, Space, Table, Tag, message as antMessage } from "antd";
import type { TableColumnsType } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type ScholarshipItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  eligibility: string;
  field: string;
  awardAmountCents: number;
  numberOfRecipients: number;
  applicationDeadline: string | Date;
  selectionCriteria: string;
  applicationRequiresDocument: boolean;
  applicationDocumentLabel: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  status: "draft" | "active" | "closed" | "archived";
  featured: boolean;
  applicationCount: number;
};

type ApplicationItem = {
  id: string;
  scholarshipId: string;
  name: string;
  email: string;
  school: string;
  fieldOfStudy: string;
  gpa?: number;
  personalStatement: string;
  documentUrl: string | null;
  status: "submitted" | "reviewed" | "forwarded";
  forwardedAt: string | Date | null;
  createdAt: string | Date;
  scholarship: { name?: string; ownerName?: string | null; ownerEmail?: string | null } | null;
};

type ApiErrorResult = {
  error?: {
    message?: string;
    details?: {
      fieldErrors?: Record<string, string[]>;
    };
  };
};

const fieldLabels: Record<string, string> = {
  slug: "Slug",
  numberOfRecipients: "Number of recipients",
  applicationDeadline: "Application deadline",
  awardAmountCents: "Award amount",
  selectionCriteria: "Selection criteria",
};

function formatApiError(result: ApiErrorResult, fallback: string) {
  const fieldErrors = result.error?.details?.fieldErrors;
  const firstFieldError = fieldErrors
    ? Object.entries(fieldErrors).find(([, errors]) => errors.length > 0)
    : null;

  if (firstFieldError) {
    const [field, errors] = firstFieldError;
    return `${fieldLabels[field] ?? field}: ${errors[0]}`;
  }

  return result.error?.message ?? fallback;
}

function cents(value: FormDataEntryValue | null) {
  return Math.round(Number(value || 0) * 100);
}

function bool(value: FormDataEntryValue | null) {
  return value === "on";
}

function isoDate(value: FormDataEntryValue | null) {
  return new Date(String(value ?? "")).toISOString();
}

function formatDate(value: string | Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function AdminScholarshipsManager({
  scholarships,
  applications,
}: {
  scholarships: ScholarshipItem[];
  applications: ApplicationItem[];
}) {
  const [items, setItems] = useState(scholarships);
  const [queue, setQueue] = useState(applications);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeApplication, setActiveApplication] = useState<ApplicationItem | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.name, item.field, item.status, item.ownerName, item.ownerEmail].join(" ").toLowerCase().includes(query),
    );
  }, [items, search]);

  async function createScholarship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await api.post("/api/admin/scholarships", {
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        description: String(formData.get("description") ?? ""),
        eligibility: String(formData.get("eligibility") ?? ""),
        field: String(formData.get("field") ?? ""),
        awardAmountCents: cents(formData.get("awardAmount")),
        numberOfRecipients: Number(formData.get("numberOfRecipients") || 1),
        applicationDeadline: isoDate(formData.get("applicationDeadline")),
        selectionCriteria: String(formData.get("selectionCriteria") ?? ""),
        applicationRequiresDocument: bool(formData.get("applicationRequiresDocument")),
        applicationDocumentLabel: String(formData.get("applicationDocumentLabel") ?? ""),
        ownerName: String(formData.get("ownerName") ?? ""),
        ownerEmail: String(formData.get("ownerEmail") ?? ""),
        status: String(formData.get("status") ?? "draft"),
        featured: bool(formData.get("featured")),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(formatApiError(result, "Unable to create scholarship."));
        return;
      }

      setItems((current) => [{ ...result.data.scholarship, applicationCount: 0 }, ...current]);
      event.currentTarget.reset();
      antMessage.success("Scholarship created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(scholarship: ScholarshipItem, status: ScholarshipItem["status"]) {
    const response = await api.patch(`/api/admin/scholarships/${scholarship.id}`, { status });
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(formatApiError(result, "Unable to update scholarship."));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === scholarship.id ? { ...item, ...result.data.scholarship } : item)),
    );
    antMessage.success("Scholarship updated.");
  }

  async function markForwarded(application: ApplicationItem) {
    const response = await api.post(`/api/admin/scholarship-applications/${application.id}/forward`, {});
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(formatApiError(result, "Unable to mark application forwarded."));
      return;
    }

    setQueue((current) =>
      current.map((item) =>
        item.id === application.id ? { ...item, status: "forwarded", forwardedAt: new Date().toISOString() } : item,
      ),
    );
    setActiveApplication(null);
    antMessage.success("Application marked as forwarded.");
  }

  const scholarshipColumns: TableColumnsType<ScholarshipItem> = [
    {
      title: "Listing",
      key: "listing",
      width: 330,
      render: (_, scholarship) => (
        <div>
          <div className="font-bold text-[#202020]">{scholarship.name}</div>
          <div className="text-xs text-[#667085]">{scholarship.field} / {scholarship.slug}</div>
          <a href={`/scholarships/${scholarship.slug}`} target="_blank" rel="noreferrer" className="text-xs font-bold !text-[#8c0504]">
            Open public page
          </a>
        </div>
      ),
    },
    {
      title: "Award",
      key: "award",
      width: 160,
      render: (_, scholarship) => (
        <div>
          <div className="font-bold">${(scholarship.awardAmountCents / 100).toLocaleString()}</div>
          <div className="text-xs text-[#667085]">{scholarship.numberOfRecipients} recipient{scholarship.numberOfRecipients === 1 ? "" : "s"}</div>
        </div>
      ),
    },
    { title: "Deadline", dataIndex: "applicationDeadline", width: 140, render: formatDate },
    {
      title: "Status",
      dataIndex: "status",
      width: 130,
      render: (status: ScholarshipItem["status"]) => <Tag color={status === "active" ? "green" : status === "archived" ? "default" : "orange"}>{status.toUpperCase()}</Tag>,
    },
    { title: "Apps", dataIndex: "applicationCount", width: 90 },
    {
      title: "Action",
      key: "action",
      width: 260,
      render: (_, scholarship) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => updateStatus(scholarship, "active")}>Activate</Button>
          <Button size="small" onClick={() => updateStatus(scholarship, "closed")}>Close</Button>
          <Button size="small" danger onClick={() => updateStatus(scholarship, "archived")}>Archive</Button>
        </Space>
      ),
    },
  ];

  const applicationColumns: TableColumnsType<ApplicationItem> = [
    {
      title: "Applicant",
      key: "applicant",
      width: 280,
      render: (_, application) => (
        <div>
          <div className="font-bold">{application.name}</div>
          <div className="text-xs text-[#667085]">{application.email}</div>
          <div className="text-xs text-[#667085]">{application.school} / {application.fieldOfStudy}</div>
        </div>
      ),
    },
    { title: "Scholarship", key: "scholarship", width: 240, render: (_, application) => application.scholarship?.name ?? application.scholarshipId },
    { title: "Submitted", dataIndex: "createdAt", width: 140, render: formatDate },
    {
      title: "Status",
      dataIndex: "status",
      width: 130,
      render: (status: ApplicationItem["status"]) => <Tag color={status === "forwarded" ? "green" : "blue"}>{status.toUpperCase()}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      width: 220,
      render: (_, application) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => setActiveApplication(application)}>View</Button>
          <Button size="small" onClick={() => markForwarded(application)} disabled={application.status === "forwarded"}>Forwarded</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <form onSubmit={createScholarship} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="name" required placeholder="Scholarship name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input
          name="slug"
          required
          pattern="[a-z0-9-]+"
          title="Use lowercase letters, numbers, and hyphens only."
          placeholder="dynamic-url-slug"
          className="rounded-md border border-[#d8d2c5] px-3 py-3"
        />
        <textarea name="description" required rows={4} placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <textarea name="eligibility" required rows={3} placeholder="Eligibility" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="selectionCriteria" required rows={3} placeholder="Selection criteria" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="field" required placeholder="Field" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="awardAmount" required type="number" min="0" step="1" placeholder="Award amount in dollars" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="numberOfRecipients" required type="number" min="1" max="100" defaultValue="1" placeholder="Number of recipients" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="applicationDeadline" required type="date" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="ownerName" placeholder="Scholarship owner name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="ownerEmail" type="email" placeholder="Scholarship owner email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="applicationDocumentLabel" placeholder="Required document label" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="applicationRequiresDocument" type="checkbox" /> Require document upload
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="featured" type="checkbox" /> Feature on homepage
        </label>
        <select name="status" defaultValue="draft" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
        <button disabled={isSubmitting} className="h-12 w-fit rounded-md bg-[#202020] px-8 text-sm font-bold text-white shadow-[0_3px_0_#111] disabled:opacity-60">
          {isSubmitting ? "Creating..." : "Create Listing"}
        </button>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input allowClear placeholder="Search scholarships" value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-xl" />
        <Table rowKey="id" columns={scholarshipColumns} dataSource={filteredItems} scroll={{ x: 1310 }} bordered />
      </div>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-[#111827]">Application Review Queue</h2>
        <Table rowKey="id" columns={applicationColumns} dataSource={queue} scroll={{ x: 1010 }} bordered />
      </div>

      <Modal title="Application Details" open={Boolean(activeApplication)} onCancel={() => setActiveApplication(null)} footer={null} width={760}>
        {activeApplication ? (
          <div className="grid gap-3 text-sm">
            <p><strong>Scholarship:</strong> {activeApplication.scholarship?.name ?? activeApplication.scholarshipId}</p>
            <p><strong>Owner:</strong> {activeApplication.scholarship?.ownerName ?? "Not set"} / {activeApplication.scholarship?.ownerEmail ?? "Not set"}</p>
            <p><strong>Applicant:</strong> {activeApplication.name} / {activeApplication.email}</p>
            <p><strong>School:</strong> {activeApplication.school}</p>
            <p><strong>Field of study:</strong> {activeApplication.fieldOfStudy}</p>
            <p><strong>GPA:</strong> {activeApplication.gpa ?? "Not provided"}</p>
            <p className="whitespace-pre-wrap"><strong>Personal statement:</strong><br />{activeApplication.personalStatement}</p>
            {activeApplication.documentUrl ? <a href={activeApplication.documentUrl} target="_blank" rel="noreferrer" className="font-bold !text-[#8c0504]">Open uploaded document</a> : null}
            <Button type="primary" onClick={() => markForwarded(activeApplication)} disabled={activeApplication.status === "forwarded"} className="w-fit">
              Mark forwarded off-platform
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
