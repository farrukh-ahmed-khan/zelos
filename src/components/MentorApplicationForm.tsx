"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

const expertiseOptions = [
  "Finance",
  "Entrepreneurship",
  "Technology",
  "Medicine",
  "Law",
  "Engineering",
  "Creative Careers",
  "College Readiness",
];

export function MentorApplicationForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [expertise, setExpertise] = useState<string[]>(["Finance"]);

  function toggleExpertise(value: string) {
    setExpertise((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      profession: String(formData.get("profession") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      expertise,
      experienceYears: Number(formData.get("experienceYears") ?? 0),
      linkedInUrl: String(formData.get("linkedInUrl") ?? ""),
      availability: String(formData.get("availability") ?? ""),
      whyMentor: String(formData.get("whyMentor") ?? ""),
    };

    try {
      const response = await fetch("/api/mentor-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message ?? "Unable to submit mentor application.",
        );
      }

      event.currentTarget.reset();
      setExpertise(["Finance"]);
      setSubmitState("success");
      setMessage("Thanks. Your mentor application has been sent to the admin team.");
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit mentor application.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border-2 border-[#212121] bg-white p-5 text-[#202020] shadow-[0_5px_0_#111] sm:p-7"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Full name
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Phone
          <input
            name="phone"
            required
            minLength={7}
            maxLength={30}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Profession
          <input
            name="profession"
            required
            minLength={2}
            maxLength={120}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Organization
          <input
            name="organization"
            maxLength={120}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Years of experience
          <input
            name="experienceYears"
            type="number"
            min={0}
            max={80}
            defaultValue={3}
            required
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-bold">Areas of expertise</legend>
        <div className="flex flex-wrap gap-2">
          {expertiseOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 rounded-md border border-[#d8d2c5] px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={expertise.includes(option)}
                onChange={() => toggleExpertise(option)}
                className="accent-[#b22222]"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-bold">
        LinkedIn or website
        <input
          name="linkedInUrl"
          type="url"
          maxLength={300}
          className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Availability
        <input
          name="availability"
          required
          minLength={3}
          maxLength={160}
          placeholder="Example: 2 evenings per month"
          className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Why do you want to mentor?
        <textarea
          name="whyMentor"
          required
          minLength={20}
          maxLength={2000}
          rows={6}
          className="resize-y rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        />
      </label>

      {message ? (
        <p
          className={
            submitState === "error"
              ? "rounded-md bg-[#ffe8e6] px-3 py-2 text-sm font-semibold text-[#8c0504]"
              : "rounded-md bg-[#eef8e8] px-3 py-2 text-sm font-semibold text-[#24551f]"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState === "submitting" || expertise.length === 0}
        className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState === "submitting" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
