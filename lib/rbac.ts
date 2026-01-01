import { GlobalRole, WorkspaceRole } from "@prisma/client";

export function isSuperAdmin(globalRole: GlobalRole) {
  return globalRole === GlobalRole.SUPER_ADMIN;
}

export function hasWorkspaceAdmin(role: WorkspaceRole) {
  return role === WorkspaceRole.CLIENT_ADMIN;
}

export function canViewModule(role: WorkspaceRole) {
  // All roles can view enabled modules; actions may be restricted later.
  return role === WorkspaceRole.CLIENT_ADMIN || role === WorkspaceRole.AGENT || role === WorkspaceRole.VIEWER;
}
