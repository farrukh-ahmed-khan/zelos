import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { updateAdminInviteSchema } from "@/lib/validation/admin";
import AdminInvite from "@/models/AdminInvite";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    inviteId: string;
  }>;
};

function serializeInvite(invite: {
  _id: unknown;
  email: string;
  role: string;
  adminPermissions?: string[];
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
}) {
  return {
    id: invite._id?.toString?.() ?? String(invite._id),
    email: invite.email,
    role: invite.role,
    adminPermissions: invite.adminPermissions ?? [],
    expiresAt: invite.expiresAt,
    usedAt: invite.usedAt ?? null,
    createdAt: invite.createdAt,
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");

    if (actor.role !== "super-admin") {
      throw new ApiError(403, "Only a super admin can edit admin invites.");
    }

    const { inviteId } = await context.params;
    const body = updateAdminInviteSchema.safeParse(await request.json());

    if (!body.success) {
      throw new ApiError(400, body.error.issues[0]?.message ?? "Invalid invite update.");
    }

    const invite = await AdminInvite.findById(inviteId);

    if (!invite) {
      throw new ApiError(404, "Invite not found.");
    }

    if (invite.usedAt) {
      throw new ApiError(409, "Used invites cannot be edited or deactivated.");
    }

    const payload = body.data as {
      email?: string;
      role?: "forum-moderator" | "sub-admin";
      adminPermissions?: string[];
      deactivate?: boolean;
    };

    if (payload.deactivate) {
      invite.expiresAt = new Date();
    } else {
      if (payload.email) {
        invite.email = payload.email;
      }

      if (payload.role) {
        invite.role = payload.role;
        invite.adminPermissions =
          payload.role === "sub-admin" ? payload.adminPermissions ?? invite.adminPermissions : [];
      } else if (payload.adminPermissions) {
        invite.adminPermissions =
          invite.role === "sub-admin" ? payload.adminPermissions : [];
      }
    }

    await invite.save();

    return successResponse({
      message: payload.deactivate ? "Invite deactivated successfully." : "Invite updated successfully.",
      invite: serializeInvite(invite),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");

    if (actor.role !== "super-admin") {
      throw new ApiError(403, "Only a super admin can remove admin invites.");
    }

    const { inviteId } = await context.params;
    const invite = await AdminInvite.findById(inviteId);

    if (!invite) {
      throw new ApiError(404, "Invite not found.");
    }

    await AdminInvite.deleteOne({ _id: invite._id });

    return successResponse({
      message: "Invite removed successfully.",
      invite: serializeInvite(invite),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
