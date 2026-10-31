import { Response } from 'express';
import prisma from '../config/prisma.js';
import { taskSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { getTasksForPackage } from '../utils/taskTemplates.js';
import { Prisma } from '@prisma/client';

export const getWeddingTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, category, status, priority, assigneeId } = req.query;

  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId query parameter is required' });
    return;
  }

  const where: Prisma.WeddingTaskWhereInput = {
    weddingId: String(weddingId),
  };

  if (category) where.category = category as any;
  if (status) where.status = status as any;
  if (priority) where.priority = priority as any;
  if (assigneeId) where.assignedEmployeeId = String(assigneeId);

  const tasks = await prisma.weddingTask.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { dueDate: 'asc' }],
    include: {
      assignedEmployee: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  // Calculate task statistics
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const toPlan = tasks.filter((t) => t.status === 'TO_PLAN').length;
  const blocked = tasks.filter((t) => t.status === 'BLOCKED').length;
  const review = tasks.filter((t) => t.status === 'REVIEW').length;
  const overdue = tasks.filter((t) => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length;

  res.json({
    success: true,
    data: {
      tasks,
      stats: {
        total,
        done,
        inProgress,
        toPlan,
        blocked,
        review,
        overdue,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      },
    },
  });
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = taskSchema.parse(req.body);

  const task = await prisma.weddingTask.create({
    data: {
      weddingId: data.weddingId,
      taskName: data.taskName,
      description: data.description,
      category: data.category,
      assignedEmployeeId: data.assignedEmployeeId,
      priority: data.priority,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: new Date(data.dueDate),
      status: data.status,
      notes: data.notes,
      isTemplateGenerated: false,
    },
    include: {
      assignedEmployee: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.status(201).json({ success: true, data: { task } });
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = taskSchema.partial().parse(req.body);

  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.status === 'DONE') {
    updateData.completionTimestamp = new Date();
  }

  const task = await prisma.weddingTask.update({
    where: { id },
    data: updateData,
    include: {
      assignedEmployee: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.json({ success: true, data: { task } });
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ success: false, message: 'Status is required' });
    return;
  }

  const updateData: any = { status };
  if (status === 'DONE') {
    updateData.completionTimestamp = new Date();
  } else {
    updateData.completionTimestamp = null;
  }

  const task = await prisma.weddingTask.update({
    where: { id },
    data: updateData,
  });

  res.json({ success: true, data: { task } });
};

/**
 * Idempotent Automatic Wedding Task Generation
 */
export const generateWeddingTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.params;

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  // Idempotency check: see if template tasks already exist for this wedding
  const existingCount = await prisma.weddingTask.count({
    where: { weddingId, isTemplateGenerated: true },
  });

  if (existingCount > 0) {
    res.status(400).json({
      success: false,
      message: `Wedding already has ${existingCount} template-generated tasks. Generation is idempotent to prevent duplicates.`,
    });
    return;
  }

  const templateTasks = getTasksForPackage(wedding.packageType, wedding.startDate);

  // Assign to default planner if available
  const plannerId = wedding.assignedPlannerId || req.user?.id;

  const tasksToCreate = templateTasks.map((t) => ({
    ...t,
    weddingId: wedding.id,
    assignedEmployeeId: plannerId,
  }));

  await prisma.weddingTask.createMany({
    data: tasksToCreate,
  });

  const createdTasks = await prisma.weddingTask.findMany({
    where: { weddingId: wedding.id },
    orderBy: { sortOrder: 'asc' },
  });

  res.status(201).json({
    success: true,
    message: `Generated ${createdTasks.length} wedding tasks successfully for ${wedding.packageType} package.`,
    data: {
      count: createdTasks.length,
      tasks: createdTasks,
    },
  });
};
