import { ZodError } from "zod";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function successResponse(data: unknown, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init,
  );
}

export function errorResponse(
  statusCode: number,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
    },
    { status: statusCode },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return errorResponse(error.statusCode, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return errorResponse(422, "Validation failed.", error.flatten());
  }

  if (error instanceof SyntaxError) {
    return errorResponse(400, "Invalid JSON body.");
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return errorResponse(409, "A record with this value already exists.");
  }

  console.error("Unhandled API error:", error);
  return errorResponse(500, "Internal server error.");
}
