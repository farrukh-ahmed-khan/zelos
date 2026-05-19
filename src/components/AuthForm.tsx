"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

type AuthMode = "login" | "signup";
type SubmitState = "idle" | "submitting" | "error";
type SignupPackageType = "free" | "monthly" | "annual";

type Plan = {
  id: string;
  name: string;
  description: string;
  interval: "monthly" | "annual";
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  discountBadge: string | null;
};

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [packageType, setPackageType] = useState<SignupPackageType>("free");
  const [packageStepComplete, setPackageStepComplete] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const isSignup = mode === "signup";
  const paidPlans = useMemo(
    () => plans.filter((plan) => plan.interval === packageType),
    [packageType, plans],
  );
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  useEffect(() => {
    if (!isSignup) {
      return;
    }

    let ignore = false;

    async function loadPlans() {
      setPlansLoading(true);
      const response = await api.get("/api/subscription-plans");
      const result = response.data;

      if (!ignore && isApiSuccess(response.status)) {
        setPlans(result.data.plans ?? []);
      }

      if (!ignore) {
        setPlansLoading(false);
      }
    }

    void loadPlans();

    return () => {
      ignore = true;
    };
  }, [isSignup]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSignup && !packageStepComplete) {
      if (packageType !== "free" && !selectedPlanId) {
        setMessage("Choose a package before continuing.");
        return;
      }

      setMessage("");
      setPackageStepComplete(true);
      return;
    }

    setSubmitState("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
    const isPaidSignup = isSignup && packageType !== "free";
    const payload = isSignup
      ? {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          role: isPaidSignup ? "subscriber" : "mentee",
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
        setMessage(
          isPaidSignup
            ? "Account created. Please verify your email, then sign in to complete checkout from Billing."
            : "Account created. Please verify your email before signing in.",
        );
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
      {isSignup && !packageStepComplete ? (
        <>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold">Choose your package</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { value: "free", label: "Free", detail: "Free videos, forum, and community access" },
                { value: "monthly", label: "Monthly", detail: "Paid subscriber access billed monthly" },
                { value: "annual", label: "Yearly", detail: "Paid subscriber access billed yearly" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const nextPackage = option.value as SignupPackageType;
                    setPackageType(nextPackage);
                    setSelectedPlanId("");
                    setMessage("");
                  }}
                  className={
                    packageType === option.value
                      ? "rounded-md border-2 border-[#212121] bg-[#faff8d] px-3 py-3 text-left shadow-[0_3px_0_#111]"
                      : "rounded-md border border-[#d8d2c5] bg-[#f7f2e8] px-3 py-3 text-left transition hover:border-[#b22222]"
                  }
                >
                  <span className="block text-sm font-black uppercase text-[#202020]">{option.label}</span>
                  <span className="mt-1 block text-xs font-semibold leading-snug text-[#555]">{option.detail}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {packageType === "free" ? (
            <div className="rounded-md border border-[#d8d2c5] bg-[#f7f2e8] px-4 py-3 text-sm text-[#4a4a4a]">
              <p className="font-bold text-[#202020]">Free account</p>
              <p className="mt-1">
                Start with free preview videos, forum posting, events, and the standard community tools.
              </p>
            </div>
          ) : (
            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold">
                {packageType === "monthly" ? "Monthly packages" : "Yearly packages"}
              </legend>
              {plansLoading ? (
                <p className="rounded-md bg-[#f7f2e8] px-4 py-3 text-sm font-semibold text-[#555]">
                  Loading packages...
                </p>
              ) : paidPlans.length ? (
                <div className="grid gap-3">
                  {paidPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setMessage("");
                      }}
                      disabled={!plan.stripePriceId}
                      className={
                        selectedPlanId === plan.id
                          ? "rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-3 text-left shadow-[0_3px_0_#111]"
                          : "rounded-md border border-[#d8d2c5] bg-white px-4 py-3 text-left transition hover:border-[#b22222] disabled:cursor-not-allowed disabled:opacity-60"
                      }
                    >
                      <span className="flex flex-wrap items-start justify-between gap-2">
                        <span>
                          <span className="block text-sm font-black text-[#202020]">{plan.name}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-[#555]">{plan.description}</span>
                        </span>
                        <span className="text-sm font-black text-[#8c0504]">
                          {(plan.priceCents / 100).toLocaleString(undefined, {
                            style: "currency",
                            currency: plan.currency.toUpperCase(),
                          })}
                        </span>
                      </span>
                      {plan.discountBadge ? (
                        <span className="mt-2 inline-block rounded-sm bg-[#eef2f7] px-2 py-1 text-xs font-black">
                          {plan.discountBadge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-semibold text-[#8c0504]">
                  No active {packageType === "monthly" ? "monthly" : "yearly"} packages are available yet.
                </p>
              )}
            </fieldset>
          )}
        </>
      ) : null}

      {!isSignup || packageStepComplete ? (
        <>
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

          <div className="rounded-md border border-[#d8d2c5] bg-[#f7f2e8] px-4 py-3 text-sm text-[#4a4a4a]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                <strong>Selected package:</strong>{" "}
                {packageType === "free"
                  ? "Free"
                  : selectedPlan
                    ? `${selectedPlan.name} / ${packageType === "monthly" ? "Monthly" : "Yearly"}`
                    : packageType === "monthly"
                      ? "Monthly"
                      : "Yearly"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPackageStepComplete(false);
                  setMessage("");
                }}
                className="text-sm font-black !text-[#8c0504]"
              >
                Change
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-[#d8d2c5] bg-[#f7f2e8] px-3 py-3 text-sm font-semibold">
            <input
              name="termsAccepted"
              type="checkbox"
              required
              className="mt-1 accent-[#b22222]"
            />
            <span>
              I agree to the Zelos terms and understand that age information is
              used to provide age-appropriate access.
            </span>
          </label>
        </>
      ) : null}
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
            ? packageType === "free"
              ? "Creating Free Account..."
              : "Starting Checkout..."
            : "Logging In..."
          : isSignup
            ? packageStepComplete
              ? packageType === "free"
                ? "Create Free Account"
                : "Create Account & Pay"
              : "Continue"
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
