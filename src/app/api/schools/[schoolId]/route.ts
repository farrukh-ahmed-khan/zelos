import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { updateSchoolSchema } from "@/lib/validation/school";
import School from "@/models/School";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ schoolId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "schools.manage");
    const { schoolId } = await context.params;
    const body = updateSchoolSchema.parse(await request.json());

    await connectToDatabase();

    const school = await School.findByIdAndUpdate(
      schoolId,
      { $set: { licenseStatus: body.licenseStatus } },
      { new: true, runValidators: true },
    );

    if (!school) {
      throw new ApiError(404, "School not found.");
    }

    return successResponse({
      message: "School subscription updated.",
      school: {
        id: school._id.toString(),
        name: school.name,
        teacherLimit: school.teacherLimit,
        studentLimit: school.studentLimit,
        teachersCount: school.teachersCount,
        studentsCount: school.studentsCount,
        licenseStatus: school.licenseStatus,
        licenseDurationMonths: school.licenseDurationMonths ?? 12,
        licenseExpiresAt: school.licenseExpiresAt,
        assignedTracks: school.assignedTracks ?? [],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
