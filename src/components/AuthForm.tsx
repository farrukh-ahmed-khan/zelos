"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "signup";
type SubmitState = "idle" | "submitting" | "error";

type AuthFormProps = {
  mode: AuthMode;
};

const interestOptions = [
  "Budgeting",
  "Investing",
  "College Prep",
  "Career Guidance",
  "Entrepreneurship",
  "Scholarships",
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<"mentee" | "subscriber">("mentee");
  const [interests, setInterests] = useState<string[]>(["Budgeting"]);

  const isSignup = mode === "signup";

  function toggleInterest(value: string) {
    setInterests((current) =>
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
    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
    const payload = isSignup
      ? {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          role,
          age: Number(formData.get("age") ?? 0),
          interests,
        }
      : {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Something went wrong.");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border-2 border-[#212121] bg-white p-5 text-[#202020] shadow-[0_5px_0_#111] sm:p-7"
    >
      {isSignup ? (
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
      ) : null}

      <label className="grid gap-2 text-sm font-bold">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : 1}
          maxLength={72}
          className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
        />
      </label>

      {isSignup ? (
        <>
          <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr]">
            <label className="grid gap-2 text-sm font-bold">
              Age
              <input
                name="age"
                type="number"
                min={1}
                max={120}
                defaultValue={16}
                required
                className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal outline-none focus:border-[#b22222]"
              />
            </label>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-bold">Account type</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["mentee", "subscriber"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={
                      role === option
                        ? "rounded-md border-2 border-[#212121] bg-[#faff8d] px-3 py-3 text-sm font-black capitalize shadow-[0_3px_0_#111]"
                        : "rounded-md border border-[#d8d2c5] bg-[#f7f2e8] px-3 py-3 text-sm font-bold capitalize transition hover:border-[#b22222]"
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold">Interests</legend>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded-md border border-[#d8d2c5] px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(option)}
                    onChange={() => toggleInterest(option)}
                    className="accent-[#b22222]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : null}

      {message ? (
        <p className="rounded-md bg-[#ffe8e6] px-3 py-2 text-sm font-semibold text-[#8c0504]">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState === "submitting"
          ? isSignup
            ? "Creating Account..."
            : "Logging In..."
          : isSignup
            ? "Create Account"
            : "Log In"}
      </button>

      <p className="text-center text-sm font-semibold text-[#343434]">
        {isSignup ? "Already have an account?" : "New to Zelos?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="!text-[#b22222] transition hover:!text-[#7a0505]"
        >
          {isSignup ? "Log in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
