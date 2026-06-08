"use client";

import { FormEvent, useMemo, useState } from "react";
import { Input, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string | null;
  fileName: string | null;
  mimeType: string | null;
  linkedVideoId: string | null;
  ageTrack: string;
  order: number;
  answers: string[];
  unlocked?: boolean;
};

function formatResourceType(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function formatAgeTrack(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function AdminToolkitManager({ resources }: { resources: Resource[] }) {
  const [items, setItems] = useState(resources);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((resource) =>
      [
        resource.title,
        resource.description ?? "",
        resource.resourceType,
        resource.fileName ?? "",
        resource.mimeType ?? "",
        resource.ageTrack,
        resource.linkedVideoId ?? "always unlocked",
        resource.answers.join(" "),
      ].join(" ").toLowerCase().includes(query),
    );
  }, [items, searchTerm]);

  const typeFilters = useMemo(
    () =>
      Array.from(new Set(items.map((resource) => resource.resourceType))).map((value) => ({
        text: formatResourceType(value),
        value,
      })),
    [items],
  );

  const ageTrackFilters = useMemo(
    () =>
      Array.from(new Set(items.map((resource) => resource.ageTrack))).map((value) => ({
        text: formatAgeTrack(value),
        value,
      })),
    [items],
  );

  const columns: TableColumnsType<Resource> = [
    {
      title: "Resource",
      dataIndex: "title",
      key: "title",
      width: 360,
      render: (_: string, resource) => (
        <div>
          <div className="font-bold text-[#202020]">{resource.order}. {resource.title}</div>
          {resource.description ? <div className="line-clamp-2 text-xs text-[#667085]">{resource.description}</div> : null}
          {resource.url ? (
            <a href={resource.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-bold !text-[#8c0504]">
              Open resource
            </a>
          ) : null}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "resourceType",
      key: "resourceType",
      width: 190,
      filters: typeFilters,
      onFilter: (value, resource) => resource.resourceType === String(value),
      render: (resourceType: string) => <Tag color="blue">{formatResourceType(resourceType)}</Tag>,
    },
    {
      title: "Age Track",
      dataIndex: "ageTrack",
      key: "ageTrack",
      width: 160,
      filters: ageTrackFilters,
      onFilter: (value, resource) => resource.ageTrack === String(value),
      render: (ageTrack: string) => <Tag color="purple">{formatAgeTrack(ageTrack)}</Tag>,
    },
    {
      title: "Unlock",
      dataIndex: "linkedVideoId",
      key: "linkedVideoId",
      width: 240,
      render: (linkedVideoId: string | null) => (
        <div>
          <div className="font-bold text-[#202020]">{linkedVideoId ? "Lesson gated" : "Always unlocked"}</div>
          {linkedVideoId ? <div className="truncate text-xs text-[#667085]">{linkedVideoId}</div> : null}
        </div>
      ),
    },
    {
      title: "Answers",
      dataIndex: "answers",
      key: "answers",
      width: 110,
      render: (answers: string[]) => <Tag color={answers.length ? "green" : "default"}>{answers.length}</Tag>,
    },
    {
      title: "File",
      dataIndex: "fileName",
      key: "fileName",
      width: 280,
      render: (fileName: string | null, resource) => (
        <div>
          {resource.url ? (
            <a href={resource.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold !text-[#8c0504]">
              {fileName ?? "Open uploaded file"}
            </a>
          ) : (
            <span className="block text-sm font-bold text-[#667085]">No file URL</span>
          )}
          <div className="truncate text-xs text-[#667085]">{resource.mimeType ?? "File"}</div>
        </div>
      ),
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 100,
      sorter: (a, b) => a.order - b.order,
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} resource${total === 1 ? "" : "s"}`,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("isActive", "true");

    try {
      const response = await api.post("/api/admin/toolkit", formData);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create toolkit resource.");
        return;
      }

      setItems((current) => [result.data.resource, ...current]);
      setMessage("Toolkit resource created.");
      form.reset();
      setCurrentPage(1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="title" placeholder="Resource title" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input
          name="resource"
          type="file"
          required
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3"
        />
        <textarea name="description" placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <select name="resourceType" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="worksheet">Worksheet</option>
          <option value="quiz">Self-Guided Quiz</option>
          <option value="budget-template">Budget Template</option>
          <option value="goal-setting">Goal-Setting Worksheet</option>
          <option value="family-prompt">Discussion Prompt</option>
        </select>
        <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="">Age track</option>
          <option>Children</option>
          <option>Teens</option>
          <option>Young Adults</option>
        </select>
        <input name="linkedVideoId" placeholder="Linked completed lesson video ID" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="answers" placeholder="Quiz answers, one per line" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <button disabled={isSubmitting} className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Adding..." : "Add Toolkit Resource"}
        </button>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search toolkit resources by title, type, age track, lesson, or file"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          className="max-w-xl"
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          pagination={pagination}
          scroll={{ x: 1440 }}
          bordered
          locale={{ emptyText: "No toolkit resources found" }}
        />
      </div>
    </div>
  );
}
