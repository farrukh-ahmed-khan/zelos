import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { mentorApplicationSchema } from "@/lib/validation/mentor";
import {
  createMentorApplication,
  serializeMentorApplication,
} from "@/lib/mentor-applications/service";
import { queueEmail } from "@/lib/notifications/service";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`mentor:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = mentorApplicationSchema.parse(await request.json());

    const application = await createMentorApplication({
      ...body,
      organization: body.organization || undefined,
      linkedInUrl: body.linkedInUrl || undefined,
    });

    await queueEmail({
      template: "mentor-application-acknowledgment",
      recipient: application.email,
      payload: {
        name: application.name,
        profession: application.profession,
      },
    });

    return successResponse(
      {
        message: "Mentor application submitted successfully.",
        application: serializeMentorApplication(application),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
