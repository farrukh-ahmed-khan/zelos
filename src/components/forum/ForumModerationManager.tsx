"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

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

type Category = {
  _id?: string;
  id?: string;
  name: string;
  description?: string | null;
  order: number;
  isActive: boolean;
};

export function ForumModerationManager({
  categories,
  reports,
}: {
  categories: Category[];
  reports: Report[];
}) {
  const [items, setItems] = useState(reports);
  const [categoryItems, setCategoryItems] = useState(categories);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reportActionId, setReportActionId] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryActionId, setCategoryActionId] = useState<string | null>(null);

  async function resolve(report: Report, action: string) {
    setError("");
    setMessage("");
    setReportActionId(report.id);
    try {
      const response = await api.post(`/api/admin/forum/reports/${report.id}/resolve`, {
        action,
        note: action,
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to resolve report.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== report.id));
    } finally {
      setReportActionId(null);
    }
  }

  async function removeTarget(report: Report) {
    setError("");
    setMessage("");
    setReportActionId(report.id);
    const endpoint =
      report.targetType === "thread"
        ? `/api/admin/forum/threads/${report.targetId}`
        : `/api/admin/forum/replies/${report.targetId}`;
    try {
      const response = await api.delete(endpoint);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to remove target.");
        return;
      }

      await resolve(report, "hide-target");
    } finally {
      setReportActionId(null);
    }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsCreatingCategory(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await api.post("/api/admin/forum/categories", {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        order: Number(formData.get("order") ?? categoryItems.length + 1),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create category.");
        return;
      }

      setCategoryItems((current) =>
        [...current, result.data.category].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
      );
      setMessage("Forum category created.");
      form.reset();
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function toggleCategory(category: Category) {
    setError("");
    setMessage("");
    const categoryId = category.id ?? category._id;
    setCategoryActionId(categoryId ?? null);
    try {
      const response = await api.patch(`/api/admin/forum/categories/${categoryId}`, {
        isActive: !category.isActive,
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to update category.");
        return;
      }

      setCategoryItems((current) =>
        current.map((item) =>
          (item.id ?? item._id) === categoryId ? result.data.category : item,
        ),
      );
      setMessage("Forum category updated.");
    } finally {
      setCategoryActionId(null);
    }
  }

  return (
    <div className="grid gap-4">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      <section className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase text-[#8c0504]">Forum Categories</p>
          <h2 className="font-bebas text-3xl uppercase leading-none">Topics</h2>
        </div>
        <form onSubmit={createCategory} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
          <input name="name" placeholder="Category name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
          <input name="description" placeholder="Optional description" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
          <input name="order" type="number" min={1} defaultValue={categoryItems.length + 1} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
          <button disabled={isCreatingCategory} className="rounded-md border border-[#212121] bg-[#faff8d] px-4 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60">
            {isCreatingCategory ? "Adding..." : "Add"}
          </button>
        </form>
        <div className="grid gap-2">
          {categoryItems.map((category) => (
            <div key={category.id ?? category._id ?? category.name} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e4ded1] bg-[#fbf7ef] p-3">
              <div>
                <p className="font-bold">{category.order}. {category.name}</p>
                {category.description ? <p className="text-sm text-[#667085]">{category.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                disabled={categoryActionId === (category.id ?? category._id)}
                className={`rounded-md border px-3 py-2 text-xs font-black ${
                  category.isActive
                    ? "border-[#f2b8b5] bg-[#fff4f3] text-[#8c0504]"
                    : "border-[#cfd4dc] bg-white text-[#202020]"
                }`}
              >
                {categoryActionId === (category.id ?? category._id)
                  ? "Updating..."
                  : category.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </section>
      {items.length ? items.map((report) => (
        <article key={report.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#8c0504]">{report.targetType} / {report.status}</p>
              <p className="font-bold">{report.target?.title ?? report.target?.content ?? "Reported content unavailable"}</p>
              <p className="mt-1 text-sm text-[#555]">{report.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={reportActionId === report.id} onClick={() => resolve(report, "dismiss")} className="rounded-md border border-[#cfd4dc] px-3 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-60">
                {reportActionId === report.id ? "Working..." : "Dismiss"}
              </button>
              <button disabled={reportActionId === report.id} onClick={() => removeTarget(report)} className="rounded-md border border-[#f2b8b5] bg-[#fff4f3] px-3 py-2 text-xs font-black text-[#8c0504] disabled:cursor-not-allowed disabled:opacity-60">
                {reportActionId === report.id ? "Working..." : "Remove"}
              </button>
              <button disabled={reportActionId === report.id} onClick={() => resolve(report, "ban-author")} className="rounded-md bg-[#202020] px-3 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60">
                {reportActionId === report.id ? "Working..." : "Ban Author"}
              </button>
            </div>
          </div>
        </article>
      )) : <p className="rounded-md border border-[#d9dde3] bg-white p-4 text-sm text-[#555]">No reports in the moderation queue.</p>}
    </div>
  );
}
