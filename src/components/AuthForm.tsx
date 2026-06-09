"use client";

import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type AuthMode = "login" | "signup";
type SubmitState = "idle" | "submitting" | "error";

type AuthFormProps = {
  mode: AuthMode;
};

function getApiErrorMessage(result: unknown) {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "object" &&
    result.error !== null
  ) {
    const error = result.error as {
      message?: unknown;
      details?: {
        fieldErrors?: Record<string, string[] | undefined>;
        formErrors?: string[];
      };
    };
    const fieldErrors = error.details?.fieldErrors;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).flat().find(Boolean)
      : null;

    if (firstFieldError) {
      return firstFieldError;
    }

    if (error.details?.formErrors?.[0]) {
      return error.details.formErrors[0];
    }

    if (typeof error.message === "string") {
      return error.message;
    }
  }

  return "Something went wrong.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        throw new Error(getApiErrorMessage(result));
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
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={isSignup ? 8 : 1}
            maxLength={72}
            className="w-full rounded-md border border-[#d8d2c5] px-3 py-3 pr-12 font-normal outline-none focus:border-[#b22222]"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#555] transition hover:bg-[#f7f2e8] hover:text-[#8c0504] focus:outline-none focus:ring-2 focus:ring-[#b22222]/25"
          >
            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </button>
        </div>
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
