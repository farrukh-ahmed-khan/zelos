import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createSchoolSchema } from "@/lib/validation/school";
import { createSchool } from "@/lib/schools/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "schools.manage");
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
          licenseStatus: school.licenseStatus,
          licenseStartsAt: school.licenseStartsAt,
          licenseExpiresAt: school.licenseExpiresAt,
          assignedTracks: school.assignedTracks,
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
