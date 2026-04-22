import { NextRequest } from "next/server";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createSchoolSchema } from "@/lib/validation/school";
import { createSchool } from "@/lib/schools/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ADMIN_ROLES);
    const body = createSchoolSchema.parse(await request.json());

    const school = await createSchool(body);

    return successResponse(
      {
        message: "School created successfully.",
        school: {
          id: school._id.toString(),
          name: school.name,
          teacherLimit: school.teacherLimit,
          studentLimit: school.studentLimit,
          teachersCount: school.teachersCount,
          studentsCount: school.studentsCount,
          createdAt: school.createdAt,
          updatedAt: school.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
