import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { createAdminInvite } from "@/lib/admin-invites/service";
import { handleApiError, successResponse } from "@/lib/http";
import { createAdminInviteSchema } from "@/lib/validation/admin";
import AdminInvite from "@/models/AdminInvite";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const invites = await AdminInvite.find()
      .sort({ createdAt: -1 })
      .select("email role adminPermissions expiresAt usedAt createdAt")
      .lean();

    return successResponse({
      invites: invites.map((invite) => ({
        id: invite._id.toString(),
        email: invite.email,
        role: invite.role,
        adminPermissions: invite.adminPermissions ?? [],
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt ?? null,
        createdAt: invite.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");
    const body = createAdminInviteSchema.parse(await request.json());
    const result = await createAdminInvite({
      actor,
      email: body.email,
      role: body.role,
      adminPermissions: body.adminPermissions,
    });

    return successResponse(
      {
        message: "Invite created successfully.",
        invite: {
          id: result.invite._id.toString(),
          email: result.invite.email,
          role: result.invite.role,
          adminPermissions: result.invite.adminPermissions,
          expiresAt: result.invite.expiresAt,
          inviteUrl: result.inviteUrl,
          ...(process.env.NODE_ENV !== "production"
            ? { inviteToken: result.inviteToken }
            : {}),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
