import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  enforceRateLimit(`scholarship-donate:${request.headers.get("x-forwarded-for") ?? "local"}`);
  return errorResponse(
    410,
    "Scholarship funding is handled off-platform. Use the Fund a Scholarship form to start a lead conversation.",
  );
}
