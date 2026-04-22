import School, { type SchoolDocument } from "@/models/School";

export function resolveSchoolLicenseStatus(school: SchoolDocument) {
  if (school.licenseStatus === "suspended") {
    return "suspended";
  }

  if (school.licenseExpiresAt && school.licenseExpiresAt < new Date()) {
    return "expired";
  }

  return school.licenseStatus;
}

export async function syncSchoolLicenseStatus(schoolId: string) {
  const school = await School.findById(schoolId);

  if (!school) {
    return null;
  }

  const resolvedStatus = resolveSchoolLicenseStatus(school);

  if (resolvedStatus !== school.licenseStatus) {
    school.licenseStatus = resolvedStatus;
    await school.save();
  }

  return school;
}
