"use client";

import { useState } from "react";

export function ForumReportButton({
  targetType,
  targetId,
}: {
  targetType: "thread" | "reply";
  targetId: string;
}) {
  const [message, setMessage] = useState("");

  async function report() {
    const reason = window.prompt("What should moderators review?");

    if (!reason) {
      return;
    }

    const response = await fetch("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Reported." : result?.error?.message ?? "Unable to report.");
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={report} className="text-xs font-bold text-[#8c0504]">
        Report
      </button>
      {message ? <span className="text-xs text-[#667085]">{message}</span> : null}
    </div>
  );
}
