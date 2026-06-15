import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createSchoolSchema } from "@/lib/validation/school";
import { createSchool } from "@/lib/schools/service";
import School from "@/models/School";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "schools.manage");
    const schools = await School.find().sort({ name: 1 }).lean();

    return successResponse({
      count: schools.length,
      schools: schools.map((school) => ({
        id: school._id.toString(),
        name: school.name,
        licenseType: school.licenseType ?? "school",
        district: school.district ?? null,
        teacherLimit: school.teacherLimit,
        studentLimit: school.studentLimit,
        teachersCount: school.teachersCount,
        studentsCount: school.studentsCount,
        licenseStatus: school.licenseStatus,
        licenseStartsAt: school.licenseStartsAt,
        licenseDurationMonths: school.licenseDurationMonths ?? 12,
        licenseExpiresAt: school.licenseExpiresAt,
        assignedTracks: school.assignedTracks,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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
          licenseType: school.licenseType,
          district: school.district,
          teachersCount: school.teachersCount,
          studentsCount: school.studentsCount,
          licenseStatus: school.licenseStatus,
          licenseStartsAt: school.licenseStartsAt,
          licenseDurationMonths: school.licenseDurationMonths ?? body.licenseDurationMonths,
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
