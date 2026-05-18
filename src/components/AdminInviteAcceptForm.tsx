"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

export function AdminInviteAcceptForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await api.post("/api/admin/invites/accept", {
        token,
        name: String(formData.get("name") ?? ""),
        password: String(formData.get("password") ?? ""),
        age: Number(formData.get("age") ?? 0),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to accept invite.");
        setIsSubmitting(false);
        return;
      }

      setMessage("Invite accepted. Redirecting...");
      window.location.assign("/dashboard");
    } catch {
      setError("Unable to accept invite. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      <input name="name" placeholder="Full name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="age" type="number" min={1} max={120} placeholder="Age" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="password" type="password" placeholder="Password" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <button
        disabled={isSubmitting}
        className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black shadow-[0_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Accepting..." : "Accept Invite"}
      </button>
    </form>
  );
}
