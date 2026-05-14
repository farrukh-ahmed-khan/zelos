"use client";

import { FormEvent, useState } from "react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  audience: string;
  ageTrack: string;
  schoolScope: string;
  schoolIds: string[];
  district: string | null;
  releaseDate: string | null;
  order: number;
};

export function AdminSchoolResourcesManager({ resources }: { resources: Resource[] }) {
  const [items, setItems] = useState(resources);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/admin/school-resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        resourceType: String(formData.get("resourceType") ?? "lesson-plan"),
        url: String(formData.get("url") ?? ""),
        audience: String(formData.get("audience") ?? "teacher"),
        ageTrack: String(formData.get("ageTrack") ?? ""),
        schoolScope: String(formData.get("schoolScope") ?? "all-schools"),
        schoolIds: String(formData.get("schoolIds") ?? "").split(",").map((id) => id.trim()).filter(Boolean),
        district: String(formData.get("district") ?? ""),
        releaseDate: String(formData.get("releaseDate") ?? "") || undefined,
        order: Number(formData.get("order") ?? 1),
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to create resource.");
      return;
    }

    setItems((current) => [result.data.resource, ...current]);
    setMessage("School resource created.");
    form.reset();
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="title" placeholder="Resource title" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="url" type="url" placeholder="File or video URL" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="description" placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <select name="resourceType" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="teacher-training-video">Teacher Training Video</option>
          <option value="lesson-plan">Lesson Plan PDF</option>
          <option value="teacher-guide">Teacher Guide PDF</option>
          <option value="student-worksheet">Student Worksheet</option>
        </select>
        <select name="audience" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
        <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="">Age track</option>
          <option>Children</option>
          <option>Teens</option>
          <option>Young Adults</option>
        </select>
        <select name="schoolScope" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="all-schools">All Schools</option>
          <option value="specific-schools">Specific Schools</option>
          <option value="district">District</option>
        </select>
        <input name="schoolIds" placeholder="School IDs, comma separated" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="district" placeholder="District tag" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="releaseDate" type="datetime-local" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">Add Resource</button>
      </form>

      <section className="grid gap-3">
        {items.map((resource) => (
          <article key={resource.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="font-bold">{resource.title}</p>
            <p className="text-sm text-[#555]">{resource.resourceType} / {resource.audience} / {resource.ageTrack} / {resource.schoolScope}</p>
            <p className="mt-1 truncate text-xs text-[#667085]">{resource.url}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
