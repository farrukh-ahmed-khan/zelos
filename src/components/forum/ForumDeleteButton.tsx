"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, isApiSuccess } from "@/lib/api/client";

export function ForumDeleteButton({
  targetId,
  targetType,
}: {
  targetId: string;
  targetType: "thread" | "reply";
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const label = targetType === "thread" ? "post" : "comment";

  async function removeTarget() {
    if (isDeleting) return;

    const confirmed = window.confirm(`Delete this ${label} from the forum?`);

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      const endpoint =
        targetType === "thread"
          ? `/api/admin/forum/threads/${targetId}`
          : `/api/admin/forum/replies/${targetId}`;
      const response = await api.delete(endpoint);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? `Unable to delete this ${label}.`);
        return;
      }

      if (targetType === "thread") {
        router.push("/forum");
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={removeTarget}
        disabled={isDeleting}
        className="rounded-md border border-[#f2b8b5] bg-[#fff4f3] px-3 py-2 text-xs font-black uppercase text-[#8c0504] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : `Delete ${label}`}
      </button>
      {error ? <p className="text-xs font-bold text-[#8c0504]">{error}</p> : null}
    </div>
  );
}
