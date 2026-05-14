"use client";

import { FormEvent, useState } from "react";

export function StudentInviteForm() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/schools/invite-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(formData.get("email") ?? "") }),
    });
    const result = await response.json();
    setMessage(response.ok ? `Invite created: ${result.data.invite.inviteUrl}` : result?.error?.message ?? "Unable to invite student.");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3">
      <input name="email" type="email" placeholder="Student email" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <button className="w-fit rounded-md bg-[#202020] px-4 py-2 text-sm font-bold text-white">Invite Student</button>
      {message ? <p className="text-sm font-bold text-[#8c0504]">{message}</p> : null}
    </form>
  );
}
