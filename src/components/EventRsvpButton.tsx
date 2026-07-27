"use client";

import { useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

export function EventRsvpButton({
  eventId,
  hasRsvped,
  canRsvp = true,
}: {
  eventId: string;
  hasRsvped: boolean;
  canRsvp?: boolean;
}) {
  const [message, setMessage] = useState(hasRsvped ? "RSVP confirmed" : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canRsvp) {
    return (
      <p className="text-xs font-semibold leading-relaxed text-[#667085]">
        View-only access — moderators do not RSVP to events.
      </p>
    );
  }

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
        className="w-full rounded-[4px] border border-[#212121] bg-[#faff8d] px-4 py-2.5 text-xs font-black uppercase tracking-[0.04em] !text-[#212121] shadow-[0_2px_0_#111] transition hover:-translate-y-px hover:bg-[#f5ff62] hover:shadow-[0_3px_0_#111] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "Saving RSVP..." : hasRsvped ? "RSVPed" : "RSVP"}
      </button>
      {message ? <p className="text-xs font-semibold leading-relaxed text-[#b22222]">{message}</p> : null}
    </div>
  );
}
