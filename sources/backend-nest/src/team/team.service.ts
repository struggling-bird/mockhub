import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ok } from '../common/api-response';
import { generateId, generateToken } from '../auth/auth.util';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../projects/project-access.service';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { UpdateProjectRoleDto } from './dto/update-project-role.dto';

const MEMBER_STATUSES = ['Active', 'Inactive'];
const INVITATION_TTL_DAYS = 7;

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async list(userId: string, projectId: string) {
    const access = await this.projectAccess.ensurePermission(userId, projectId, 'team.view');
    const ownerRows = await this.prisma.$queryRaw<
      { id: string; email: string; username: string | null; company: string | null }[]
    >`
      SELECT u.id, u.email, u.username, u.company
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      WHERE p.id = ${projectId}
      LIMIT 1
    `;
    const owner = ownerRows[0];
    if (!owner) {
      throw new NotFoundException('Project owner not found');
    }

    const memberRows = await this.prisma.$queryRaw<
      {
        id: string;
        userId: string;
        email: string;
        username: string | null;
        company: string | null;
        role: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >`
      SELECT
        pm.id,
        pm.user_id AS userId,
        u.email,
        u.username,
        u.company,
        pm.role,
        pm.status,
        pm.created_at AS createdAt,
        pm.updated_at AS updatedAt
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ${projectId}
      ORDER BY pm.updated_at DESC
    `;

    return ok(
      {
        currentUserRole: access.role,
        members: [
          this.toOwnerMember(owner),
          ...memberRows.map((member) => this.toMember(member)),
        ],
        invitations: await this.listInvitations(projectId),
      },
      '获取项目成员成功',
    );
  }

  async add(userId: string, projectId: string, dto: AddProjectMemberDto) {
    await this.projectAccess.ensurePermission(userId, projectId, 'team.invite');
    const email = dto.email?.trim().toLowerCase();
    const role = await this.projectAccess.ensureAssignableRole(projectId, dto.role?.trim());
    if (!email) {
      throw new BadRequestException('email is required');
    }
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('email is invalid');
    }

    const access = await this.projectAccess.getAccess(userId, projectId);
    const users = await this.prisma.$queryRaw<{ id: string; email: string }[]>`
      SELECT id, email
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    const user = users[0];
    if (user?.id === access.project.ownerId) {
      throw new BadRequestException('Project owner cannot be invited as member');
    }

    if (user) {
      const existingMember = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM project_members
        WHERE project_id = ${projectId}
          AND user_id = ${user.id}
        LIMIT 1
      `;
      if (existingMember.length > 0) {
        throw new BadRequestException('User is already a project member');
      }
    }

    const existingInvitation = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM project_invitations
      WHERE project_id = ${projectId}
        AND email = ${email}
        AND status = 'Pending'
      LIMIT 1
    `;
    if (existingInvitation.length > 0) {
      throw new BadRequestException('Invitation already pending for this email');
    }

    const id = generateId('inv');
    const token = `inv_${generateToken()}`;
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.$executeRaw`
      INSERT INTO project_invitations (id, project_id, email, role, token, status, invited_by_id, expires_at)
      VALUES (${id}, ${projectId}, ${email}, ${role}, ${token}, 'Pending', ${userId}, ${expiresAt})
    `;

    const invitation = await this.findInvitationById(projectId, id);
    return ok(
      {
        invitation: this.toInvitation(invitation),
        inviteLink: this.inviteLink(token),
        inviteMessage: this.inviteMessage(invitation),
        team: (await this.list(userId, projectId)).data,
      },
      '邀请已生成',
    );
  }

  async invitationDetail(token: string) {
    const invitation = await this.findInvitationByToken(token);
    return ok(this.toInvitationDetail(invitation), '获取邀请信息成功');
  }

  async registrationContext(token: string) {
    const invitation = await this.findInvitationByToken(token);
    await this.ensureInvitationCanBeAccepted(invitation);
    return {
      email: invitation.email.toLowerCase(),
      company: invitation.organizationName || invitation.projectName,
    };
  }

  async acceptInvitation(userId: string, token: string) {
    const invitation = await this.findInvitationByToken(token);
    await this.ensureInvitationCanBeAccepted(invitation);

    const users = await this.prisma.$queryRaw<{ id: string; email: string }[]>`
      SELECT id, email
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    const user = users[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('Invitation email does not match current user');
    }

    await this.addMemberFromInvitation(invitation, user.id);
    await this.markInvitationAccepted(invitation.id);
    return ok(
      {
        projectId: invitation.projectId,
        projectName: invitation.projectName,
        role: invitation.role,
      },
      '已接受邀请',
    );
  }

  async acceptPendingForUser(userId: string, email: string, token?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const invitations = token
      ? await this.prisma.$queryRaw<any[]>`
          SELECT
            pi.id,
            pi.project_id AS projectId,
            p.name AS projectName,
            pi.email,
            pi.role,
            pi.token,
            pi.status,
            pi.expires_at AS expiresAt
          FROM project_invitations pi
          JOIN projects p ON p.id = pi.project_id
          WHERE pi.token = ${token}
            AND pi.email = ${normalizedEmail}
            AND pi.status = 'Pending'
          LIMIT 1
        `
      : await this.prisma.$queryRaw<any[]>`
          SELECT
            pi.id,
            pi.project_id AS projectId,
            p.name AS projectName,
            pi.email,
            pi.role,
            pi.token,
            pi.status,
            pi.expires_at AS expiresAt
          FROM project_invitations pi
          JOIN projects p ON p.id = pi.project_id
          WHERE pi.email = ${normalizedEmail}
            AND pi.status = 'Pending'
            AND pi.expires_at > CURRENT_TIMESTAMP
        `;

    const accepted: { projectId: string; projectName: string; role: string }[] = [];
    for (const invitation of invitations) {
      if (new Date(invitation.expiresAt).getTime() < Date.now()) {
        await this.markInvitationExpired(invitation.id);
        continue;
      }
      await this.addMemberFromInvitation(invitation, userId);
      await this.markInvitationAccepted(invitation.id);
      accepted.push({
        projectId: invitation.projectId,
        projectName: invitation.projectName,
        role: invitation.role,
      });
    }
    return accepted;
  }

  async update(
    userId: string,
    projectId: string,
    memberId: string,
    dto: UpdateProjectMemberDto,
  ) {
    await this.projectAccess.ensurePermission(userId, projectId, 'team.member.update');
    const member = await this.findMember(projectId, memberId);
    const role =
      dto.role !== undefined
        ? await this.projectAccess.ensureAssignableRole(projectId, dto.role?.trim())
        : member.role;
    const status =
      dto.status !== undefined ? this.normalizeStatus(dto.status) : member.status;
    await this.prisma.$executeRaw`
      UPDATE project_members
      SET role = ${role},
          status = ${status}
      WHERE id = ${memberId}
        AND project_id = ${projectId}
    `;
    return this.list(userId, projectId);
  }

  async remove(userId: string, projectId: string, memberId: string) {
    await this.projectAccess.ensurePermission(userId, projectId, 'team.member.remove');
    await this.findMember(projectId, memberId);
    await this.prisma.$executeRaw`
      DELETE FROM project_members
      WHERE id = ${memberId}
        AND project_id = ${projectId}
    `;
    return ok({ success: true }, '移除项目成员成功');
  }

  async revokeInvitation(userId: string, projectId: string, invitationId: string) {
    await this.projectAccess.ensurePermission(userId, projectId, 'team.invitation.revoke');
    await this.findInvitationById(projectId, invitationId);
    await this.prisma.$executeRaw`
      UPDATE project_invitations
      SET status = 'Revoked'
      WHERE id = ${invitationId}
        AND project_id = ${projectId}
        AND status = 'Pending'
    `;
    return this.list(userId, projectId);
  }

  async rolePermissions(userId: string, projectId: string) {
    return ok(
      await this.projectAccess.getRolePermissions(userId, projectId),
      '获取角色权限成功',
    );
  }

  async updateRolePermissions(
    userId: string,
    projectId: string,
    dto: UpdateRolePermissionsDto,
  ) {
    return ok(
      await this.projectAccess.updateRolePermissions(
        userId,
        projectId,
        dto.permissions || {},
      ),
      '保存角色权限成功',
    );
  }

  async roles(userId: string, projectId: string) {
    return ok(
      await this.projectAccess.listRoleDefinitions(userId, projectId),
      '获取项目角色成功',
    );
  }

  async createRole(userId: string, projectId: string, dto: CreateProjectRoleDto) {
    return ok(
      await this.projectAccess.createRole(userId, projectId, dto),
      '创建项目角色成功',
    );
  }

  async copyRole(userId: string, projectId: string, roleKey: string) {
    return ok(
      await this.projectAccess.copyRole(userId, projectId, roleKey),
      '复制项目角色成功',
    );
  }

  async updateRole(
    userId: string,
    projectId: string,
    roleKey: string,
    dto: UpdateProjectRoleDto,
  ) {
    return ok(
      await this.projectAccess.updateRole(userId, projectId, roleKey, dto),
      '更新项目角色成功',
    );
  }

  async deleteRole(userId: string, projectId: string, roleKey: string) {
    return ok(
      await this.projectAccess.deleteRole(userId, projectId, roleKey),
      '删除项目角色成功',
    );
  }

  private async findMember(projectId: string, memberId: string) {
    const rows = await this.prisma.$queryRaw<{ id: string; role: string; status: string }[]>`
      SELECT id, role, status
      FROM project_members
      WHERE id = ${memberId}
        AND project_id = ${projectId}
      LIMIT 1
    `;
    const member = rows[0];
    if (!member) {
      throw new NotFoundException('Project member not found');
    }
    return member;
  }

  private async listInvitations(projectId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        pi.id,
        pi.project_id AS projectId,
        p.name AS projectName,
        pi.email,
        pi.role,
        pi.token,
        pi.status,
        pi.expires_at AS expiresAt,
        pi.accepted_at AS acceptedAt,
        pi.created_at AS createdAt,
        pi.updated_at AS updatedAt,
        COALESCE(NULLIF(owner.company, ''), p.name) AS organizationName,
        u.email AS invitedByEmail,
        u.username AS invitedByName
      FROM project_invitations pi
      JOIN projects p ON p.id = pi.project_id
      JOIN users owner ON owner.id = p.owner_id
      JOIN users u ON u.id = pi.invited_by_id
      WHERE pi.project_id = ${projectId}
        AND pi.status = 'Pending'
      ORDER BY pi.created_at DESC
    `;
    return rows.map((row) => this.toInvitation(row));
  }

  private async findInvitationById(projectId: string, invitationId: string) {
    const rows = await this.invitationRows('id', invitationId, projectId);
    const invitation = rows[0];
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    return invitation;
  }

  private async findInvitationByToken(token: string) {
    const rows = await this.invitationRows('token', token);
    const invitation = rows[0];
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    return invitation;
  }

  private async invitationRows(by: 'id' | 'token', value: string, projectId?: string) {
    if (by === 'id') {
      return this.prisma.$queryRaw<any[]>`
        SELECT
          pi.id,
          pi.project_id AS projectId,
          p.name AS projectName,
          pi.email,
          pi.role,
          pi.token,
          pi.status,
          pi.expires_at AS expiresAt,
          pi.accepted_at AS acceptedAt,
          pi.created_at AS createdAt,
          pi.updated_at AS updatedAt,
          COALESCE(NULLIF(owner.company, ''), p.name) AS organizationName,
          u.email AS invitedByEmail,
          u.username AS invitedByName
        FROM project_invitations pi
        JOIN projects p ON p.id = pi.project_id
        JOIN users owner ON owner.id = p.owner_id
        JOIN users u ON u.id = pi.invited_by_id
        WHERE pi.id = ${value}
          AND pi.project_id = ${projectId}
        LIMIT 1
      `;
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT
        pi.id,
        pi.project_id AS projectId,
        p.name AS projectName,
        pi.email,
        pi.role,
        pi.token,
        pi.status,
        pi.expires_at AS expiresAt,
        pi.accepted_at AS acceptedAt,
        pi.created_at AS createdAt,
        pi.updated_at AS updatedAt,
        COALESCE(NULLIF(owner.company, ''), p.name) AS organizationName,
        u.email AS invitedByEmail,
        u.username AS invitedByName
      FROM project_invitations pi
      JOIN projects p ON p.id = pi.project_id
      JOIN users owner ON owner.id = p.owner_id
      JOIN users u ON u.id = pi.invited_by_id
      WHERE pi.token = ${value}
      LIMIT 1
    `;
  }

  private async addMemberFromInvitation(invitation: any, userId: string) {
    const existing = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM project_members
      WHERE project_id = ${invitation.projectId}
        AND user_id = ${userId}
      LIMIT 1
    `;
    if (existing.length > 0) return;
    await this.prisma.$executeRaw`
      INSERT INTO project_members (id, project_id, user_id, role, status)
      VALUES (${generateId('pm')}, ${invitation.projectId}, ${userId}, ${invitation.role}, 'Active')
    `;
  }

  private async ensureInvitationCanBeAccepted(invitation: any) {
    if (invitation.status !== 'Pending') {
      throw new BadRequestException('Invitation is not pending');
    }
    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      await this.markInvitationExpired(invitation.id);
      throw new BadRequestException('Invitation has expired');
    }
  }

  private async markInvitationAccepted(invitationId: string) {
    await this.prisma.$executeRaw`
      UPDATE project_invitations
      SET status = 'Accepted',
          accepted_at = CURRENT_TIMESTAMP
      WHERE id = ${invitationId}
    `;
  }

  private async markInvitationExpired(invitationId: string) {
    await this.prisma.$executeRaw`
      UPDATE project_invitations
      SET status = 'Expired'
      WHERE id = ${invitationId}
        AND status = 'Pending'
    `;
  }

  private normalizeStatus(status?: string) {
    const normalized = status?.trim();
    if (!normalized || !MEMBER_STATUSES.includes(normalized)) {
      throw new BadRequestException('status must be Active or Inactive');
    }
    return normalized;
  }

  private toOwnerMember(owner: {
    id: string;
    email: string;
    username: string | null;
    company: string | null;
  }) {
    return {
      id: `owner:${owner.id}`,
      userId: owner.id,
      name: owner.username || owner.email.split('@')[0],
      email: owner.email,
      company: owner.company,
      role: 'Owner',
      status: 'Active',
      isOwner: true,
    };
  }

  private toMember(member: {
    id: string;
    userId: string;
    email: string;
    username: string | null;
    company: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: member.id,
      userId: member.userId,
      name: member.username || member.email.split('@')[0],
      email: member.email,
      company: member.company,
      role: member.role,
      status: member.status,
      isOwner: false,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    };
  }

  private toInvitation(invitation: any) {
    const inviteLink = this.inviteLink(invitation.token);
    return {
      id: invitation.id,
      projectId: invitation.projectId,
      projectName: invitation.projectName,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      organizationName: invitation.organizationName || invitation.projectName,
      token: invitation.token,
      inviteLink,
      inviteMessage: this.inviteMessage(invitation),
      invitedByEmail: invitation.invitedByEmail,
      invitedByName: invitation.invitedByName || invitation.invitedByEmail,
      expiresAt: invitation.expiresAt.toISOString(),
      acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
      createdAt: invitation.createdAt.toISOString(),
      updatedAt: invitation.updatedAt.toISOString(),
    };
  }

  private toInvitationDetail(invitation: any) {
    return {
      projectId: invitation.projectId,
      projectName: invitation.projectName,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      organizationName: invitation.organizationName || invitation.projectName,
      invitedByEmail: invitation.invitedByEmail,
      invitedByName: invitation.invitedByName || invitation.invitedByEmail,
      expiresAt: invitation.expiresAt.toISOString(),
    };
  }

  private inviteLink(token: string) {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    return `${baseUrl.replace(/\/$/, '')}/?invite=${encodeURIComponent(token)}`;
  }

  private inviteMessage(invitation: any) {
    return `MockHub 项目邀请：${invitation.invitedByName || invitation.invitedByEmail} 邀请你以 ${invitation.role} 角色加入「${invitation.projectName}」。打开链接接受邀请：${this.inviteLink(invitation.token)}`;
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
