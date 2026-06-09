"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type AuthMode = "login" | "signup";
type SubmitState = "idle" | "submitting" | "error";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const isSignup = mode === "signup";

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
          role: "subscriber",
          age: Number(formData.get("age") ?? 0),
          termsAccepted: formData.get("termsAccepted") === "on",
          termsVersion: "v1",
        }
      : {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        };

    try {
      const response = await api.post(endpoint, payload);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        throw new Error(result?.error?.message ?? "Something went wrong.");
      }

      if (isSignup) {
        setSubmitState("idle");
        setMessage("Account created. Please verify your email before signing in.");
        return;
      }

      router.push("/dashboard");
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

      {!isSignup ? (
        <div className="-mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-black !text-[#b22222] transition hover:!text-[#7a0505]"
          >
            Forgot password?
          </Link>
        </div>
      ) : null}

      {isSignup ? (
        <>
          <div className="grid gap-4">
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
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[#d8d2c5] bg-[#fbf8f0] px-3 py-3 text-sm font-semibold leading-snug text-[#2b2b2b] transition hover:border-[#b22222] hover:bg-[#fffaf0] focus-within:ring-2 focus-within:ring-[#b22222]/25">
            <input
              name="termsAccepted"
              type="checkbox"
              required
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border-2 border-[#212121] bg-white shadow-[0_2px_0_#111] transition peer-checked:bg-[#b22222] peer-checked:[&>span]:block"
            >
              <span className="hidden h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-white" />
            </span>
            <span>
              I agree to the <span className="font-black text-[#8c0504]">Zelos terms</span> and understand
              that age information is used to provide age-appropriate access.
            </span>
          </label>
        </>
      ) : null}

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
