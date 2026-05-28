"use client";

import { useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

export function EventRsvpButton({ eventId, hasRsvped }: { eventId: string; hasRsvped: boolean }) {
  const [message, setMessage] = useState(hasRsvped ? "RSVP confirmed" : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function rsvp() {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/api/events/${eventId}/rsvp`);
      const result = response.data;
      setMessage(isApiSuccess(response.status) ? "RSVP confirmed. Details were emailed." : result?.error?.message ?? "Sign up to RSVP.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={rsvp}
        disabled={hasRsvped || isSubmitting}
        className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving RSVP..." : hasRsvped ? "RSVPed" : "RSVP"}
      </button>
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
    </div>
  );
}
