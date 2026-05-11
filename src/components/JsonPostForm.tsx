"use client";

import { FormEvent, useState } from "react";

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
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string | number> = {};
    for (const field of fields) {
      const raw = String(formData.get(field.name) ?? "");
      payload[field.name] = field.type === "number" ? Number(raw) : raw;
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setMessage(response.ok ? result?.data?.message ?? "Submitted." : result?.error?.message ?? "Unable to submit.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      {fields.map((field) =>
        field.textarea ? (
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
