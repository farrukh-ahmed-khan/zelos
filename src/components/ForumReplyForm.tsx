"use client";

import { FormEvent, useState } from "react";

export function ForumReplyForm({ threadId }: { threadId: string }) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch(`/api/forum/threads/${threadId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: String(formData.get("content") ?? "") }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Reply posted." : result?.error?.message ?? "Unable to reply.");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md bg-white p-4">
      <textarea name="content" rows={4} placeholder="Reply publicly" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
        Reply
      </button>
    </form>
  );
}
