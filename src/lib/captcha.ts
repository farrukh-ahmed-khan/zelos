import axios from "axios";
import { ApiError } from "@/lib/http";

export async function verifyCaptchaToken(token?: string | null) {
  const secret =
    process.env.TURNSTILE_SECRET_KEY?.trim() ||
    process.env.HCAPTCHA_SECRET_KEY?.trim() ||
    process.env.RECAPTCHA_SECRET_KEY?.trim();

  if (!secret) {
    return;
  }

  if (!token) {
    throw new ApiError(422, "CAPTCHA verification is required.");
  }

  const endpoint = process.env.TURNSTILE_SECRET_KEY
    ? "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    : process.env.HCAPTCHA_SECRET_KEY
      ? "https://hcaptcha.com/siteverify"
      : "https://www.google.com/recaptcha/api/siteverify";

  const response = await axios.post(
    endpoint,
    new URLSearchParams({
      secret,
      response: token,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      validateStatus: () => true,
    },
  );

  if (!response.data?.success) {
    throw new ApiError(422, "CAPTCHA verification failed.");
  }
}
