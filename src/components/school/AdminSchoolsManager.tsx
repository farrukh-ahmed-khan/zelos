"use client";

import { FormEvent, useState } from "react";

type School = {
  id: string;
  name: string;
  licenseType: string;
  district: string | null;
  teacherLimit: number;
  studentLimit: number;
  teachersCount: number;
  studentsCount: number;
  licenseStatus: string;
  assignedTracks: string[];
};

export function AdminSchoolsManager({ schools }: { schools: School[] }) {
  const [items, setItems] = useState(schools);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        licenseType: String(formData.get("licenseType") ?? "school"),
        district: String(formData.get("district") ?? ""),
        teacherLimit: Number(formData.get("teacherLimit") ?? 1),
        studentLimit: Number(formData.get("studentLimit") ?? 1),
        licenseStatus: String(formData.get("licenseStatus") ?? "active"),
        assignedTracks: String(formData.get("assignedTracks") ?? "")
          .split(",")
          .map((track) => track.trim())
          .filter(Boolean),
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to create school.");
      return;
    }

    setItems((current) => [result.data.school, ...current]);
    setMessage("School created.");
    form.reset();
  }

  async function inviteTeacher(event: FormEvent<HTMLFormElement>, schoolId: string) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch(`/api/schools/${schoolId}/invite-teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(formData.get("email") ?? "") }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to invite teacher.");
      return;
    }

    setMessage(`Teacher invite created: ${result.data.invite.inviteUrl}`);
    form.reset();
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={createSchool} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="name" placeholder="School or district name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <select name="licenseType" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="school">School</option>
          <option value="district">District</option>
        </select>
        <input name="district" placeholder="District tag" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <select name="licenseStatus" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
        <input name="teacherLimit" type="number" min={1} defaultValue={5} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="studentLimit" type="number" min={1} defaultValue={100} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="assignedTracks" placeholder="Children, Teens, Young Adults" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">Create School</button>
      </form>

      <section className="grid gap-3">
        {items.map((school) => (
          <article key={school.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
              <div>
                <p className="font-bold">{school.name}</p>
                <p className="text-sm text-[#555]">
                  {school.licenseType} / {school.licenseStatus} / teachers {school.teachersCount}/{school.teacherLimit} / students {school.studentsCount}/{school.studentLimit}
                </p>
                <p className="mt-1 text-xs text-[#667085]">
                  Tracks: {school.assignedTracks?.length ? school.assignedTracks.join(", ") : "None assigned"}
                </p>
              </div>
              <form onSubmit={(event) => inviteTeacher(event, school.id)} className="flex gap-2">
                <input name="email" type="email" placeholder="Teacher email" required className="min-w-0 flex-1 rounded-md border border-[#d8d2c5] px-3 py-2 text-sm" />
                <button className="rounded-md border border-[#cfd4dc] px-3 py-2 text-sm font-bold hover:border-[#8c0504]">Invite</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
