"use client";

import { useEffect, useState } from "react";
import { message as antMessage } from "antd";
import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { api, isApiSuccess } from "@/lib/api/client";

type Broadcast = {
  id: string;
  title: string;
  content: string;
  sentBy: string;
  createdAt: string;
};

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/broadcasts");
      if (isApiSuccess(res.status)) {
        setBroadcasts(res.data.data.broadcasts);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    try {
      const res = await api.post("/api/admin/broadcasts", { title: title.trim(), content: content.trim() });
      if (isApiSuccess(res.status)) {
        antMessage.success("News update sent to all user dashboards.");
        setTitle("");
        setContent("");
        void load();
      } else {
        antMessage.error(res.data?.error?.message ?? "Send failed.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminChrome title="News & Updates" eyebrow="Admin / Broadcasts">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <AdminPanel title="Post News Update">
          <form onSubmit={handleSend} className="grid gap-4">
            <p className="text-sm text-[#667085]">
              Posts are pushed to the News &amp; Updates section on every logged-in user&apos;s dashboard.
            </p>
            <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={180}
                required
                placeholder="e.g. New scholarship available"
                className="rounded-md border border-[#d9dde3] px-3 py-2.5 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
              />
            </label>
            <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              Content
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={5000}
                required
                rows={6}
                placeholder="Write the update here…"
                className="rounded-md border border-[#d9dde3] px-3 py-2.5 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
              />
              <span className="text-right text-[11px] text-[#667085]">{content.length}/5000</span>
            </label>
            <button
              type="submit"
              disabled={sending || !title.trim() || !content.trim()}
              className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-2.5 text-sm font-black text-[#212121] shadow-[0_3px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send to All Users"}
            </button>
          </form>
        </AdminPanel>

        <AdminPanel title={`Sent Updates (${broadcasts.length})`}>
          {loading ? (
            <p className="text-sm text-[#667085]">Loading…</p>
          ) : !broadcasts.length ? (
            <p className="text-sm text-[#667085]">No updates have been sent yet.</p>
          ) : (
            <div className="grid gap-3">
              {broadcasts.map((b) => (
                <article key={b.id} className="rounded-md border border-[#edf0f3] bg-[#f8fafc] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-bold text-[#111827]">{b.title}</p>
                    <p className="text-xs text-[#667085]">
                      {new Date(b.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#344054]">{b.content}</p>
                </article>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminChrome>
  );
}
