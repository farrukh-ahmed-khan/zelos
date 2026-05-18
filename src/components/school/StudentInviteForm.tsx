"use client";

import { FormEvent, useState } from "react";
import { message as antMessage } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

export function StudentInviteForm() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/schools/invite-student", {
        email: String(formData.get("email") ?? ""),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to invite student.");
        return;
      }

      antMessage.success("Invite sent.");
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3">
      <input name="email" type="email" placeholder="Student email" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <button
        disabled={isSubmitting}
        className="w-fit rounded-md bg-[#202020] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Invite Student"}
      </button>
      {error ? <p className="text-sm font-bold text-[#8c0504]">{error}</p> : null}
    </form>
  );
}
