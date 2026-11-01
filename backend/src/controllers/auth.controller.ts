import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import prisma from '../config/prisma.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { assertPasswordResetEmailConfigured, sendPasswordResetEmail } from '../utils/passwordResetEmail.js';
import { getJwtSecret } from '../utils/jwtSecret.js';
import { disconnectUserSockets } from '../socket.js';

const passwordResetRequestMessage = 'If an active account exists, we processed the request. Email delivery is not confirmed by this response.';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials or inactive account',
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword,
    },
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, phone } = registerSchema.parse(req.body);
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      role: 'CLIENT',
      passwordHash,
    },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...userWithoutPassword } = user;

  res.status(201).json({
    success: true,
    data: {
      token,
      user: userWithoutPassword,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = forgotPasswordSchema.parse(req.body);

  try {
    assertPasswordResetEmailConfigured();
  } catch (error) {
    console.error('[Password Reset] Email service configuration error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(503).json({
      success: false,
      message: 'Password reset email is temporarily unavailable. Please try again later.',
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, isActive: true },
  });

  if (!user || !user.isActive) {
    res.status(202).json({
      success: true,
      message: passwordResetRequestMessage,
    });
    return;
  }

  const resetToken = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(resetToken).digest('hex');
  const tokenRecord = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetEmail({ email, firstName: user.firstName, resetToken });
  } catch (error) {
    try {
      await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
    } catch (cleanupError) {
      console.error('[Password Reset] Could not remove undelivered token:', cleanupError instanceof Error ? cleanupError.name : 'Unknown error');
    }
    const deliveryReason = error instanceof Error && 'code' in error && typeof error.code === 'string'
      ? error.code
      : error instanceof Error
        ? error.name
        : 'Unknown error';
    console.error('[Password Reset] Email delivery failed:', deliveryReason);
    res.status(202).json({
      success: true,
      message: passwordResetRequestMessage,
    });
    return;
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, id: { not: tokenRecord.id } },
  });
  res.status(202).json({
    success: true,
    message: passwordResetRequestMessage,
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = new Date();
  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
    select: { id: true, userId: true, user: { select: { isActive: true } } },
  });

  if (!resetRecord || !resetRecord.user.isActive) {
    res.status(400).json({ success: false, message: 'This password reset link is invalid or expired.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const resetAt = new Date();
  const resetApplied = await prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: resetRecord.id, usedAt: null, expiresAt: { gt: resetAt } },
      data: { usedAt: resetAt },
    });
    if (claimed.count !== 1) return false;

    await tx.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    await tx.passwordResetToken.deleteMany({
      where: { userId: resetRecord.userId, id: { not: resetRecord.id } },
    });
    return true;
  });

  if (!resetApplied) {
    res.status(400).json({ success: false, message: 'This password reset link is invalid or expired.' });
    return;
  }

  disconnectUserSockets(resetRecord.userId);
  res.json({ success: true, message: 'Password reset successfully. Please sign in with your new password.' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
