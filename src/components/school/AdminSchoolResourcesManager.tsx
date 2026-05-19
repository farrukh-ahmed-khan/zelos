"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
  fileName: string | null;
  mimeType: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/admin/school-resources", formData);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create resource.");
        return;
      }

      setItems((current) => [result.data.resource, ...current]);
      setMessage("School resource created.");
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Resource title
          <input name="title" placeholder="Resource title" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Resource file
          <input
            name="resource"
            type="file"
            required
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Description
          <textarea name="description" placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Resource type
          <select name="resourceType" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
          <option value="lesson-plan">Lesson Plan PDF</option>
          <option value="teacher-guide">Teacher Guide PDF</option>
          <option value="student-worksheet">Student Worksheet</option>
          <option value="image">Image</option>
          <option value="document">Document</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="presentation">Presentation</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Audience
          <select name="audience" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Age track
          <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
          <option value="">Age track</option>
          <option>Children</option>
          <option>Teens</option>
          <option>Young Adults</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          School scope
          <select name="schoolScope" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
          <option value="all-schools">All Schools</option>
          <option value="specific-schools">Specific Schools</option>
          <option value="district">District</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          School IDs
          <input name="schoolIds" placeholder="School IDs, comma separated" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          District tag
          <input name="district" placeholder="District tag" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Release date
          <input name="releaseDate" type="datetime-local" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Order
          <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <button disabled={isSubmitting} className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Uploading..." : "Add Resource"}
        </button>
      </form>

      <section className="grid gap-3">
        {items.map((resource) => (
          <article key={resource.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <p className="font-bold">{resource.title}</p>
            <p className="text-sm text-[#555]">{resource.resourceType} / {resource.audience} / {resource.ageTrack} / {resource.schoolScope}</p>
            <a href={resource.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs font-bold !text-[#8c0504]">
              {resource.fileName ?? resource.url}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
