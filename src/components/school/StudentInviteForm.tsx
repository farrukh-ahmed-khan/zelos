"use client";

import { FormEvent, useState } from "react";
import { message as antMessage } from "antd";
import { useRouter } from "next/navigation";
import { api, isApiSuccess } from "@/lib/api/client";

type InviteUsage = {
  studentLimit: number;
  studentsCount: number;
  pendingInvites: number;
  remainingInvites: number;
};

export function StudentInviteForm({ inviteUsage }: { inviteUsage: InviteUsage }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInvitesLeft = inviteUsage.remainingInvites > 0;

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
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3">
      <p className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-[#475467]">
        {inviteUsage.remainingInvites} invites left. {inviteUsage.studentsCount} active students and{" "}
        {inviteUsage.pendingInvites} pending invites out of {inviteUsage.studentLimit} student seats.
      </p>
      <input name="email" type="email" placeholder="Student email" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <button
        disabled={isSubmitting || !hasInvitesLeft}
        className="w-fit rounded-md bg-[#202020] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : hasInvitesLeft ? "Invite Student" : "No Invites Left"}
      </button>
      {error ? <p className="text-sm font-bold text-[#8c0504]">{error}</p> : null}
    </form>
  );
}
