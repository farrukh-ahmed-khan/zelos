import { NextRequest } from "next/server";
import { parseFormData } from "@/lib/aws/parse-form";
import { uploadToS3 } from "@/lib/aws/s3";
import { handleApiError, successResponse } from "@/lib/http";
import { scholarshipApplicationSchema } from "@/lib/validation/commerce";
import { applyForScholarship } from "@/lib/scholarships/service";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ scholarshipId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    enforceRateLimit(`scholarship-apply:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const { scholarshipId } = await context.params;
    const contentType = request.headers.get("content-type") ?? "";
    let payload: unknown;

    if (contentType.includes("multipart/form-data")) {
      const form = await parseFormData(request);
      let documentUrl = form.fields.documentUrl;
      const document = form.files.document;

      if (document?.buffer.length) {
        const upload = await uploadToS3({
          file: document.buffer,
          fileName: document.filename,
          mimeType: document.mimetype,
          keyPrefix: "scholarship-applications",
        });
        documentUrl = upload.url;
      }

      payload = {
        name: form.fields.name,
        email: form.fields.email,
        school: form.fields.school,
        fieldOfStudy: form.fields.fieldOfStudy,
        gpa: form.fields.gpa ? Number(form.fields.gpa) : undefined,
        personalStatement: form.fields.personalStatement,
        documentUrl: documentUrl || undefined,
      };
    } else {
      payload = await request.json();
    }

    const body = scholarshipApplicationSchema.parse(payload);
    const application = await applyForScholarship(scholarshipId, body);
    return successResponse(
      {
        message: "Scholarship application submitted successfully.",
        applicationId: application._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
