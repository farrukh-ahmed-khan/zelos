"use client";

import { FormEvent, useMemo, useState } from "react";
import { Table, Input, Button, Tag, Space, Select, Modal, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type School = {
  id: string;
  name: string;
  district: string | null;
  teacherLimit: number;
  studentLimit: number;
  teachersCount: number;
  studentsCount: number;
  licenseStatus: string;
  licenseDurationMonths: number;
  licenseExpiresAt: string | null;
  assignedTracks: string[];
};

const levelTrackOptions = [
  { label: "All", value: "all" },
  { label: "Children", value: "child" },
  { label: "Teens", value: "teen" },
  { label: "Young Adults", value: "young-adult" },
  { label: "Adults", value: "adult" },
];

function formatTrack(track: string) {
  return levelTrackOptions.find((option) => option.value === track)?.label ?? track;
}

function formatDate(value: string | null) {
  if (!value) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminSchoolsManager({ schools }: { schools: School[] }) {
  const [items, setItems] = useState(schools);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [invitingSchoolId, setInvitingSchoolId] = useState<string | null>(null);
  const [statusSchoolId, setStatusSchoolId] = useState<string | null>(null);
  const [assignedTracks, setAssignedTracks] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((school) =>
      [
        school.name,
        school.district ?? "",
        school.licenseStatus,
        school.assignedTracks.map(formatTrack).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
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
        teacherLimit: Number(formData.get("teacherLimit") ?? 1),
        studentLimit: Number(formData.get("studentLimit") ?? 1),
        licenseDurationMonths: Number(formData.get("licenseDurationMonths") ?? 12),
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

  async function updateSchoolStatus(school: School, licenseStatus: "active" | "suspended") {
    setStatusSchoolId(school.id);
    try {
      const response = await api.patch(`/api/schools/${school.id}`, { licenseStatus });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to update school subscription.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === school.id ? { ...item, ...result.data.school } : item)),
      );
      antMessage.success(
        licenseStatus === "suspended" ? "School subscription suspended." : "School subscription reactivated.",
      );
    } finally {
      setStatusSchoolId(null);
    }
  }

  function confirmStatusChange(school: School) {
    const nextStatus = school.licenseStatus === "suspended" ? "active" : "suspended";

    Modal.confirm({
      title: nextStatus === "suspended" ? "Suspend school subscription?" : "Reactivate school subscription?",
      content:
        nextStatus === "suspended"
          ? "Students and teachers at this school will lose school subscription access until reactivated."
          : "Students and teachers at this school will regain school subscription access.",
      okText: nextStatus === "suspended" ? "Suspend" : "Reactivate",
      okButtonProps: { danger: nextStatus === "suspended" },
      onOk: () => updateSchoolStatus(school, nextStatus),
    });
  }

  const columns: TableColumnsType<School> = [
    {
      title: "School Name",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (text: string, record: School) => (
        <div>
          <div className="font-bold text-[#202020]">{text}</div>
          {record.district ? <div className="text-xs text-[#667085]">{record.district}</div> : null}
        </div>
      ),
    },
    {
      title: "License Status",
      dataIndex: "licenseStatus",
      key: "licenseStatus",
      width: 140,
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: "green",
          expired: "orange",
          suspended: "red",
        };
        return <Tag color={colors[status] || "default"}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "License",
      key: "license",
      width: 170,
      render: (_, record: School) => (
        <div>
          <div className="font-bold text-[#202020]">{record.licenseDurationMonths} months</div>
          <div className="text-xs text-[#667085]">Expires {formatDate(record.licenseExpiresAt)}</div>
        </div>
      ),
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
      width: 180,
      render: (tracks: string[]) =>
        tracks?.length ? (
          <Space size="small" wrap>
            {tracks.map((track) => (
              <Tag key={track} color={track === "all" ? "purple" : "blue"}>
                {formatTrack(track)}
              </Tag>
            ))}
          </Space>
        ) : (
          <span className="text-[#999]">-</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 320,
      render: (_, record: School) => (
        <div className="grid gap-2">
          <form onSubmit={(event) => inviteTeacher(event, record.id)} className="flex gap-1">
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
          <Button
            size="small"
            danger={record.licenseStatus !== "suspended"}
            loading={statusSchoolId === record.id}
            onClick={() => confirmStatusChange(record)}
          >
            {record.licenseStatus === "suspended" ? "Reactivate subscription" : "Suspend subscription"}
          </Button>
        </div>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} school${total !== 1 ? "s" : ""}`,
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={createSchool} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          School Name
          <input name="name" placeholder="Example: Lincoln Middle School" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          License Duration
          <input name="licenseDurationMonths" type="number" min={1} max={240} defaultValue={12} required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
          <span className="text-xs font-normal text-[#667085]">Number of months the school license remains valid.</span>
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
            onChange={(tracks) => setAssignedTracks(tracks.includes("all") ? ["all"] : tracks)}
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
          className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create School"}
        </button>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          placeholder="Search schools by name, status, or assigned track..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          size="large"
          className="mb-2"
        />
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={pagination}
          scroll={{ x: 1230 }}
          locale={{
            emptyText: "No schools found",
          }}
        />
      </div>
    </div>
  );
}
