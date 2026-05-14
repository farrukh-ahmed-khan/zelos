"use client";

import { FormEvent, useState } from "react";

type Category = {
  _id?: string;
  id?: string;
  name: string;
  ageTrack: string;
  audience: string;
  order: number;
  isActive: boolean;
};

export function AdminContentCategoriesManager({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState(categories);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/admin/content-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        ageTrack: String(formData.get("ageTrack") ?? ""),
        audience: String(formData.get("audience") ?? "subscriber"),
        order: Number(formData.get("order") ?? 1),
        isActive: formData.get("isActive") === "on",
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to create category.");
      return;
    }

    setItems((current) => [result.data.category, ...current]);
    setMessage("Category created.");
    form.reset();
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="name" placeholder="Category name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="">Age track</option>
          <option>Children</option>
          <option>Teens</option>
          <option>Young Adults</option>
        </select>
        <select name="audience" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="subscriber">Subscriber</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="public-preview">Public Preview</option>
        </select>
        <input name="order" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isActive" type="checkbox" defaultChecked />
          Active
        </label>
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">
          Add Category
        </button>
      </form>

      <section className="grid gap-3">
        {items.map((category) => (
          <article key={category.id ?? category._id} className="grid gap-2 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-bold">{category.name}</p>
              <p className="text-sm text-[#555]">{category.audience} / {category.ageTrack} / order {category.order}</p>
            </div>
            <p className="text-sm font-black">{category.isActive ? "Active" : "Inactive"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
