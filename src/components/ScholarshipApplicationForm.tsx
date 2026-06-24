"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

export function ScholarshipApplicationForm({
  endpoint,
  requiresDocument,
}: {
  endpoint: string;
  requiresDocument: boolean;
}) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputClass = "rounded-md border border-[#d8d2c5] px-3 py-3 font-normal";
  const labelClass = "grid gap-2 text-sm font-bold text-[#202020]";
  const requiredMark = <span className="text-[#b22222]">*</span>;

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await api.post(endpoint, formData);
      const result = response.data;
      setMessage(isApiSuccess(response.status) ? result?.data?.message ?? "Application submitted." : result?.error?.message ?? "Unable to submit.");
      if (isApiSuccess(response.status)) {
        event.currentTarget.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitApplication} className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      <h2 className="font-bebas text-3xl uppercase">Apply</h2>
      <label className={labelClass}>
        <span>Full name {requiredMark}</span>
        <input name="name" required placeholder="Full name" className={inputClass} />
      </label>
      <label className={labelClass}>
        <span>Email {requiredMark}</span>
        <input name="email" required type="email" placeholder="Email" className={inputClass} />
      </label>
      <label className={labelClass}>
        <span>School {requiredMark}</span>
        <input name="school" required placeholder="School" className={inputClass} />
      </label>
      <label className={labelClass}>
        <span>Field of study {requiredMark}</span>
        <input name="fieldOfStudy" required placeholder="Field of study" className={inputClass} />
      </label>
      <label className={labelClass}>
        <span>GPA</span>
        <input name="gpa" type="number" min="0" max="4.5" step="0.01" placeholder="GPA" className={inputClass} />
      </label>
      <label className={labelClass}>
        <span>Personal statement {requiredMark}</span>
        <textarea name="personalStatement" required rows={6} placeholder="Personal statement" className={inputClass} />
      </label>
      {requiresDocument ? (
        <label className={labelClass}>
          <span>Required document {requiredMark}</span>
          <input name="document" required type="file" className={`${inputClass} bg-white`} />
        </label>
      ) : (
        <label className={labelClass}>
          <span>Optional document</span>
          <input name="document" type="file" className={`${inputClass} bg-white`} />
        </label>
      )}
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button disabled={isSubmitting} className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
