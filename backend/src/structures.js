/**
 * Lightweight schema-like structures used to prepare for auth and ownership.
 * This stays database-agnostic for now and only shapes plain JavaScript objects.
 */

export function createUser(overrides = {}) {
  return {
    id: overrides.id ?? null,
    email: overrides.email ?? "",
    displayName: overrides.displayName ?? "",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

export function createWorkspace(overrides = {}) {
  return {
    id: overrides.id ?? null,
    name: overrides.name ?? "Personal Workspace",
    ownerUserId: overrides.ownerUserId ?? null,
    memberUserIds: overrides.memberUserIds ?? [],
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

export function createIdea(overrides = {}) {
  return {
    id: overrides.id ?? null,
    userId: overrides.userId ?? null,
    workspaceId: overrides.workspaceId ?? null,
    projectName: overrides.projectName ?? "",
    problem: overrides.problem ?? "",
    audience: overrides.audience ?? "",
    coreFeatures: overrides.coreFeatures ?? "",
    constraints: overrides.constraints ?? "",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

export const STRUCTURE_NAMES = ["User", "Idea", "Workspace"];
