import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createTransportMock, sendMailMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  sendMailMock: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport: createTransportMock },
}));

import { assertPasswordResetEmailConfigured, sendPasswordResetEmail } from '../src/utils/passwordResetEmail.js';

describe('password reset SMTP delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_PASSWORD;
    process.env.SMTP_HOST = 'smtp.example.test';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_FROM = 'The Royal Knot <no-reply@example.test>';
    process.env.SMTP_USER = 'smtp-user';
    process.env.SMTP_PASSWORD = 'smtp-password';
    process.env.FRONTEND_URL = 'https://royalknot.example.test';
    sendMailMock.mockResolvedValue({ accepted: ['client@example.test'] });
    createTransportMock.mockReturnValue({ sendMail: sendMailMock });
  });

  it('requires SMTP settings and a frontend URL before processing a request', () => {
    delete process.env.SMTP_HOST;
    expect(() => assertPasswordResetEmailConfigured()).toThrow('not configured');
  });

  it('sends an expiring branded reset link and escapes recipient data', async () => {
    await sendPasswordResetEmail({
      email: 'client@example.test',
      firstName: '<Aarav>',
      resetToken: 'secure-one-time-token',
    });

    expect(createTransportMock).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.example.test',
      port: 587,
      secure: false,
      auth: { user: 'smtp-user', pass: 'smtp-password' },
    }));
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'client@example.test',
      subject: 'Reset your Royal Knot password',
      text: expect.stringContaining('within 15 minutes'),
      html: expect.stringContaining('Hello &lt;Aarav&gt;'),
    }));
    expect(sendMailMock.mock.calls[0][0].html).toContain('token=secure-one-time-token');
  });

  it('accepts the legacy SMTP_PASS environment variable as an alias', async () => {
    delete process.env.SMTP_PASSWORD;
    process.env.SMTP_PASS = 'legacy-password';

    await sendPasswordResetEmail({
      email: 'client@example.test',
      firstName: 'Aarav',
      resetToken: 'secure-one-time-token',
    });

    expect(createTransportMock).toHaveBeenCalledWith(expect.objectContaining({
      auth: { user: 'smtp-user', pass: 'legacy-password' },
    }));
  });

  it('fails delivery when the SMTP provider does not accept the recipient', async () => {
    sendMailMock.mockResolvedValue({ accepted: [], rejected: ['client@example.test'] });

    await expect(sendPasswordResetEmail({
      email: 'client@example.test',
      firstName: 'Aarav',
      resetToken: 'secure-one-time-token',
    })).rejects.toThrow('did not accept');
  });
});
