"use client";

import { FormEvent, useState } from "react";

type Video = {
  id: string;
  title: string;
  description: string;
  ageTrack: string;
  audience: string;
  category: string;
  order: number;
  releaseDate: string | null;
  dripEnabled: boolean;
  isFreePreview: boolean;
  isMissionVideo: boolean;
};

export function AdminVideosManager({ videos }: { videos: Video[] }) {
  const [items, setItems] = useState(videos);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/admin/videos", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to upload video.");
      return;
    }

    setItems((current) => [result.data.video, ...current]);
    setMessage("Video uploaded.");
    form.reset();
  }

  async function removeVideo(videoId: string) {
    if (!confirm("Delete this video?")) {
      return;
    }

    const response = await fetch(`/api/admin/videos/${videoId}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to delete video.");
      return;
    }

    setItems((current) => current.filter((video) => video.id !== videoId));
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="title" placeholder="Title" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="category" placeholder="Category" defaultValue="General" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="description" placeholder="Description" required className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <select name="ageTrack" required className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="">Age track</option>
          <option>Children</option>
          <option>Teens</option>
          <option>Young Adults</option>
        </select>
        <select name="audience" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="subscriber">Subscriber Library</option>
          <option value="teacher">Teacher Library</option>
          <option value="student">Student Library</option>
          <option value="public-preview">Free Preview</option>
        </select>
        <input name="order" type="number" min={1} placeholder="Sequence order" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="releaseDate" type="datetime-local" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="video" type="file" accept="video/*" required className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3 md:col-span-2" />
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="dripEnabled" type="checkbox" value="true" defaultChecked />
          Sequential drip lock
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isFreePreview" type="checkbox" value="true" />
          Free preview
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isMissionVideo" type="checkbox" value="true" />
          Homepage mission video
        </label>
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">
          Upload Video
        </button>
      </form>

      <section className="grid gap-3">
        {items.map((video) => (
          <article key={video.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{video.order}. {video.title}</p>
                <p className="text-sm text-[#555]">{video.audience} / {video.ageTrack} / {video.category}</p>
              </div>
              <button onClick={() => removeVideo(video.id)} className="rounded-md border border-[#cfd4dc] px-3 py-2 text-xs font-black text-[#8c0504] hover:border-[#8c0504]">
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm text-[#666]">{video.description}</p>
            <p className="mt-2 text-xs font-bold">
              {video.dripEnabled ? "Drip locked" : "Open order"} {video.isFreePreview ? "/ Free preview" : ""} {video.isMissionVideo ? "/ Mission video" : ""}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
