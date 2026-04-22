import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { AUTH_COOKIE_MAX_AGE } from "@/lib/auth/cookies";
import { type UserRole } from "@/lib/auth/roles";

export type AuthTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_COOKIE_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  return {
    ...payload,
    sub: payload.sub ?? "",
    email: String(payload.email ?? ""),
    name: String(payload.name ?? ""),
    role: payload.role as UserRole,
  };
}
