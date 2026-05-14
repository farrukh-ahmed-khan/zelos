"use client";

import { FormEvent, useState } from "react";

type Invite = {
  id: string;
  email: string;
  role: string;
  adminPermissions: string[];
  expiresAt: string;
  usedAt: string | null;
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

export function AdminInvitesManager({ invites }: { invites: Invite[] }) {
  const [items, setItems] = useState(invites);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const selected = permissions.filter((permission) => formData.get(permission) === "on");
    const response = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? "forum-moderator"),
        adminPermissions: selected,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to create invite.");
      return;
    }

    setItems((current) => [result.data.invite, ...current]);
    setMessage(`Invite created: ${result.data.invite.inviteUrl}`);
    form.reset();
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
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
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">
          Create Invite
        </button>
      </form>

      <section className="grid gap-3">
        {items.map((invite) => (
          <article key={invite.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="font-bold">{invite.email}</p>
            <p className="text-sm text-[#555]">{invite.role} / expires {new Date(invite.expiresAt).toLocaleString()}</p>
            <p className="text-xs font-black">{invite.usedAt ? "Used" : "Open"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
