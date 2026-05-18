"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Checkbox, Input, Modal, Select, Space, Table, Tag, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  ageTrack: string;
  status: "active" | "suspended" | "banned" | "deactivated";
  adminPermissions: string[];
};

const permissions = [
  "content.manage",
  "schools.manage",
  "forum.moderate",
  "events.manage",
  "users.manage-limited",
  "analytics.read",
  "billing.read",
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
  { value: "deactivated", label: "Deactivated" },
];

const statusColors: Record<User["status"], string> = {
  active: "green",
  suspended: "orange",
  banned: "red",
  deactivated: "default",
};

function formatRole(role: string) {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AdminUsersManager({ users }: { users: User[] }) {
  const [items, setItems] = useState(users);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [savingPermissionsUserId, setSavingPermissionsUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((user) =>
      [user.name, user.email, user.role, user.ageTrack, user.status, ...user.adminPermissions]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  async function updateStatus(user: User, status: User["status"]) {
    setError("");
    setUpdatingUserId(user.id);

    try {
      const response = await api.patch(`/api/admin/users/${user.id}/status`, { status });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to update user.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === user.id ? { ...item, status } : item)),
      );
      antMessage.success("User status updated.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function savePermissions(user: User, form: HTMLFormElement) {
    setError("");
    setSavingPermissionsUserId(user.id);
    const formData = new FormData(form);
    const selected = permissions.filter((permission) => formData.get(permission) === "on");

    try {
      const response = await api.patch(`/api/admin/users/${user.id}/status`, { status: user.status, adminPermissions: selected });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to update permissions.");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, adminPermissions: selected } : item,
        ),
      );
      antMessage.success("Permissions saved.");
    } finally {
      setSavingPermissionsUserId(null);
    }
  }

  async function deleteUser(user: User) {
    setError("");
    setDeletingUserId(user.id);

    try {
      const response = await api.delete(`/api/admin/users/${user.id}`);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to delete user.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== user.id));
      antMessage.success("User deleted.");
    } finally {
      setDeletingUserId(null);
    }
  }

  function confirmDeleteUser(user: User) {
    Modal.confirm({
      title: "Delete user?",
      content: `Permanently delete ${user.email}? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => deleteUser(user),
    });
  }

  const columns: TableColumnsType<User> = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      width: 320,
      render: (_, user) => (
        <div>
          <div className="font-bold text-[#202020]">{user.name}</div>
          <div className="text-xs text-[#667085]">{user.email}</div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 160,
      render: (role: string) => <Tag color={role.includes("admin") || role.includes("moderator") ? "blue" : "default"}>{formatRole(role)}</Tag>,
    },
    {
      title: "Age Track",
      dataIndex: "ageTrack",
      key: "ageTrack",
      width: 140,
      render: (ageTrack: string) => <span className="capitalize">{ageTrack}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status: User["status"], user) => (
        <Space size="small">
          <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
          <Select
            size="small"
            value={status}
            options={statusOptions}
            disabled={updatingUserId === user.id}
            loading={updatingUserId === user.id}
            style={{ width: 120 }}
            onChange={(value) => updateStatus(user, value as User["status"])}
          />
        </Space>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "adminPermissions",
      key: "adminPermissions",
      render: (adminPermissions: string[], user) =>
        user.role === "sub-admin" ? (
          <Space size={[4, 4]} wrap>
            {adminPermissions.length ? (
              adminPermissions.map((permission) => (
                <Tag key={permission}>{permission}</Tag>
              ))
            ) : (
              <span className="text-xs text-[#667085]">No permissions</span>
            )}
          </Space>
        ) : (
          <span className="text-xs text-[#667085]">Not applicable</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "right",
      render: (_, user) => (
        <Button
          danger
          size="small"
          loading={deletingUserId === user.id}
          onClick={() => confirmDeleteUser(user)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} user${total === 1 ? "" : "s"}`,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
  };

  return (
    <div className="grid gap-4">
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <div className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search users by name, email, role, status, or permission"
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          className="max-w-xl"
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredItems}
        pagination={pagination}
        scroll={{ x: 980 }}
        bordered
        expandable={{
          rowExpandable: (user) => user.role === "sub-admin",
          expandedRowRender: (user) => (
            <form
              className="grid gap-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                savePermissions(user, event.currentTarget);
              }}
            >
              <p className="text-sm font-bold text-[#344054]">Sub-admin permissions</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission}
                    name={permission}
                    defaultChecked={user.adminPermissions.includes(permission)}
                  >
                    <span className="text-xs font-bold">{permission}</span>
                  </Checkbox>
                ))}
              </div>
              <Button
                htmlType="submit"
                size="small"
                loading={savingPermissionsUserId === user.id}
                className="w-fit"
              >
                Save Permissions
              </Button>
            </form>
          ),
        }}
      />
    </div>
  );
}
