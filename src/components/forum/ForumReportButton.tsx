"use client";

import { useState } from "react";
import { Input, Modal } from "antd";

export function ForumReportButton({
  targetType,
  targetId,
}: {
  targetType: "thread" | "reply";
  targetId: string;
}) {
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function report() {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason: trimmedReason }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Reported." : result?.error?.message ?? "Unable to report.");
    setIsSubmitting(false);

    if (response.ok) {
      setReason("");
      setIsOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => setIsOpen(true)} className="text-xs font-bold text-[#8c0504]">
        Report
      </button>
      {message ? <span className="text-xs text-[#667085]">{message}</span> : null}
      <Modal
        title="Report for moderation"
        open={isOpen}
        okText="Submit Report"
        confirmLoading={isSubmitting}
        okButtonProps={{ disabled: !reason.trim() }}
        onOk={report}
        onCancel={() => setIsOpen(false)}
      >
        <label className="grid gap-2 text-sm font-bold text-[#344054]">
          What should moderators review?
          <Input.TextArea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={500}
            showCount
            placeholder="Describe the issue..."
          />
        </label>
      </Modal>
    </div>
  );
}
