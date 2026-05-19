"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type TokenActionFormProps = {
  endpoint: string;
  token?: string;
  mode: "verify-email" | "reset-password" | "forgot-password";
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

  return "Request failed.";
}

export function TokenActionForm({ endpoint, token = "", mode }: TokenActionFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const payload =
        mode === "forgot-password"
          ? { email: String(formData.get("email") ?? "") }
          : mode === "reset-password"
            ? {
                token: String(formData.get("token") ?? ""),
                password: String(formData.get("password") ?? ""),
              }
            : { token: String(formData.get("token") ?? "") };

      const response = await api.post(endpoint, payload);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(getApiErrorMessage(result));
        return;
      }

      setMessage(result?.data?.message ?? "Done.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-12 grid gap-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
      {mode === "forgot-password" ? (
        <input name="email" type="email" placeholder="Email" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      ) : (
        <>
          <input type="hidden" name="token" value={token} />
          <input
            value={token}
            placeholder="Token"
            disabled
            className="rounded-md border border-[#d8d2c5] bg-[#f7f2e8] px-3 py-3 text-[#555] disabled:cursor-not-allowed"
          />
        </>
      )}
      {mode === "reset-password" ? (
        <input name="password" type="password" placeholder="New password" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      ) : null}
      {message ? <p className="rounded-md bg-[#eef8e8] px-3 py-2 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-3 py-2 text-sm font-bold text-[#8c0504]">{error}</p> : null}
      <button
        disabled={isSubmitting}
        className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
