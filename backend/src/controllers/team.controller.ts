import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';
import { differenceInHours } from 'date-fns';

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  const employees = await prisma.user.findMany({
    where: {
      role: { in: ['FOUNDER', 'PLANNER', 'FINANCE', 'FIELD_COORDINATOR'] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      employee: true,
      _count: {
        select: {
          assignedWeddings: true,
          assignedTasks: true,
        },
      },
    },
    orderBy: { firstName: 'asc' },
  });

  res.json({ success: true, data: { employees } });
};

export const createTimeLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, employeeId, taskId, startTime, endTime, hourlyRate, notes } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = differenceInHours(end, start) || 1;

  const empUser = await prisma.employee.findUnique({
    where: { userId: employeeId || req.user?.id },
  });

  const rate = hourlyRate ? new Prisma.Decimal(hourlyRate) : empUser?.hourlyRate || new Prisma.Decimal(500);
  const hoursDecimal = new Prisma.Decimal(hours);
  const calculatedLabourCost = hoursDecimal.mul(rate);

  const log = await prisma.employeeTimeLog.create({
    data: {
      weddingId,
      employeeId: employeeId || req.user?.id,
      taskId: taskId || null,
      startTime: start,
      endTime: end,
      hoursWorked: hoursDecimal,
      hourlyRate: rate,
      calculatedLabourCost,
      isApproved: true, // Auto-approve or manager approval
      approvedById: req.user?.id,
      notes,
    },
    include: {
      employee: { select: { firstName: true, lastName: true } },
      task: { select: { taskName: true } },
    },
  });

  res.status(201).json({ success: true, data: { log } });
};

export const getTimeLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, employeeId } = req.query;

  const where: Prisma.EmployeeTimeLogWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);
  if (employeeId) where.employeeId = String(employeeId);

  const logs = await prisma.employeeTimeLog.findMany({
    where,
    orderBy: { startTime: 'desc' },
    include: {
      employee: { select: { firstName: true, lastName: true, role: true } },
      task: { select: { taskName: true } },
      wedding: { select: { weddingCode: true, name: true } },
    },
  });

  res.json({ success: true, data: { logs } });
};
