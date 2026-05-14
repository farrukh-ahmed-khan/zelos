"use client";

import { useState } from "react";

type Report = {
  id: string;
  targetType: "thread" | "reply";
  targetId: string;
  reason: string;
  status: string;
  target: {
    title?: string | null;
    content?: string | null;
    authorId: string;
    isHidden: boolean;
  } | null;
};

export function ForumModerationManager({ reports }: { reports: Report[] }) {
  const [items, setItems] = useState(reports);
  const [error, setError] = useState("");

  async function resolve(report: Report, action: string) {
    setError("");
    const response = await fetch(`/api/admin/forum/reports/${report.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: action }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to resolve report.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== report.id));
  }

  async function removeTarget(report: Report) {
    setError("");
    const endpoint =
      report.targetType === "thread"
        ? `/api/admin/forum/threads/${report.targetId}`
        : `/api/admin/forum/replies/${report.targetId}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to remove target.");
      return;
    }

    await resolve(report, "hide-target");
  }

  return (
    <div className="grid gap-4">
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      {items.length ? items.map((report) => (
        <article key={report.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#8c0504]">{report.targetType} / {report.status}</p>
              <p className="font-bold">{report.target?.title ?? report.target?.content ?? "Reported content unavailable"}</p>
              <p className="mt-1 text-sm text-[#555]">{report.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => resolve(report, "dismiss")} className="rounded-md border border-[#cfd4dc] px-3 py-2 text-xs font-black">Dismiss</button>
              <button onClick={() => removeTarget(report)} className="rounded-md border border-[#f2b8b5] bg-[#fff4f3] px-3 py-2 text-xs font-black text-[#8c0504]">Remove</button>
              <button onClick={() => resolve(report, "ban-author")} className="rounded-md bg-[#202020] px-3 py-2 text-xs font-black text-white">Ban Author</button>
            </div>
          </div>
        </article>
      )) : <p className="rounded-md border border-[#d9dde3] bg-white p-4 text-sm text-[#555]">No reports in the moderation queue.</p>}
    </div>
  );
}
