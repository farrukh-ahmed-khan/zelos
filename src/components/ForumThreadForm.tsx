"use client";

import { FormEvent, useState } from "react";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";

export function ForumThreadForm() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        category: String(formData.get("category") ?? ""),
        content: String(formData.get("content") ?? ""),
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Thread posted." : result?.error?.message ?? "Unable to post.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      <input name="title" placeholder="Thread title" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <select name="category" className="rounded-md border border-[#d8d2c5] px-3 py-3">
        {FORUM_CATEGORIES.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <textarea name="content" placeholder="Start the conversation" rows={5} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
        Post Thread
      </button>
    </form>
  );
}
