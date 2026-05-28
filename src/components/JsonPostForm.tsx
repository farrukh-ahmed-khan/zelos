"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type Field = {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  value?: string;
  required?: boolean;
};

export function JsonPostForm({
  endpoint,
  fields,
  submitLabel,
  submittingLabel = "Sending...",
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  submittingLabel?: string;
}) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload: Record<string, string | number> = {};
      for (const field of fields) {
        const raw = String(formData.get(field.name) ?? "");
        payload[field.name] = field.type === "number" ? Number(raw) : raw;
      }

      const captchaToken = String(formData.get("captchaToken") ?? "");
      if (captchaToken) {
        payload.captchaToken = captchaToken;
      }

      const response = await api.post(endpoint, payload);
      const result = response.data;
      setMessage(isApiSuccess(response.status) ? result?.data?.message ?? "Submitted." : result?.error?.message ?? "Unable to submit.");
      if (isApiSuccess(response.status)) form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      {fields.map((field) =>
        field.type === "hidden" ? (
          <input
            key={field.name}
            name={field.name}
            type="hidden"
            defaultValue={field.value}
          />
        ) : field.textarea ? (
          <label key={field.name} className="grid gap-2 text-sm font-bold text-[#202020]">
            {field.label}
            <textarea
              name={field.name}
              placeholder={field.label}
              defaultValue={field.value}
              required={field.required}
              rows={5}
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
            />
          </label>
        ) : (
          <label key={field.name} className="grid gap-2 text-sm font-bold text-[#202020]">
            {field.label}
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.label}
              defaultValue={field.value}
              required={field.required}
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
            />
          </label>
        ),
      )}
      <input name="captchaToken" type="hidden" />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button disabled={isSubmitting} className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
