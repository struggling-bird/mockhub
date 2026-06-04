jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('./auth.util', () => ({
  generateId: () => 'u_test',
  generateToken: () => 'token_test',
  hashPassword: () => 'hashed_password',
  verifyPassword: jest.fn(),
}));

import { AuthService } from './auth.service';

describe('AuthService register', () => {
  it('creates invited user through raw SQL with invitation context', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $executeRaw: jest.fn().mockResolvedValue(undefined),
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: 'u_test',
          email: 'invited@example.com',
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      ]),
    };
    const redis = {
      set: jest.fn().mockResolvedValue(undefined),
    };
    const teamService = {
      registrationContext: jest.fn().mockResolvedValue({
        email: 'invited@example.com',
        company: 'Owner Co',
      }),
      acceptPendingForUser: jest.fn().mockResolvedValue([
        { projectId: 'project-1', projectName: 'Project', role: 'Editor' },
      ]),
    };
    const service = new AuthService(prisma as any, redis as any, teamService as any);

    const result = await service.register({
      email: 'tampered@example.com',
      password: 'password',
      username: 'Invited',
      company: 'Tampered Co',
      inviteToken: 'inv_token',
    });

    expect(teamService.registrationContext).toHaveBeenCalledWith('inv_token');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'invited@example.com' },
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(teamService.acceptPendingForUser).toHaveBeenCalledWith(
      'u_test',
      'invited@example.com',
      'inv_token',
    );
    expect(result.data.user.email).toBe('invited@example.com');
    expect(result.data.acceptedInvitations).toHaveLength(1);
  });
});
