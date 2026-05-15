"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Input, Space, Table, Tag, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";

type Category = {
  _id?: string;
  id?: string;
  name: string;
  playlist?: string;
  ageTrack: string;
  audience: string;
  order: number;
  isActive: boolean;
};

type CategoryGroup = {
  key: string;
  name: string;
  ageTrack: string;
  audience: string;
  playlists: Category[];
  activeCount: number;
};

const TEACHER_TRACK = "Teachers";
const ageTrackOptions = [
  { value: "child", label: "Children" },
  { value: "teen", label: "Teens" },
  { value: "young-adult", label: "Young Adults" },
  { value: "adult", label: "Adults" },
];

function formatAgeTrack(ageTrack: string) {
  const option = ageTrackOptions.find(
    (entry) => entry.value === ageTrack || entry.label === ageTrack,
  );

  return option?.label ?? ageTrack;
}

export function AdminContentCategoriesManager({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState(categories);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAudience, setSelectedAudience] = useState("subscriber");
  const isTeacherAudience = selectedAudience === "teacher";

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((category) =>
      [
        category.name,
        category.playlist ?? "General",
        formatAgeTrack(category.ageTrack),
        category.audience,
        category.isActive ? "active" : "inactive",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchTerm]);

  const groupedItems = useMemo<CategoryGroup[]>(() => {
    const groups = new Map<string, CategoryGroup>();

    for (const category of filteredItems) {
      const key = `${category.name}::${category.ageTrack}::${category.audience}`;
      const group = groups.get(key) ?? {
        key,
        name: category.name,
        ageTrack: category.ageTrack,
        audience: category.audience,
        playlists: [],
        activeCount: 0,
      };

      group.playlists.push(category);
      group.activeCount += category.isActive ? 1 : 0;
      groups.set(key, group);
    }

    return Array.from(groups.values()).map((group) => ({
      ...group,
      playlists: group.playlists.sort((a, b) => a.order - b.order || (a.playlist ?? "").localeCompare(b.playlist ?? "")),
    }));
  }, [filteredItems]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/admin/content-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          playlist: String(formData.get("playlist") ?? ""),
          ageTrack: isTeacherAudience ? TEACHER_TRACK : String(formData.get("ageTrack") ?? ""),
          audience: selectedAudience,
          order: Number(formData.get("order") ?? 1),
          isActive: formData.get("isActive") === "on",
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error?.message ?? "Unable to create category.");
        antMessage.error(result?.error?.message ?? "Unable to create category.");
        return;
      }

      setItems((current) => [result.data.category, ...current]);
      setMessage("Category playlist saved.");
      antMessage.success("Category playlist saved successfully.");
      form.reset();
      setSelectedAudience("subscriber");
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: TableColumnsType<CategoryGroup> = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name: string, record: CategoryGroup) => (
        <div>
          <div className="font-bold text-[#202020]">{name}</div>
          <div className="text-xs text-[#667085]">
            {record.playlists.length} playlist{record.playlists.length === 1 ? "" : "s"}
          </div>
        </div>
      ),
    },
    {
      title: "Audience",
      dataIndex: "audience",
      key: "audience",
      width: 150,
      render: (audience: string) => <span className="capitalize">{audience.replace("-", " ")}</span>,
    },
    {
      title: "Age Track",
      dataIndex: "ageTrack",
      key: "ageTrack",
      width: 140,
      render: (ageTrack: string, record: CategoryGroup) => (
        <Tag color="blue">{record.audience === "teacher" ? "Not needed" : formatAgeTrack(ageTrack)}</Tag>
      ),
    },
    {
      title: "Playlists",
      dataIndex: "playlists",
      key: "playlists",
      width: 460,
      render: (playlists: Category[]) => (
        <Space size="small" wrap>
          {playlists.map((playlist) => {
            const playlistId = playlist.id ?? playlist._id;

            return (
              <Space key={playlistId ?? playlist.playlist} size={6} wrap>
                <Tag color={playlist.isActive ? "green" : "default"}>
                  {playlist.order}. {playlist.playlist ?? "General"}
                </Tag>
                {playlistId ? (
                  <Link href={`/admin/content-categories/${playlistId}/videos`}>
                    <Button size="small">Upload videos</Button>
                  </Link>
                ) : null}
              </Space>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "activeCount",
      key: "status",
      width: 140,
      render: (_: number, record: CategoryGroup) => {
        const allActive = record.activeCount === record.playlists.length;
        const noneActive = record.activeCount === 0;

        return (
          <Tag color={allActive ? "green" : noneActive ? "default" : "orange"}>
            {record.activeCount}/{record.playlists.length} ACTIVE
          </Tag>
        );
      },
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: groupedItems.length,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} categor${total === 1 ? "y" : "ies"}`,
  };

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          Category Name
          <input name="name" placeholder="Example: Budgeting Basics" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          Playlist Name
          <input name="playlist" placeholder="Example: Week 1 Lessons" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        {!isTeacherAudience ? (
          <label className="grid gap-1 text-sm font-bold text-[#344054]">
            Age Track
            <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
              <option value="">Select age track</option>
              {ageTrackOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          Library Audience
          <select
            name="audience"
            value={selectedAudience}
            onChange={(event) => setSelectedAudience(event.target.value)}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
          >
            <option value="subscriber">Subscriber</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="public-preview">Public Preview</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-[#344054]">
          Display Order
          <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[#344054]">
          <input name="isActive" type="checkbox" defaultChecked />
          Active
        </label>
        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Add Category Playlist
          </Button>
        </Space>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          placeholder="Search categories by name, playlist, age track, audience..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          size="large"
          className="mb-2"
        />
        <Table
          columns={columns}
          dataSource={groupedItems}
          rowKey="key"
          pagination={pagination}
          scroll={{ x: 900 }}
          locale={{
            emptyText: "No categories found",
          }}
        />
      </div>
    </div>
  );
}
