"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type SubmitState = "idle" | "submitting" | "success" | "error";

const expertiseOptions = [
  "Finance",
  "Medicine",
  "Law",
  "Government",
  "Public Safety",
  "Skilled Trades",
  "Engineering",
  "Science",
  "Entrepreneurship",
  "Small Business",
  "Education",
  "Technology",
  "Creative Arts & Media",
  "Communications",
  "Sports & Fitness",
  "Hospitality",
  "Transportation",
  "Agriculture",
  "Real Estate",
  "Luxury and Lifestyle",
  "Other",
];

const MAX_EXPERTISE_SELECTIONS = 8;

const mentoringPreferenceOptions = [
  "One-on-one mentoring",
  "Small group mentoring",
  "Large group mentoring",
  "Internship mentor",
  "Networking events",
  "Our forum",
  "Video/podcast",
  "Other",
];

export function MentorApplicationForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [expertise, setExpertise] = useState<string[]>(["Finance"]);
  const [mentoringPreference, setMentoringPreference] = useState("");

  function toggleExpertise(value: string) {
    setExpertise((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitState("submitting");
    setMessage("");

    const formData = new FormData(form);
    const otherExpertise = String(
      formData.get("otherExpertise") ?? "",
    ).trim();
    const submittedExpertise = expertise.map((option) =>
      option === "Other" ? `Other: ${otherExpertise}` : option,
    );
    const otherMentoringPreference = String(
      formData.get("otherMentoringPreference") ?? "",
    ).trim();
    const submittedMentoringPreference =
      mentoringPreference === "Other"
        ? `Other: ${otherMentoringPreference}`
        : mentoringPreference;

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      profession: String(formData.get("profession") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      expertise: submittedExpertise,
      mentoringPreference: submittedMentoringPreference,
      experienceYears: Number(formData.get("experienceYears") ?? 0),
      linkedInUrl: String(formData.get("linkedInUrl") ?? ""),
      availability: String(formData.get("availability") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      communicationPreferences: String(
        formData.get("communicationPreferences") ?? "",
      ),
      howHeard: String(formData.get("howHeard") ?? ""),
      whyMentor: String(formData.get("whyMentor") ?? ""),
    };

    try {
      const response = await api.post("/api/mentor-applications", payload);

      const result = response.data;

      if (!isApiSuccess(response.status)) {
        throw new Error(
          result?.error?.message ?? "Unable to submit mentor application.",
        );
      }

      form.reset();
      setExpertise(["Finance"]);
      setMentoringPreference("");
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
        <legend className="text-sm font-bold">
          Areas of expertise
          <span className="ml-2 font-normal text-[#666]">
            Choose up to {MAX_EXPERTISE_SELECTIONS}
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {expertiseOptions.map((option) => {
            const isChecked = expertise.includes(option);
            const isDisabled =
              !isChecked && expertise.length >= MAX_EXPERTISE_SELECTIONS;

            return (
              <label
                key={option}
                className={`flex items-center gap-2 rounded-md border border-[#d8d2c5] px-3 py-2 text-sm ${
                  isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggleExpertise(option)}
                  className="accent-[#b22222]"
                />
                {option}
              </label>
            );
          })}
        </div>

        {expertise.includes("Other") ? (
          <label className="grid max-w-xl gap-2 text-sm font-bold">
            Please specify your other area of expertise
            <input
              name="otherExpertise"
              required
              minLength={2}
              maxLength={70}
              autoFocus
              placeholder="Enter your area of expertise"
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
            />
          </label>
        ) : null}
      </fieldset>

      <label className="grid gap-2 text-sm font-bold">
        How would you like to mentor?
        <select
          name="mentoringPreference"
          required
          value={mentoringPreference}
          onChange={(event) => setMentoringPreference(event.target.value)}
          className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        >
          <option value="" disabled>
            Select one
          </option>
          {mentoringPreferenceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {mentoringPreference === "Other" ? (
        <label className="grid max-w-xl gap-2 text-sm font-bold">
          Please specify how you would like to mentor
          <input
            name="otherMentoringPreference"
            required
            minLength={2}
            maxLength={110}
            autoFocus
            placeholder="Enter your preferred mentoring format"
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>
      ) : null}

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
        Bio
        <textarea
          name="bio"
          required
          minLength={20}
          maxLength={1200}
          rows={5}
          className="resize-y rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Communication preference
          <input
            name="communicationPreferences"
            required
            maxLength={300}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          How did you hear about Zelos?
          <input
            name="howHeard"
            required
            maxLength={300}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
          />
        </label>
      </div>

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
