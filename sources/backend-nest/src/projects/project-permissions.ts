export type BuiltInProjectRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer';
export type ProjectRole = string;

export type ProjectPermissionKey =
  | 'project.view'
  | 'project.update'
  | 'project.delete'
  | 'api.view'
  | 'api.create'
  | 'api.update'
  | 'api.delete'
  | 'api.proxy'
  | 'asset.view'
  | 'asset.create'
  | 'asset.update'
  | 'asset.delete'
  | 'asset.suggestion.accept'
  | 'asset.suggestion.ignore'
  | 'team.view'
  | 'team.invite'
  | 'team.member.update'
  | 'team.member.remove'
  | 'team.invitation.revoke'
  | 'role.view'
  | 'role.update';

export const PROJECT_ROLES: BuiltInProjectRole[] = ['Owner', 'Admin', 'Editor', 'Viewer'];
export const EDITABLE_PROJECT_ROLES: Exclude<BuiltInProjectRole, 'Owner'>[] = ['Admin', 'Editor', 'Viewer'];

export const PROJECT_PERMISSION_KEYS: ProjectPermissionKey[] = [
  'project.view',
  'project.update',
  'project.delete',
  'api.view',
  'api.create',
  'api.update',
  'api.delete',
  'api.proxy',
  'asset.view',
  'asset.create',
  'asset.update',
  'asset.delete',
  'asset.suggestion.accept',
  'asset.suggestion.ignore',
  'team.view',
  'team.invite',
  'team.member.update',
  'team.member.remove',
  'team.invitation.revoke',
  'role.view',
  'role.update',
];

export const DEFAULT_ROLE_PERMISSIONS: Record<BuiltInProjectRole, ProjectPermissionKey[]> = {
  Owner: PROJECT_PERMISSION_KEYS,
  Admin: [
    'project.view',
    'project.update',
    'api.view',
    'api.create',
    'api.update',
    'api.delete',
    'api.proxy',
    'asset.view',
    'asset.create',
    'asset.update',
    'asset.delete',
    'asset.suggestion.accept',
    'asset.suggestion.ignore',
    'team.view',
    'team.invite',
    'team.member.update',
    'team.member.remove',
    'team.invitation.revoke',
    'role.view',
  ],
  Editor: [
    'project.view',
    'api.view',
    'api.create',
    'api.update',
    'api.delete',
    'api.proxy',
    'asset.view',
    'asset.create',
    'asset.update',
    'asset.delete',
    'asset.suggestion.accept',
    'asset.suggestion.ignore',
    'team.view',
    'role.view',
  ],
  Viewer: [
    'project.view',
    'api.view',
    'asset.view',
    'team.view',
    'role.view',
  ],
};

export function isBuiltInProjectRole(role?: string | null): role is BuiltInProjectRole {
  return role === 'Owner' || role === 'Admin' || role === 'Editor' || role === 'Viewer';
}

export function isEditableProjectRole(
  role?: string | null,
): role is Exclude<BuiltInProjectRole, 'Owner'> {
  return role === 'Admin' || role === 'Editor' || role === 'Viewer';
}

export function isProjectPermissionKey(
  permission?: string | null,
): permission is ProjectPermissionKey {
  return PROJECT_PERMISSION_KEYS.includes(permission as ProjectPermissionKey);
}
