import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateId } from '../auth/auth.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_ROLE_PERMISSIONS,
  isBuiltInProjectRole,
  isProjectPermissionKey,
  PROJECT_PERMISSION_KEYS,
  type ProjectPermissionKey,
  type ProjectRole,
} from './project-permissions';

export interface ProjectAccess {
  project: {
    id: string;
    name?: string;
    ownerId: string;
    proxyUrl?: string | null;
  };
  role: ProjectRole;
}

const ROLE_RANK: Record<ProjectRole, number> = {
  Viewer: 1,
  Editor: 2,
  Admin: 3,
  Owner: 4,
};

type RolePermissionMap = Record<ProjectRole, ProjectPermissionKey[]>;

export interface ProjectRoleDefinition {
  roleKey: string;
  name: string;
  description: string | null;
  systemRole: boolean;
  locked: boolean;
  sortOrder: number;
  permissions: ProjectPermissionKey[];
}

const DEFAULT_ROLE_DEFINITIONS: ProjectRoleDefinition[] = [
  {
    roleKey: 'Owner',
    name: '所有者',
    description: '项目所有者，拥有完整访问权限。',
    systemRole: true,
    locked: true,
    sortOrder: 10,
    permissions: DEFAULT_ROLE_PERMISSIONS.Owner,
  },
  {
    roleKey: 'Admin',
    name: '管理员',
    description: '管理项目、成员、接口和公共资产。',
    systemRole: true,
    locked: false,
    sortOrder: 20,
    permissions: DEFAULT_ROLE_PERMISSIONS.Admin,
  },
  {
    roleKey: 'Editor',
    name: '编辑者',
    description: '维护接口和公共资产。',
    systemRole: true,
    locked: false,
    sortOrder: 30,
    permissions: DEFAULT_ROLE_PERMISSIONS.Editor,
  },
  {
    roleKey: 'Viewer',
    name: '查看者',
    description: '仅查看项目资源。',
    systemRole: true,
    locked: false,
    sortOrder: 40,
    permissions: DEFAULT_ROLE_PERMISSIONS.Viewer,
  },
];

