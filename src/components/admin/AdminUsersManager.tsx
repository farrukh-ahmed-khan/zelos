"use client";

import { useState } from "react";

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

export function AdminUsersManager({ users }: { users: User[] }) {
  const [items, setItems] = useState(users);
  const [error, setError] = useState("");

  async function updateStatus(user: User, status: User["status"]) {
    setError("");
    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to update user.");
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === user.id ? { ...item, status } : item)),
    );
  }

  async function savePermissions(user: User, form: HTMLFormElement) {
    setError("");
    const formData = new FormData(form);
    const selected = permissions.filter((permission) => formData.get(permission) === "on");
    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: user.status, adminPermissions: selected }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to update permissions.");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, adminPermissions: selected } : item,
      ),
    );
  }

  async function deleteUser(user: User) {
    if (!confirm(`Permanently delete ${user.email}?`)) {
      return;
    }

    setError("");
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to delete user.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== user.id));
  }

  return (
    <div className="grid gap-4">
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      {items.map((user) => (
        <article key={user.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-[#555]">{user.email} / {user.role} / {user.ageTrack}</p>
            </div>
            <select
              value={user.status}
              onChange={(event) => updateStatus(user, event.target.value as User["status"])}
              className="rounded-md border border-[#d8d2c5] px-3 py-2 text-sm font-bold"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="deactivated">Deactivated</option>
            </select>
            <button
              onClick={() => deleteUser(user)}
              className="rounded-md border border-[#f2b8b5] bg-[#fff4f3] px-3 py-2 text-xs font-black text-[#8c0504]"
            >
              Delete
            </button>
          </div>
          {user.role === "sub-admin" ? (
            <form
              className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(event) => {
                event.preventDefault();
                savePermissions(user, event.currentTarget);
              }}
            >
              {permissions.map((permission) => (
                <label key={permission} className="flex items-center gap-2 text-xs font-bold">
                  <input name={permission} type="checkbox" defaultChecked={user.adminPermissions.includes(permission)} />
                  {permission}
                </label>
              ))}
              <button className="w-fit rounded-md border border-[#cfd4dc] px-4 py-2 text-xs font-black hover:border-[#8c0504]">
                Save Permissions
              </button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
