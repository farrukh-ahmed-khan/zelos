"use client";

import { useState } from "react";

export function EventRsvpButton({ eventId, hasRsvped }: { eventId: string; hasRsvped: boolean }) {
  const [message, setMessage] = useState(hasRsvped ? "RSVP confirmed" : "");

  async function rsvp() {
    const response = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
    const result = await response.json();
    setMessage(response.ok ? "RSVP confirmed. Details were emailed." : result?.error?.message ?? "Sign up to RSVP.");
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={rsvp}
        disabled={hasRsvped}
        className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:opacity-70"
      >
        {hasRsvped ? "RSVPed" : "RSVP"}
      </button>
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
    </div>
  );
}