@Injectable()
export class ProjectAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(userId: string, projectId: string): Promise<ProjectAccess> {
    const rows = await this.prisma.$queryRaw<
      {
        id: string;
        name: string;
        ownerId: string;
        proxyUrl: string | null;
        memberRole: string | null;
        memberStatus: string | null;
      }[]
    >`
      SELECT
        p.id,
        p.name,
        p.owner_id AS ownerId,
        p.proxy_url AS proxyUrl,
        pm.role AS memberRole,
        pm.status AS memberStatus
      FROM projects p
      LEFT JOIN project_members pm
        ON pm.project_id = p.id
       AND pm.user_id = ${userId}
      WHERE p.id = ${projectId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Project not found');
    }
    if (row.ownerId === userId) {
      return {
        project: {
          id: row.id,
          name: row.name,
          ownerId: row.ownerId,
          proxyUrl: row.proxyUrl,
        },
        role: 'Owner',
      };
    }
    if (row.memberStatus === 'Active' && row.memberRole) {
      const roleExists = isBuiltInProjectRole(row.memberRole) || await this.findRole(projectId, row.memberRole);
      if (!roleExists) {
        throw new NotFoundException('Project not found');
      }
      return {
        project: {
          id: row.id,
          name: row.name,
          ownerId: row.ownerId,
          proxyUrl: row.proxyUrl,
        },
        role: row.memberRole,
      };
    }
    throw new NotFoundException('Project not found');
  }

  async ensureAtLeast(
    userId: string,
    projectId: string,
    minRole: ProjectRole,
  ): Promise<ProjectAccess> {
    const access = await this.getAccess(userId, projectId);
    if ((ROLE_RANK[access.role] ?? 0) < (ROLE_RANK[minRole] ?? 0)) {
      throw new ForbiddenException('Insufficient project permission');
    }
    return access;
  }

  async ensurePermission(
    userId: string,
    projectId: string,
    permission: ProjectPermissionKey,
  ): Promise<ProjectAccess> {
    const access = await this.getAccess(userId, projectId);
    if (!(await this.hasPermission(projectId, access.role, permission))) {
      throw new ForbiddenException('Insufficient project permission');
    }
    return access;
  }

  async getRolePermissions(userId: string, projectId: string) {
    const access = await this.ensurePermission(userId, projectId, 'role.view');
    const roles = await this.rolesWithPermissions(projectId);
    return {
      currentUserRole: access.role,
      roles,
      permissionKeys: PROJECT_PERMISSION_KEYS,
      permissions: Object.fromEntries(roles.map((role) => [role.roleKey, role.permissions])),
      editableRoles: roles.filter((role) => role.roleKey !== 'Owner').map((role) => role.roleKey),
    };
  }

  async updateRolePermissions(
    userId: string,
    projectId: string,
    permissions: Partial<Record<string, string[]>>,
  ) {
    const access = await this.ensurePermission(userId, projectId, 'role.update');
    if (access.role !== 'Owner') {
      throw new ForbiddenException('Only owner can edit role permissions');
    }

    const roles = await this.listRoles(projectId);
    for (const role of roles) {
      if (role.roleKey === 'Owner') continue;
      const requested = permissions[role.roleKey];
      if (!requested) continue;
      const next = requested.filter(isProjectPermissionKey);
      await this.replaceRolePermissions(projectId, role.roleKey, next);
    }

    return this.getRolePermissions(userId, projectId);
  }

  async listRoleDefinitions(userId: string, projectId: string) {
    const access = await this.ensurePermission(userId, projectId, 'role.view');
    return {
      currentUserRole: access.role,
      roles: await this.rolesWithPermissions(projectId),
      permissionKeys: PROJECT_PERMISSION_KEYS,
    };
  }

  async createRole(
    userId: string,
    projectId: string,
    dto: { name?: string; description?: string; copyFromRoleKey?: string },
  ) {
    await this.ensureOwnerRoleEditor(userId, projectId);
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Role name is required');
    }
    const roleKey = this.createRoleKey(name);
    const existing = await this.findRole(projectId, roleKey);
    if (existing) {
      throw new ConflictException('Role already exists');
    }
    const roles = await this.listRoles(projectId);
    await this.insertRole(projectId, roleKey, name, dto.description || null, false, false, roles.length * 10 + 10);
    const sourcePermissions = dto.copyFromRoleKey
      ? (await this.rolePermissions(projectId))[dto.copyFromRoleKey] || DEFAULT_ROLE_PERMISSIONS.Viewer
      : DEFAULT_ROLE_PERMISSIONS.Viewer;
    await this.replaceRolePermissions(projectId, roleKey, sourcePermissions);
    return this.listRoleDefinitions(userId, projectId);
  }

  async updateRole(
    userId: string,
    projectId: string,
    roleKey: string,
    dto: { name?: string; description?: string; permissions?: string[] },
  ) {
    await this.ensureOwnerRoleEditor(userId, projectId);
    const role = await this.findRole(projectId, roleKey);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.locked && dto.permissions) {
      throw new BadRequestException('Locked role permissions cannot be changed');
    }
    await this.prisma.$executeRaw`
      UPDATE project_roles
      SET name = ${dto.name?.trim() || role.name},
          description = ${dto.description !== undefined ? dto.description : role.description}
      WHERE project_id = ${projectId}
        AND role_key = ${roleKey}
    `;
    if (!role.locked && dto.permissions) {
      await this.replaceRolePermissions(projectId, roleKey, dto.permissions.filter(isProjectPermissionKey));
    }
    return this.listRoleDefinitions(userId, projectId);
  }

  async copyRole(userId: string, projectId: string, roleKey: string) {
    const source = await this.findRole(projectId, roleKey);
    if (!source) {
      throw new NotFoundException('Role not found');
    }
    return this.createRole(userId, projectId, {
      name: `${source.name} Copy`,
      description: source.description || undefined,
      copyFromRoleKey: source.roleKey,
    });
  }

  async deleteRole(userId: string, projectId: string, roleKey: string) {
    await this.ensureOwnerRoleEditor(userId, projectId);
    const role = await this.findRole(projectId, roleKey);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.systemRole || role.locked) {
      throw new BadRequestException('System role cannot be deleted');
    }
    const memberRefs = await this.prisma.$queryRaw<{ count: bigint | number }[]>`
      SELECT COUNT(*) AS count
      FROM project_members
      WHERE project_id = ${projectId}
        AND role = ${roleKey}
    `;
    const inviteRefs = await this.prisma.$queryRaw<{ count: bigint | number }[]>`
      SELECT COUNT(*) AS count
      FROM project_invitations
      WHERE project_id = ${projectId}
        AND role = ${roleKey}
        AND status = 'Pending'
    `;
    if (Number(memberRefs[0]?.count || 0) > 0 || Number(inviteRefs[0]?.count || 0) > 0) {
      throw new ConflictException('Role is still used by members or pending invitations');
    }
    await this.prisma.$executeRaw`
      DELETE FROM project_role_permissions
      WHERE project_id = ${projectId}
        AND role = ${roleKey}
    `;
    await this.prisma.$executeRaw`
      DELETE FROM project_roles
      WHERE project_id = ${projectId}
        AND role_key = ${roleKey}
    `;
    return this.listRoleDefinitions(userId, projectId);
  }

  async ensureAssignableRole(projectId: string, roleKey?: string) {
    if (!roleKey) {
      throw new BadRequestException('Role is required');
    }
    if (roleKey === 'Owner') {
      throw new BadRequestException('Owner cannot be assigned as member role');
    }
    const role = await this.findRole(projectId, roleKey);
    if (!role) {
      throw new BadRequestException('Role does not exist');
    }
    return role.roleKey;
  }

  async visibleProjectIds(userId: string) {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM projects
      WHERE owner_id = ${userId}
      UNION
      SELECT project_id AS id
      FROM project_members
      WHERE user_id = ${userId}
        AND status = 'Active'
    `;
    return rows.map((row) => row.id);
  }

  visibleProjectFilter(userId: string) {
    return Prisma.sql`
      (
        p.owner_id = ${userId}
        OR EXISTS (
          SELECT 1
          FROM project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id = ${userId}
            AND pm.status = 'Active'
        )
      )
    `;
  }

  canManageMembers(role: ProjectRole) {
    return (DEFAULT_ROLE_PERMISSIONS as any)[role]?.includes('team.member.update') || false;
  }

  canEditProject(role: ProjectRole) {
    return (DEFAULT_ROLE_PERMISSIONS as any)[role]?.includes('project.update') || false;
  }

  canEditContent(role: ProjectRole) {
    return (DEFAULT_ROLE_PERMISSIONS as any)[role]?.includes('api.update') || false;
  }

  private async hasPermission(
    projectId: string,
    role: ProjectRole,
    permission: ProjectPermissionKey,
  ) {
    const permissions = await this.rolePermissions(projectId);
    return (permissions[role] || []).includes(permission);
  }

  private async rolePermissions(projectId: string): Promise<RolePermissionMap> {
    await this.ensureDefaultRoles(projectId);
    const rows = await this.prisma.$queryRaw<
      { role: string; permissionKey: string; enabled: boolean | number }[]
    >`
      SELECT role, permission_key AS permissionKey, enabled
      FROM project_role_permissions
      WHERE project_id = ${projectId}
    `;

    const roles = await this.listRoles(projectId);
    const result: RolePermissionMap = {};
    roles.forEach((role) => {
      result[role.roleKey] = isBuiltInProjectRole(role.roleKey)
        ? [...DEFAULT_ROLE_PERMISSIONS[role.roleKey]]
        : [];
    });
    const grouped = new Map<ProjectRole, ProjectPermissionKey[]>();
    rows.forEach((row) => {
      if (!isProjectPermissionKey(row.permissionKey) || row.role === 'Owner') {
        return;
      }
      if (row.enabled === false || row.enabled === 0) return;
      grouped.set(row.role, [...(grouped.get(row.role) || []), row.permissionKey]);
    });
    grouped.forEach((permissions, role) => {
      result[role] = permissions;
    });
    return result;
  }

  private async replaceRolePermissions(
    projectId: string,
    role: ProjectRole,
    permissions: ProjectPermissionKey[],
  ) {
    if (role === 'Owner') return;
    await this.prisma.$executeRaw`
      DELETE FROM project_role_permissions
      WHERE project_id = ${projectId}
        AND role = ${role}
    `;
    for (const permission of permissions) {
      await this.prisma.$executeRaw`
        INSERT INTO project_role_permissions (id, project_id, role, permission_key, enabled)
        VALUES (${generateId('prp')}, ${projectId}, ${role}, ${permission}, 1)
      `;
    }
  }

  private async rolesWithPermissions(projectId: string) {
    const roles = await this.listRoles(projectId);
    const permissions = await this.rolePermissions(projectId);
    return roles.map((role) => ({
      ...role,
      permissions: permissions[role.roleKey] || [],
    }));
  }

  private async listRoles(projectId: string) {
    await this.ensureDefaultRoles(projectId);
    return this.listRolesRaw(projectId);
  }

  private async listRolesRaw(projectId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        role_key AS roleKey,
        name,
        description,
        system_role AS systemRole,
        locked,
        sort_order AS sortOrder
      FROM project_roles
      WHERE project_id = ${projectId}
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows.map((row) => ({
      roleKey: String(row.roleKey),
      name: String(row.name),
      description: row.description ? String(row.description) : null,
      systemRole: row.systemRole === true || row.systemRole === 1,
      locked: row.locked === true || row.locked === 1,
      sortOrder: Number(row.sortOrder || 0),
    }));
  }

  private async findRole(projectId: string, roleKey: string) {
    const roles = await this.listRoles(projectId);
    return roles.find((role) => role.roleKey === roleKey) || null;
  }

  private async ensureDefaultRoles(projectId: string) {
    const rows = await this.prisma.$queryRaw<{ roleKey: string }[]>`
      SELECT role_key AS roleKey
      FROM project_roles
      WHERE project_id = ${projectId}
    `;
    const existing = new Set(rows.map((row) => row.roleKey));
    for (const role of DEFAULT_ROLE_DEFINITIONS) {
      if (existing.has(role.roleKey)) {
        await this.prisma.$executeRaw`
          UPDATE project_roles
          SET name = ${role.name},
              description = ${role.description},
              system_role = ${role.systemRole ? 1 : 0},
              locked = ${role.locked ? 1 : 0},
              sort_order = ${role.sortOrder}
          WHERE project_id = ${projectId}
            AND role_key = ${role.roleKey}
            AND system_role = 1
        `;
        continue;
      }
      await this.insertRole(
        projectId,
        role.roleKey,
        role.name,
        role.description,
        role.systemRole,
        role.locked,
        role.sortOrder,
      );
      if (role.roleKey !== 'Owner') {
        await this.replaceRolePermissions(projectId, role.roleKey, role.permissions);
      }
    }
  }

  private async insertRole(
    projectId: string,
    roleKey: string,
    name: string,
    description: string | null,
    systemRole: boolean,
    locked: boolean,
    sortOrder: number,
  ) {
    await this.prisma.$executeRaw`
      INSERT INTO project_roles (id, project_id, role_key, name, description, system_role, locked, sort_order)
      VALUES (${generateId('role')}, ${projectId}, ${roleKey}, ${name}, ${description}, ${systemRole ? 1 : 0}, ${locked ? 1 : 0}, ${sortOrder})
    `;
  }

  private async ensureOwnerRoleEditor(userId: string, projectId: string) {
    const access = await this.ensurePermission(userId, projectId, 'role.update');
    if (access.role !== 'Owner') {
      throw new ForbiddenException('Only owner can edit roles');
    }
    return access;
  }

  private createRoleKey(name: string) {
    const base = name
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32);
    return `Custom_${base || Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }
}
