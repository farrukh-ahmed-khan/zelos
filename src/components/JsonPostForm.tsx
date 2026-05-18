"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type Field = {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  value?: string;
};

export function JsonPostForm({
  endpoint,
  fields,
  submitLabel,
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
}) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string | number> = {};
    for (const field of fields) {
      const raw = String(formData.get(field.name) ?? "");
      payload[field.name] = field.type === "number" ? Number(raw) : raw;
    }
    const response = await api.post(endpoint, payload);
    const result = response.data;
    setMessage(isApiSuccess(response.status) ? result?.data?.message ?? "Submitted." : result?.error?.message ?? "Unable to submit.");
    if (isApiSuccess(response.status)) form.reset();
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
          <textarea key={field.name} name={field.name} placeholder={field.label} defaultValue={field.value} rows={5} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        ) : (
          <input key={field.name} name={field.name} type={field.type ?? "text"} placeholder={field.label} defaultValue={field.value} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        ),
      )}
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
        {submitLabel}
      </button>
    </form>
  );
}
