"use client";

import { FormEvent, useState } from "react";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";
import { api, isApiSuccess } from "@/lib/api/client";

export function ForumThreadForm() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await api.post("/api/forum/threads", {
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? ""),
      content: String(formData.get("content") ?? ""),
    });
    const result = response.data;
    setMessage(isApiSuccess(response.status) ? "Thread posted." : result?.error?.message ?? "Unable to post.");
    if (isApiSuccess(response.status)) form.reset();
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
