"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";
import { ForumComposer } from "@/components/forum/ForumComposer";

export function ForumThreadForm({
  canPost,
  categories,
  readOnlyReason,
}: {
  canPost: boolean;
  categories: string[];
  readOnlyReason: string;
}) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPost || isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await api.post("/api/forum/threads", {
        title: String(formData.get("title") ?? ""),
        category: String(formData.get("category") ?? ""),
        content: String(formData.get("content") ?? ""),
      });
      const result = response.data;
      const success = isApiSuccess(response.status);

      setMessage(success ? "Thread posted. Refreshing..." : result?.error?.message ?? "Unable to post.");

      if (success) {
        form.reset();
        window.location.href = `/forum/${result.data.thread.id}`;
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border-2 border-[#212121] bg-[#f8f3e8] p-4 shadow-[0_4px_0_#111]">
      <p className="font-bebas text-3xl uppercase leading-none">Start a Thread</p>
      {!canPost ? (
        <div className="rounded-md bg-[#fff4d8] px-3 py-2 text-sm font-bold text-[#8c0504]">
          {readOnlyReason}
        </div>
      ) : null}
      <input name="title" placeholder="Thread title" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <select name="category" className="rounded-md border border-[#d8d2c5] px-3 py-3">
        {categories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <ForumComposer name="content" placeholder="Start the conversation. Add a link, photo, bold text, or italic note." rows={7} />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button disabled={!canPost || isSubmitting} className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? "Posting..." : "Post Thread"}
      </button>
    </form>
  );
}
