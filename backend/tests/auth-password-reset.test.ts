import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'crypto';
import type { Request, Response } from 'express';

const { prismaMock, assertMailerMock, sendEmailMock, txMock, disconnectUserSocketsMock } = vi.hoisted(() => {
  const tx = {
    passwordResetToken: {
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  };
  return {
    txMock: tx,
    prismaMock: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      passwordResetToken: {
        create: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        findFirst: vi.fn(),
      },
      $transaction: vi.fn((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
    },
    assertMailerMock: vi.fn(),
    sendEmailMock: vi.fn(),
    disconnectUserSocketsMock: vi.fn(),
  };
});

vi.mock('../src/config/prisma.js', () => ({ default: prismaMock }));
vi.mock('../src/socket.js', () => ({
  disconnectUserSockets: disconnectUserSocketsMock,
}));
vi.mock('../src/utils/passwordResetEmail.js', () => ({
  assertPasswordResetEmailConfigured: assertMailerMock,
  sendPasswordResetEmail: sendEmailMock,
}));

import { forgotPassword, register, resetPassword } from '../src/controllers/auth.controller.js';

const createResponse = () => {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return response as unknown as Response & typeof response;
};

const resetRequest = (token: string, password = 'NewRoyalPassword!2026') =>
  ({ body: { token, password } }) as Request;

describe('registration and password reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = 'smtp.example.test';
    process.env.SMTP_FROM = 'The Royal Knot <no-reply@example.test>';
    process.env.FRONTEND_URL = 'https://royalknot.example.test';
    process.env.JWT_SECRET = 'averysecurejwtsecretforroyalknot2026test';
    prismaMock.$transaction.mockImplementation((callback) => callback(txMock));
  });

  it('creates a client account and immediately signs them in', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'newclient@example.com',
      firstName: 'Aarav',
      lastName: 'Kapoor',
      phone: '+91 98765 43210',
      role: 'CLIENT',
      isActive: true,
      tokenVersion: 0,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashed-password',
    });
    const response = createResponse();

    await register({
      body: {
        firstName: 'Aarav',
        lastName: 'Kapoor',
        email: ' NEWCLIENT@example.com ',
        phone: '+91 98765 43210',
        password: 'RoyalKnot@2026',
      },
    } as Request, response);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newclient@example.com' },
      select: { id: true },
    });
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: 'newclient@example.com',
        role: 'CLIENT',
      }),
    }));
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        user: expect.objectContaining({ email: 'newclient@example.com' }),
      }),
    }));
  });

  it('returns the same generic response for an unknown account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const response = createResponse();

    await forgotPassword({ body: { email: 'unknown@example.test' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(202);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      message: 'If an active account exists, we processed the request. Email delivery is not confirmed by this response.',
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('stores only the SHA-256 token hash and sends the raw token by email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-id', firstName: 'Aarav', isActive: true });
    prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'reset-id' });
    let emailedToken = '';
    sendEmailMock.mockImplementation(async ({ resetToken }: { resetToken: string }) => {
      emailedToken = resetToken;
    });
    const response = createResponse();

    await forgotPassword({ body: { email: ' AARAV@example.test ' } } as Request, response);

    const storedHash = prismaMock.passwordResetToken.create.mock.calls[0][0].data.tokenHash;
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/);
    expect(storedHash).toBe(createHash('sha256').update(emailedToken).digest('hex'));
    expect(emailedToken).toHaveLength(43);
    const expiresAt = prismaMock.passwordResetToken.create.mock.calls[0][0].data.expiresAt as Date;
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'aarav@example.test' },
      select: { id: true, firstName: true, isActive: true },
    });
    expect(sendEmailMock).toHaveBeenCalledOnce();
    expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-id', id: { not: 'reset-id' } },
    });
    expect(response.status).toHaveBeenCalledWith(202);
  });

  it('rejects expired or unknown reset tokens without changing the user', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);
    const response = createResponse();

    await resetPassword(resetRequest('a'.repeat(43)), response);

    expect(prismaMock.passwordResetToken.findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: createHash('sha256').update('a'.repeat(43)).digest('hex'),
        usedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      select: { id: true, userId: true, user: { select: { isActive: true } } },
    });
    expect(response.status).toHaveBeenCalledWith(400);
    expect(txMock.user.update).not.toHaveBeenCalled();
  });

  it('consumes a valid token once and invalidates outstanding sessions', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue({
      id: 'reset-id',
      userId: 'user-id',
      user: { isActive: true },
    });
    txMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    txMock.user.update.mockResolvedValue({});
    txMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
    const response = createResponse();

    await resetPassword(resetRequest('b'.repeat(43)), response);

    expect(txMock.passwordResetToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'reset-id', usedAt: null, expiresAt: { gt: expect.any(Date) } },
    }));
    expect(txMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user-id' },
      data: expect.objectContaining({ tokenVersion: { increment: 1 } }),
    }));
    expect(txMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-id', id: { not: 'reset-id' } },
    });
    expect(disconnectUserSocketsMock).toHaveBeenCalledTimes(1);
    expect(disconnectUserSocketsMock).toHaveBeenCalledWith('user-id');
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.',
    });
  });

  it('does not apply the reset if another request already consumed the token', async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue({
      id: 'reset-id',
      userId: 'user-id',
      user: { isActive: true },
    });
    txMock.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
    const response = createResponse();

    await resetPassword(resetRequest('c'.repeat(43)), response);

    expect(txMock.user.update).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('rejects passwords that do not meet the minimum strength policy', async () => {
    await expect(resetPassword(resetRequest('d'.repeat(43), 'weakpass'), createResponse())).rejects.toThrow();
    expect(prismaMock.passwordResetToken.findFirst).not.toHaveBeenCalled();
  });
});
