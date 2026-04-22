import type { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "zelos_auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getCookieOptions(maxAge = AUTH_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", getCookieOptions(0));
}
