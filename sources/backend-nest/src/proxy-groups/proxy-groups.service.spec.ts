jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../auth/auth.util', () => ({
  generateId: () => 'pg_test',
}));

import { BadRequestException } from '@nestjs/common';
import { ProxyGroupsService } from './proxy-groups.service';

describe('ProxyGroupsService', () => {
  const createService = (queryResults: any[][] = []) => {
    const prisma = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };
    queryResults.forEach((result) => prisma.$queryRaw.mockResolvedValueOnce(result));
    prisma.$queryRaw.mockResolvedValue([]);
    const projectAccess = {
      ensurePermission: jest.fn().mockResolvedValue({ role: 'Owner' }),
    };
    return {
      prisma,
      projectAccess,
      service: new ProxyGroupsService(prisma as any, projectAccess as any),
    };
  };

  it('creates proxy group after permission check and regex validation', async () => {
    const row = {
      id: 'pg_test',
      projectId: 'project-1',
      name: 'User APIs',
      regex: '^/api/users',
      mode: 'Hybrid',
      targetUrl: 'https://api.example.com',
      priority: 10,
      enabled: 1,
      autoCapture: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
    const { service, prisma, projectAccess } = createService([[row]]);

    const result = await service.create('user-1', 'project-1', {
      name: 'User APIs',
      regex: '^/api/users',
      mode: 'Hybrid',
      targetUrl: 'https://api.example.com',
      priority: 10,
      enabled: true,
      autoCapture: true,
    });

    expect(projectAccess.ensurePermission).toHaveBeenCalledWith('user-1', 'project-1', 'api.update');
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(result.data[0].mode).toBe('Hybrid');
  });

  it('rejects invalid regex', async () => {
    const { service } = createService();

    await expect(
      service.create('user-1', 'project-1', {
        name: 'Broken',
        regex: '[',
        mode: 'Proxy',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
