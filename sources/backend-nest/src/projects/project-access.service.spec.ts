import { ForbiddenException, NotFoundException } from '@nestjs/common';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { ProjectAccessService } from './project-access.service';

describe('ProjectAccessService', () => {
  const defaultRoles = [
    { roleKey: 'Owner', name: 'Owner', description: null, systemRole: 1, locked: 1, sortOrder: 10 },
    { roleKey: 'Admin', name: 'Admin', description: null, systemRole: 1, locked: 0, sortOrder: 20 },
    { roleKey: 'Editor', name: 'Editor', description: null, systemRole: 1, locked: 0, sortOrder: 30 },
    { roleKey: 'Viewer', name: 'Viewer', description: null, systemRole: 1, locked: 0, sortOrder: 40 },
  ];

  const createService = (queryResults: any[][]) => {
    const prisma = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };
    queryResults.forEach((result) => prisma.$queryRaw.mockResolvedValueOnce(result));
    prisma.$queryRaw.mockResolvedValue([]);
    return {
      prisma,
      service: new ProjectAccessService(prisma as any),
    };
  };

  it('returns Owner access for project owner', async () => {
    const { service } = createService([
      [
        {
          id: 'project-1',
          name: 'Project',
          ownerId: 'user-1',
          proxyUrl: null,
          memberRole: null,
          memberStatus: null,
        },
      ],
    ]);

    await expect(service.getAccess('user-1', 'project-1')).resolves.toMatchObject({
      role: 'Owner',
      project: { id: 'project-1', ownerId: 'user-1' },
    });
  });

  it('returns member role for active member', async () => {
    const { service } = createService([
      [
        {
          id: 'project-1',
          name: 'Project',
          ownerId: 'owner-1',
          proxyUrl: null,
          memberRole: 'Editor',
          memberStatus: 'Active',
        },
      ],
    ]);

    await expect(service.getAccess('user-1', 'project-1')).resolves.toMatchObject({
      role: 'Editor',
    });
  });

  it('blocks inactive members as not found', async () => {
    const { service } = createService([
      [
        {
          id: 'project-1',
          name: 'Project',
          ownerId: 'owner-1',
          proxyUrl: null,
          memberRole: 'Editor',
          memberStatus: 'Inactive',
        },
      ],
    ]);

    await expect(service.getAccess('user-1', 'project-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('enforces minimum role rank', async () => {
    const { service } = createService([
      [
        {
          id: 'project-1',
          name: 'Project',
          ownerId: 'owner-1',
          proxyUrl: null,
          memberRole: 'Viewer',
          memberStatus: 'Active',
        },
      ],
    ]);

    await expect(service.ensureAtLeast('user-1', 'project-1', 'Editor')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('uses default permissions when project has no custom role permissions', async () => {
    const { service } = createService([
      [
        {
          id: 'project-1',
          name: 'Project',
          ownerId: 'owner-1',
          proxyUrl: null,
          memberRole: 'Editor',
          memberStatus: 'Active',
        },
      ],
      defaultRoles,
      [],
      defaultRoles,
      defaultRoles,
    ]);

    await expect(
      service.ensurePermission('user-1', 'project-1', 'api.update'),
    ).resolves.toMatchObject({ role: 'Editor' });
  });

  it('blocks permission missing from custom role permissions', async () => {
    const { service } = createService([
      [
        {
          id: 'project-1',
          name: 'Project',
          ownerId: 'owner-1',
          proxyUrl: null,
          memberRole: 'Editor',
          memberStatus: 'Active',
        },
      ],
      defaultRoles,
      [{ role: 'Editor', permissionKey: 'api.view', enabled: 1 }],
      defaultRoles,
      defaultRoles,
    ]);

    await expect(
      service.ensurePermission('user-1', 'project-1', 'api.update'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
