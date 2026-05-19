"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";
import { ForumComposer } from "@/components/forum/ForumComposer";

export function ForumReplyForm({
  threadId,
  canPost,
  readOnlyReason,
}: {
  threadId: string;
  canPost: boolean;
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
      const response = await api.post(`/api/forum/threads/${threadId}/replies`, {
        content: String(formData.get("content") ?? ""),
      });
      const result = response.data;
      const success = isApiSuccess(response.status);

      setMessage(success ? "Reply posted. Refreshing..." : result?.error?.message ?? "Unable to reply.");

      if (success) {
        form.reset();
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border-2 border-[#212121] bg-[#f8f3e8] p-4 shadow-[0_4px_0_#111]">
      <p className="font-bebas text-3xl uppercase leading-none">Reply Publicly</p>
      {!canPost ? (
        <div className="rounded-md bg-[#fff4d8] px-3 py-2 text-sm font-bold text-[#8c0504]">
          {readOnlyReason}
        </div>
      ) : null}
      <ForumComposer name="content" placeholder="Reply publicly. Add bold, italic, a link, or a photo." rows={5} />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button disabled={!canPost || isSubmitting} className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? "Posting..." : "Reply"}
      </button>
    </form>
  );
}
