"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

export function SchoolInviteAcceptForm({
  token,
  role,
}: {
  token: string;
  role: "teacher" | "student";
}) {
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
      const response = await api.post("/api/schools/invite/accept", {
        token,
        name: String(formData.get("name") ?? ""),
        ...(role === "student"
          ? {
              age: Number(formData.get("age") ?? 0),
            }
          : {}),
        password: String(formData.get("password") ?? ""),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to accept invite.");
        setIsSubmitting(false);
        return;
      }

      setMessage("Invite accepted. Redirecting to login...");
      window.location.assign("/login");
    } catch {
      setError("Unable to accept invite. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      <input name="name" placeholder="Full name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      {role === "student" ? (
        <input name="age" type="number" min={1} max={120} placeholder="Age" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      ) : null}
      <input name="password" type="password" placeholder="Password" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <button
        disabled={isSubmitting}
        className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Accepting..." : "Accept Invite"}
      </button>
    </form>
  );
}
