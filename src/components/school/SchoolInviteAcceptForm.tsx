"use client";

import { FormEvent, useState } from "react";

export function SchoolInviteAcceptForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/schools/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        name: String(formData.get("name") ?? ""),
        age: Number(formData.get("age") ?? 0),
        ageTrack: String(formData.get("ageTrack") ?? "") || undefined,
        password: String(formData.get("password") ?? ""),
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to accept invite.");
      return;
    }

    setMessage("Invite accepted. You can now log in.");
    window.location.assign("/login");
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      <input name="name" placeholder="Full name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="age" type="number" min={1} max={120} placeholder="Age" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="ageTrack" placeholder="Age track, optional" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="password" type="password" placeholder="Password" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">Accept Invite</button>
    </form>
  );
}
