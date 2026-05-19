"use client";

import { FormEvent, useMemo, useState } from "react";
import { Input, Select, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  audience: string;
  ageTrack: string;
  schoolScope: string;
  schoolIds: string[];
  district: string | null;
  releaseDate: string | null;
  order: number;
};

type School = {
  id: string;
  name: string;
  district: string | null;
  licenseStatus: string;
};

function formatResourceType(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Available now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatSchoolScope(resource: Resource) {
  if (resource.schoolScope === "specific-schools") {
    const count = resource.schoolIds.length;
    return count === 1 ? "1 school" : `${count} schools`;
  }

  if (resource.schoolScope === "district") {
    return resource.district || "District";
  }

  return "All schools";
}

export function AdminSchoolResourcesManager({
  resources,
  schools,
}: {
  resources: Resource[];
  schools: School[];
}) {
  const [items, setItems] = useState(resources);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [selectedSchoolScope, setSelectedSchoolScope] = useState("all-schools");
  const [selectedAudience, setSelectedAudience] = useState("teacher");
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
        resource.audience,
        resource.ageTrack,
        resource.schoolScope,
        resource.district ?? "",
        formatSchoolScope(resource),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchTerm]);

  const columns: TableColumnsType<Resource> = [
    {
      title: "Resource",
      dataIndex: "title",
      key: "title",
      width: 340,
      render: (_: string, resource) => (
        <div>
          <div className="font-bold text-[#202020]">{resource.order}. {resource.title}</div>
          {resource.description ? (
            <div className="line-clamp-2 text-xs text-[#667085]">{resource.description}</div>
          ) : null}
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-xs font-bold !text-[#8c0504]"
          >
            Open resource
          </a>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "resourceType",
      key: "resourceType",
      width: 170,
      render: (resourceType: string) => <Tag color="blue">{formatResourceType(resourceType)}</Tag>,
    },
    {
      title: "Audience",
      dataIndex: "audience",
      key: "audience",
      width: 170,
      render: (audience: string, resource) => (
        <div>
          <Tag color={audience === "teacher" ? "purple" : "green"}>
            {audience.toUpperCase()}
          </Tag>
          <div className="mt-1 text-xs text-[#667085]">
            {audience === "teacher" ? "No age track" : resource.ageTrack}
          </div>
        </div>
      ),
    },
    {
      title: "School Scope",
      dataIndex: "schoolScope",
      key: "schoolScope",
      width: 210,
      render: (_: string, resource) => (
        <div>
          <div className="font-bold capitalize text-[#202020]">
            {resource.schoolScope.replace("-", " ")}
          </div>
          <div className="text-xs text-[#667085]">{formatSchoolScope(resource)}</div>
        </div>
      ),
    },
    {
      title: "Schedule",
      dataIndex: "releaseDate",
      key: "releaseDate",
      width: 180,
      render: (releaseDate: string | null) => (
        <div>
          <div className="font-bold text-[#202020]">{releaseDate ? "Scheduled" : "Available now"}</div>
          <div className="text-xs text-[#667085]">{formatDateTime(releaseDate)}</div>
        </div>
      ),
    },
    {
      title: "File",
      dataIndex: "fileName",
      key: "fileName",
      width: 280,
      render: (fileName: string | null, resource) => (
        <div>
          <a href={resource.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold !text-[#8c0504]">
            {fileName ?? "Open uploaded file"}
          </a>
          <div className="truncate text-xs text-[#667085]">{resource.mimeType ?? "File"}</div>
        </div>
      ),
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
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/admin/school-resources", formData);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create resource.");
        return;
      }

      setItems((current) => [result.data.resource, ...current]);
      setMessage("School resource created.");
      form.reset();
      setSelectedSchoolIds([]);
      setSelectedSchoolScope("all-schools");
      setSelectedAudience("teacher");
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
        <label className="grid gap-2 text-sm font-bold">
          Resource title
          <input name="title" placeholder="Resource title" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Resource file
          <input
            name="resource"
            type="file"
            required
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Description
          <textarea name="description" placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Resource type
          <select name="resourceType" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
          <option value="lesson-plan">Lesson Plan PDF</option>
          <option value="teacher-guide">Teacher Guide PDF</option>
          <option value="student-worksheet">Student Worksheet</option>
          <option value="image">Image</option>
          <option value="document">Document</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="presentation">Presentation</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Audience
          <select
            name="audience"
            value={selectedAudience}
            onChange={(event) => {
              setSelectedAudience(event.target.value);
            }}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
          >
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          </select>
        </label>
        {selectedAudience === "student" ? (
          <label className="grid gap-2 text-sm font-bold">
            Age track
            <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
            <option value="">Age track</option>
            <option>Children</option>
            <option>Teens</option>
            <option>Young Adults</option>
            </select>
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-bold">
          School scope
          <select
            name="schoolScope"
            value={selectedSchoolScope}
            onChange={(event) => {
              setSelectedSchoolScope(event.target.value);
              setSelectedSchoolIds([]);
            }}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
          >
          <option value="all-schools">All Schools</option>
          <option value="specific-schools">Specific Schools</option>
          <option value="district">District</option>
          </select>
        </label>
        {selectedSchoolScope === "specific-schools" ? (
          <label className="grid gap-2 text-sm font-bold">
            Schools
            <input type="hidden" name="schoolIds" value={selectedSchoolIds.join(",")} />
            <Select
              mode="multiple"
              placeholder="Select schools"
              value={selectedSchoolIds}
              onChange={setSelectedSchoolIds}
              options={schools.map((school) => ({
                value: school.id,
                label: `${school.name}${school.district ? ` / ${school.district}` : ""}${school.licenseStatus !== "active" ? ` / ${school.licenseStatus}` : ""}`,
              }))}
              className="min-h-[48px] font-normal"
            />
          </label>
        ) : null}
        {selectedSchoolScope === "district" ? (
          <label className="grid gap-2 text-sm font-bold">
            District tag
            <input name="district" placeholder="District tag" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-bold">
          Release date
          <input name="releaseDate" type="datetime-local" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Order
          <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <div className="flex items-end md:col-span-2">
          <button
            disabled={isSubmitting}
            className="h-12 rounded-md bg-[#202020] px-8 text-sm font-bold text-white shadow-[0_3px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Uploading..." : "Add Resource"}
          </button>
        </div>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search resources by title, type, audience, school scope, or file"
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
          scroll={{ x: 1350 }}
          bordered
          locale={{ emptyText: "No school resources found" }}
        />
      </div>
    </div>
  );
}
