"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, Tag, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";

type InviteRole = "forum-moderator" | "sub-admin";

type Invite = {
  id: string;
  email: string;
  role: InviteRole;
  adminPermissions: string[];
  expiresAt: string;
  usedAt: string | null;
  createdAt?: string;
  inviteUrl?: string;
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

const roleOptions = [
  { value: "forum-moderator", label: "Forum Moderator" },
  { value: "sub-admin", label: "Sub-Admin" },
];

function formatRole(role: string) {
  return role === "sub-admin" ? "Sub-Admin" : "Forum Moderator";
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInviteStatus(invite: Invite) {
  if (invite.usedAt) {
    return { label: "Used", color: "blue" };
  }

  if (new Date(invite.expiresAt).getTime() <= Date.now()) {
    return { label: "Deactivated", color: "default" };
  }

  return { label: "Open", color: "green" };
}

export function AdminInvitesManager({ invites }: { invites: Invite[] }) {
  const [items, setItems] = useState(invites);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editInvite, setEditInvite] = useState<Invite | null>(null);
  const [editRole, setEditRole] = useState<InviteRole>("forum-moderator");
  const [isEditing, setIsEditing] = useState(false);
  const [deactivatingInviteId, setDeactivatingInviteId] = useState<string | null>(null);
  const [removingInviteId, setRemovingInviteId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((invite) =>
      [
        invite.email,
        formatRole(invite.role),
        getInviteStatus(invite).label,
        formatDate(invite.expiresAt),
        formatDate(invite.createdAt),
        ...invite.adminPermissions,
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

  function openEditModal(invite: Invite) {
    setEditInvite(invite);
    setEditRole(invite.role);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const role = String(formData.get("role") ?? "forum-moderator") as InviteRole;
    const selected = role === "sub-admin"
      ? permissions.filter((permission) => formData.get(permission) === "on")
      : [];

    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          role,
          adminPermissions: selected,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error?.message ?? "Unable to create invite.");
        return;
      }

      setItems((current) => [result.data.invite, ...current]);
      antMessage.success("Invite created.");
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editInvite) return;

    setError("");
    setIsEditing(true);
    const formData = new FormData(event.currentTarget);
    const role = String(formData.get("role") ?? "forum-moderator") as InviteRole;
    const selected = role === "sub-admin"
      ? permissions.filter((permission) => formData.get(permission) === "on")
      : [];

    try {
      const response = await fetch(`/api/admin/invites/${editInvite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          role,
          adminPermissions: selected,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error?.message ?? "Unable to update invite.");
        return;
      }

      setItems((current) =>
        current.map((invite) => invite.id === editInvite.id ? result.data.invite : invite),
      );
      antMessage.success("Invite updated.");
      setEditInvite(null);
    } finally {
      setIsEditing(false);
    }
  }

  async function deactivateInvite(invite: Invite) {
    if (!confirm(`Deactivate invite for ${invite.email}?`)) {
      return;
    }

    setError("");
    setDeactivatingInviteId(invite.id);

    try {
      const response = await fetch(`/api/admin/invites/${invite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deactivate: true }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error?.message ?? "Unable to deactivate invite.");
        return;
      }

      setItems((current) =>
        current.map((item) => item.id === invite.id ? result.data.invite : item),
      );
      antMessage.success("Invite deactivated.");
    } finally {
      setDeactivatingInviteId(null);
    }
  }

  async function removeInvite(invite: Invite) {
    if (!confirm(`Remove invite for ${invite.email}?`)) {
      return;
    }

    setError("");
    setRemovingInviteId(invite.id);

    try {
      const response = await fetch(`/api/admin/invites/${invite.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error?.message ?? "Unable to remove invite.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== invite.id));
      antMessage.success("Invite removed.");
    } finally {
      setRemovingInviteId(null);
    }
  }

  const columns: TableColumnsType<Invite> = [
    {
      title: "Invitee",
      dataIndex: "email",
      key: "email",
      width: 280,
      render: (email: string) => <span className="font-bold text-[#202020]">{email}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 170,
      render: (role: InviteRole) => <Tag color={role === "sub-admin" ? "blue" : "purple"}>{formatRole(role)}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, invite) => {
        const status = getInviteStatus(invite);
        return <Tag color={status.color}>{status.label.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Dates",
      key: "dates",
      width: 260,
      render: (_, invite) => (
        <div className="text-xs text-[#667085]">
          <div><strong className="text-[#202020]">Created:</strong> {formatDate(invite.createdAt)}</div>
          <div><strong className="text-[#202020]">Expires:</strong> {formatDate(invite.expiresAt)}</div>
          {invite.usedAt ? <div><strong className="text-[#202020]">Used:</strong> {formatDate(invite.usedAt)}</div> : null}
        </div>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "adminPermissions",
      key: "adminPermissions",
      render: (adminPermissions: string[], invite) =>
        invite.role === "sub-admin" ? (
          <Space size={[4, 4]} wrap>
            {adminPermissions.length ? adminPermissions.map((permission) => (
              <Tag key={permission}>{permission}</Tag>
            )) : <span className="text-xs text-[#667085]">No permissions</span>}
          </Space>
        ) : (
          <span className="text-xs text-[#667085]">Not applicable</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      align: "right",
      render: (_, invite) => {
        const isUsed = Boolean(invite.usedAt);
        const isInactive = new Date(invite.expiresAt).getTime() <= Date.now();

        return (
          <Space size="small" wrap>
            <Button size="small" disabled={isUsed} onClick={() => openEditModal(invite)}>
              Edit
            </Button>
            <Button
              size="small"
              disabled={isUsed || isInactive}
              loading={deactivatingInviteId === invite.id}
              onClick={() => deactivateInvite(invite)}
            >
              Deactivate
            </Button>
            <Button
              danger
              size="small"
              loading={removingInviteId === invite.id}
              onClick={() => removeInvite(invite)}
            >
              Remove
            </Button>
          </Space>
        );
      },
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} invite${total === 1 ? "" : "s"}`,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
  };

  return (
    <div className="grid gap-6">
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <input name="email" type="email" placeholder="Invite email" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <select name="role" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="forum-moderator">Forum Moderator</option>
          <option value="sub-admin">Sub-Admin</option>
        </select>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {permissions.map((permission) => (
            <label key={permission} className="flex items-center gap-2 text-xs font-bold">
              <input name={permission} type="checkbox" />
              {permission}
            </label>
          ))}
        </div>
        <button
          disabled={isSubmitting}
          className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating..." : "Create Invite"}
        </button>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search invites by email, role, status, or permission"
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          className="max-w-xl"
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          pagination={pagination}
          scroll={{ x: 1100 }}
          bordered
        />
      </div>

      <Modal
        title="Edit Invite"
        open={Boolean(editInvite)}
        onCancel={() => setEditInvite(null)}
        footer={null}
        destroyOnHidden
      >
        {editInvite ? (
          <form key={editInvite.id} onSubmit={saveInvite} className="grid gap-4 pt-2">
            <input
              name="email"
              type="email"
              defaultValue={editInvite.email}
              required
              className="rounded-md border border-[#d8d2c5] px-3 py-3"
            />
            <Select
              value={editRole}
              options={roleOptions}
              onChange={(value) => setEditRole(value as InviteRole)}
            />
            <input type="hidden" name="role" value={editRole} />
            {editRole === "sub-admin" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {permissions.map((permission) => (
                  <label key={permission} className="flex items-center gap-2 text-xs font-bold">
                    <input
                      name={permission}
                      type="checkbox"
                      defaultChecked={editInvite.adminPermissions.includes(permission)}
                    />
                    {permission}
                  </label>
                ))}
              </div>
            ) : null}
            <Space>
              <Button type="primary" htmlType="submit" loading={isEditing}>
                Save Changes
              </Button>
              <Button onClick={() => setEditInvite(null)}>Cancel</Button>
            </Space>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
