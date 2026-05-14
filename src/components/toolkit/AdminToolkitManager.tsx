"use client";

import { FormEvent, useState } from "react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string | null;
  linkedVideoId: string | null;
  ageTrack: string;
  order: number;
  answers: string[];
  unlocked?: boolean;
};

export function AdminToolkitManager({ resources }: { resources: Resource[] }) {
  const [items, setItems] = useState(resources);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/admin/toolkit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        resourceType: String(formData.get("resourceType") ?? "worksheet"),
        url: String(formData.get("url") ?? ""),
        linkedVideoId: String(formData.get("linkedVideoId") ?? "") || undefined,
        ageTrack: String(formData.get("ageTrack") ?? ""),
        order: Number(formData.get("order") ?? 1),
        answers: String(formData.get("answers") ?? "").split("\n").map((answer) => answer.trim()).filter(Boolean),
        isActive: true,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to create toolkit resource.");
      return;
    }

    setItems((current) => [result.data.resource, ...current]);
    setMessage("Toolkit resource created.");
    form.reset();
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="title" placeholder="Resource title" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="url" type="url" placeholder="Download URL" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="description" placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <select name="resourceType" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="worksheet">Worksheet</option>
          <option value="quiz">Self-Guided Quiz</option>
          <option value="budget-template">Budget Template</option>
          <option value="goal-setting">Goal-Setting Worksheet</option>
          <option value="family-prompt">Family Discussion Prompt</option>
        </select>
        <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="">Age track</option>
          <option>Children</option>
          <option>Teens</option>
          <option>Young Adults</option>
        </select>
        <input name="linkedVideoId" placeholder="Linked completed lesson video ID" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="answers" placeholder="Quiz answers, one per line" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">Add Toolkit Resource</button>
      </form>

      <section className="grid gap-3">
        {items.map((resource) => (
          <article key={resource.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="font-bold">{resource.title}</p>
            <p className="text-sm text-[#555]">{resource.resourceType} / {resource.ageTrack} / lesson {resource.linkedVideoId ?? "always unlocked"}</p>
            <p className="mt-1 truncate text-xs text-[#667085]">{resource.url}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
