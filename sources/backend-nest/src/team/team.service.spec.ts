jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { TeamService } from './team.service';

jest.mock('../auth/auth.util', () => ({
  generateId: (prefix = 'id') => `${prefix}_test`,
  generateToken: () => 'token_test',
}));

describe('TeamService invitations', () => {
  const createService = (queryResults: any[][] = []) => {
    const prisma = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };
    queryResults.forEach((result) => prisma.$queryRaw.mockResolvedValueOnce(result));
    const projectAccess = {
      getAccess: jest.fn().mockResolvedValue({
        role: 'Owner',
        project: { id: 'project-1', ownerId: 'owner-1', name: 'Project' },
      }),
      ensurePermission: jest.fn().mockResolvedValue({
        role: 'Owner',
        project: { id: 'project-1', ownerId: 'owner-1', name: 'Project' },
      }),
      ensureAssignableRole: jest.fn().mockImplementation(async (_projectId, role) => role),
      getRolePermissions: jest.fn().mockResolvedValue({
        currentUserRole: 'Owner',
        permissions: { Owner: [], Admin: [], Editor: [], Viewer: [] },
        permissionKeys: [],
        editableRoles: ['Admin', 'Editor', 'Viewer'],
      }),
      updateRolePermissions: jest.fn().mockResolvedValue({
        currentUserRole: 'Owner',
        permissions: { Owner: [], Admin: [], Editor: [], Viewer: [] },
        permissionKeys: [],
        editableRoles: ['Admin', 'Editor', 'Viewer'],
      }),
    };
    return {
      prisma,
      projectAccess,
      service: new TeamService(prisma as any, projectAccess as any),
    };
  };

  it('creates pending invitation for unregistered email', async () => {
    const invitationRow = {
      id: 'inv-1',
      projectId: 'project-1',
      projectName: 'Project',
      organizationName: 'Owner Co',
      email: 'new@example.com',
      role: 'Editor',
      token: 'inv_token_test',
      status: 'Pending',
      invitedByEmail: 'owner@example.com',
      invitedByName: 'Owner',
      expiresAt: new Date('2030-01-01T00:00:00Z'),
      acceptedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
    const { service, prisma } = createService([
      [],
      [],
      [invitationRow],
      [{ id: 'owner-1', email: 'owner@example.com', username: 'Owner', company: null }],
      [],
      [invitationRow],
    ]);

    const result = await service.add('owner-1', 'project-1', {
      email: 'new@example.com',
      role: 'Editor',
    });

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(result.data.invitation.email).toBe('new@example.com');
    expect(result.data.inviteMessage).toContain('Project');
  });

  it('returns editable role permissions', async () => {
    const { service, projectAccess } = createService();

    const result = await service.rolePermissions('owner-1', 'project-1');

    expect(projectAccess.getRolePermissions).toHaveBeenCalledWith('owner-1', 'project-1');
    expect(result.data.editableRoles).toEqual(['Admin', 'Editor', 'Viewer']);
  });

  it('accepts pending invitation for registered user', async () => {
    const invitationRow = {
      id: 'inv-1',
      projectId: 'project-1',
      projectName: 'Project',
      organizationName: 'Owner Co',
      email: 'new@example.com',
      role: 'Viewer',
      token: 'inv_token_test',
      status: 'Pending',
      expiresAt: new Date('2030-01-01T00:00:00Z'),
    };
    const { service, prisma } = createService([[invitationRow], []]);

    const accepted = await service.acceptPendingForUser(
      'user-1',
      'new@example.com',
      'inv_token_test',
    );

    expect(accepted).toEqual([
      { projectId: 'project-1', projectName: 'Project', role: 'Viewer' },
    ]);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it('uses invitation email and organization as registration context', async () => {
    const invitationRow = {
      id: 'inv-1',
      projectId: 'project-1',
      projectName: 'Project',
      organizationName: 'Owner Co',
      email: 'new@example.com',
      role: 'Viewer',
      token: 'inv_token_test',
      status: 'Pending',
      invitedByEmail: 'owner@example.com',
      invitedByName: 'Owner',
      expiresAt: new Date('2030-01-01T00:00:00Z'),
    };
    const { service } = createService([[invitationRow]]);

    await expect(service.registrationContext('inv_token_test')).resolves.toEqual({
      email: 'new@example.com',
      company: 'Owner Co',
    });
  });
});
