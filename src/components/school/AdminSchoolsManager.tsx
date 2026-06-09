"use client";

import { FormEvent, useState, useMemo } from "react";
import { Table, Input, Button, Tag, Space, Select, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type School = {
  id: string;
  name: string;
  licenseType: string;
  district: string | null;
  teacherLimit: number;
  studentLimit: number;
  teachersCount: number;
  studentsCount: number;
  licenseStatus: string;
  assignedTracks: string[];
};

const levelTrackOptions = [
  { label: "Children", value: "children" },
  { label: "Teens", value: "teens" },
  { label: "Young Adults", value: "young-adults" },
];

export function AdminSchoolsManager({ schools }: { schools: School[] }) {
  const [items, setItems] = useState(schools);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [invitingSchoolId, setInvitingSchoolId] = useState<string | null>(null);
  const [assignedTracks, setAssignedTracks] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(
      (school) =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.district?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  async function createSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await api.post("/api/schools", {
        name: String(formData.get("name") ?? ""),
        licenseType: String(formData.get("licenseType") ?? "school"),
        district: String(formData.get("district") ?? ""),
        teacherLimit: Number(formData.get("teacherLimit") ?? 1),
        studentLimit: Number(formData.get("studentLimit") ?? 1),
        licenseStatus: String(formData.get("licenseStatus") ?? "active"),
        assignedTracks: formData.getAll("assignedTracks").map(String).filter(Boolean),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to create school.");
        return;
      }

      setItems((current) => [result.data.school, ...current]);
      antMessage.success("School created successfully.");
      form.reset();
      setAssignedTracks([]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function inviteTeacher(event: FormEvent<HTMLFormElement>, schoolId: string) {
    event.preventDefault();
    setInvitingSchoolId(schoolId);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await api.post(`/api/schools/${schoolId}/invite-teacher`, {
        email: String(formData.get("email") ?? ""),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to invite teacher.");
        return;
      }

      antMessage.success(`Teacher invite created for ${formData.get("email")}`);
      form.reset();
    } finally {
      setInvitingSchoolId(null);
    }
  }

  const columns: TableColumnsType<School> = [
    {
      title: "School Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string, record: School) => (
        <div>
          <div className="font-bold text-[#202020]">{text}</div>
          {record.district && <div className="text-xs text-[#667085]">{record.district}</div>}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "licenseType",
      key: "licenseType",
      width: 100,
      render: (text: string) => <span className="capitalize">{text}</span>,
    },
    {
      title: "License Status",
      dataIndex: "licenseStatus",
      key: "licenseStatus",
      width: 120,
      render: (status: string) => {
        const colors: { [key: string]: string } = {
          active: "green",
          expired: "orange",
          suspended: "red",
        };
        return <Tag color={colors[status] || "default"}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Teachers",
      dataIndex: "teachersCount",
      key: "teachers",
      width: 100,
      render: (_, record: School) => `${record.teachersCount}/${record.teacherLimit}`,
    },
    {
      title: "Students",
      dataIndex: "studentsCount",
      key: "students",
      width: 100,
      render: (_, record: School) => `${record.studentsCount}/${record.studentLimit}`,
    },
    {
      title: "Tracks",
      dataIndex: "assignedTracks",
      key: "tracks",
      width: 150,
      render: (tracks: string[]) =>
        tracks?.length ? (
          <Space size="small" wrap>
            {tracks.map((track) => (
              <Tag key={track} color="blue">
                {track}
              </Tag>
            ))}
          </Space>
        ) : (
          <span className="text-[#999]">—</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_, record: School) => (
        <form onSubmit={(e) => inviteTeacher(e, record.id)} className="flex gap-1">
          <input
            name="email"
            type="email"
            placeholder="Teacher email"
            required
            className="flex-1 rounded-md border border-[#d8d2c5] px-2 py-1.5 text-xs"
          />
          <Button
            type="primary"
            size="small"
            htmlType="submit"
            loading={invitingSchoolId === record.id}
          >
            Invite
          </Button>
        </form>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: filteredItems.length,
    onChange: (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
    },
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} school${total !== 1 ? "s" : ""}`,
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={createSchool} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          School / District Name
          <input name="name" placeholder="Example: Lincoln Middle School" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          License Type
          <select name="licenseType" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
            <option value="school">School</option>
            <option value="district">District</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          District Tag
          <input name="district" placeholder="Optional, e.g. Dallas ISD" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          License Status
          <select name="licenseStatus" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          Teacher Seat Limit
          <input name="teacherLimit" type="number" min={1} defaultValue={5} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
          <span className="text-xs font-normal text-[#667085]">Maximum teacher accounts this school can invite.</span>
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          Student / Children Seat Limit
          <input name="studentLimit" type="number" min={1} defaultValue={100} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
          <span className="text-xs font-normal text-[#667085]">Maximum student/child accounts teachers can invite.</span>
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054] md:col-span-2">
          Assigned Level Tracks
          <Select
            mode="multiple"
            allowClear
            value={assignedTracks}
            onChange={setAssignedTracks}
            options={levelTrackOptions}
            placeholder="Select level tracks"
            className="font-normal"
            size="large"
            getPopupContainer={(triggerNode) => triggerNode.parentElement ?? document.body}
            optionFilterProp="label"
            dropdownStyle={{ zIndex: 1100 }}
          />
          {assignedTracks.map((track) => (
            <input key={track} type="hidden" name="assignedTracks" value={track} />
          ))}
        </label>
        <button
          disabled={isSubmitting}
          className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create School"}
        </button>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          placeholder="Search schools by name or district..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          size="large"
          className="mb-2"
        />
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={pagination}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: "No schools found",
          }}
        />
      </div>
    </div>
  );
}
