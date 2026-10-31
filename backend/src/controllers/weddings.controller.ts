import { Response } from 'express';
import prisma from '../config/prisma.js';
import { weddingSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

export const getWeddings = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, status, location, packageType, page = '1', limit = '50' } = req.query;

  const where: Prisma.WeddingWhereInput = {};

  // Role isolation
  if (req.user?.role === 'CLIENT') {
    const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
    if (!client) {
      res.json({ success: true, data: { weddings: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } } });
      return;
    }
    where.clientId = client.id;
  } else if (req.user?.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) {
      res.json({ success: true, data: { weddings: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } } });
      return;
    }
    where.OR = [
      { vendorBookings: { some: { vendorId: vendor.id } } },
      { quotations: { some: { vendorId: vendor.id } } },
    ];
  }

  if (search) {
    const s = String(search);
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { weddingCode: { contains: s, mode: 'insensitive' } },
      { location: { contains: s, mode: 'insensitive' } },
      { client: { partner1Name: { contains: s, mode: 'insensitive' } } },
      { client: { partner2Name: { contains: s, mode: 'insensitive' } } },
    ];
  }

  if (status) where.status = status as any;
  if (location) where.location = { contains: String(location), mode: 'insensitive' };
  if (packageType) where.packageType = packageType as any;

  const pageNum = parseInt(String(page), 10) || 1;
  const take = parseInt(String(limit), 10) || 50;
  const skip = (pageNum - 1) * take;

  const [total, weddings] = await Promise.all([
    prisma.wedding.count({ where }),
    prisma.wedding.findMany({
      where,
      skip,
      take,
      orderBy: { startDate: 'asc' },
      include: {
        client: {
          select: { id: true, partner1Name: true, partner2Name: true, email: true, phone: true },
        },
        assignedPlanner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: {
            tasks: true,
            vendorBookings: true,
            guests: true,
          },
        },
      },
    }),
  ]);

  // Compute tasks completion percentage
  const enriched = await Promise.all(
    weddings.map(async (w) => {
      const [doneTasks, totalTasks] = await Promise.all([
        prisma.weddingTask.count({ where: { weddingId: w.id, status: 'DONE' } }),
        prisma.weddingTask.count({ where: { weddingId: w.id } }),
      ]);

      const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return {
        ...w,
        completionPercentage,
        assignedVendorsCount: w._count.vendorBookings,
        pendingTasksCount: totalTasks - doneTasks,
        totalTasksCount: totalTasks,
      };
    })
  );

  res.json({
    success: true,
    data: {
      weddings: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

export const getWeddingById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      client: true,
      assignedPlanner: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      milestones: { orderBy: { sortOrder: 'asc' } },
      agreements: { orderBy: { createdAt: 'desc' } },
      vendorBookings: {
        include: {
          vendor: { include: { category: true } },
          quotation: true,
        },
      },
      _count: {
        select: {
          tasks: true,
          guests: true,
          events: true,
          incidents: true,
          extraExpenses: true,
        },
      },
    },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  // Security check for CLIENT role
  if (req.user?.role === 'CLIENT') {
    const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
    if (!client || wedding.clientId !== client.id) {
      res.status(403).json({ success: false, message: 'Access denied to this wedding' });
      return;
    }
  }

  res.json({
    success: true,
    data: { wedding },
  });
};

export const getWeddingOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      client: true,
      assignedPlanner: { select: { id: true, firstName: true, lastName: true } },
      milestones: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const [
    totalTasks,
    doneTasks,
    inProgressTasks,
    assignedVendors,
    upcomingEvents,
    activeIncidents,
    guestsConfirmed,
    guestsAttended,
    totalGuests,
    approvedExtras,
    vendorPaymentsTotal,
    clientPaymentsTotal,
  ] = await Promise.all([
    prisma.weddingTask.count({ where: { weddingId: id } }),
    prisma.weddingTask.count({ where: { weddingId: id, status: 'DONE' } }),
    prisma.weddingTask.count({ where: { weddingId: id, status: 'IN_PROGRESS' } }),
    prisma.vendorBooking.count({ where: { weddingId: id } }),
    prisma.weddingEvent.findMany({
      where: { weddingId: id },
      orderBy: { eventDate: 'asc' },
      take: 5,
    }),
    prisma.incident.findMany({
      where: { weddingId: id, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
      orderBy: { severity: 'desc' },
      take: 5,
    }),
    prisma.guest.count({ where: { weddingId: id, rsvpStatus: 'CONFIRMED' } }),
    prisma.guest.count({ where: { weddingId: id, arrivalStatus: 'ARRIVED' } }),
    prisma.guest.count({ where: { weddingId: id } }),
    prisma.extraExpense.aggregate({
      where: { weddingId: id, approvalStatus: 'APPROVED' },
      _sum: { totalAmount: true },
    }),
    prisma.vendorPayment.aggregate({
      where: { weddingId: id },
      _sum: { amount: true },
    }),
    prisma.clientPayment.aggregate({
      where: { weddingId: id },
      _sum: { amount: true },
    }),
  ]);

  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const approvedExtrasAmount = approvedExtras._sum.totalAmount || new Prisma.Decimal(0);
  const totalClientPayments = clientPaymentsTotal._sum.amount || new Prisma.Decimal(0);
  const totalVendorPayments = vendorPaymentsTotal._sum.amount || new Prisma.Decimal(0);

  const recognizedRevenue = new Prisma.Decimal(wedding.contractAmount).add(approvedExtrasAmount);
  const clientOutstanding = recognizedRevenue.sub(totalClientPayments);

  res.json({
    success: true,
    data: {
      wedding,
      metrics: {
        completionPercentage,
        totalTasks,
        doneTasks,
        pendingTasks: totalTasks - doneTasks,
        inProgressTasks,
        assignedVendorsCount: assignedVendors,
        totalGuests,
        guestsConfirmed,
        guestsAttended,
        contractAmount: wedding.contractAmount,
        approvedExtrasAmount,
        recognizedRevenue,
        totalClientPayments,
        clientOutstanding: clientOutstanding.greaterThan(0) ? clientOutstanding : 0,
        totalVendorPayments,
      },
      upcomingEvents,
      activeIncidents,
      milestones: wedding.milestones,
    },
  });
};

export const createWedding = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = weddingSchema.parse(req.body);

  const weddingCount = await prisma.wedding.count();
  const year = new Date().getFullYear();
  const weddingCode = `TRK-${year}-${String(weddingCount + 1).padStart(3, '0')}`;

  const wedding = await prisma.wedding.create({
    data: {
      weddingCode,
      name: data.name,
      clientId: data.clientId,
      location: data.location,
      venueName: data.venueName,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      guestCount: data.guestCount,
      packageType: data.packageType,
      contractAmount: new Prisma.Decimal(data.contractAmount),
      budget: new Prisma.Decimal(data.budget),
      assignedPlannerId: data.assignedPlannerId || req.user?.id,
      status: data.status,
    },
  });

  res.status(201).json({
    success: true,
    data: { wedding },
  });
};

export const updateWedding = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = weddingSchema.partial().parse(req.body);

  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.contractAmount) updateData.contractAmount = new Prisma.Decimal(data.contractAmount);
  if (data.budget) updateData.budget = new Prisma.Decimal(data.budget);

  const wedding = await prisma.wedding.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    data: { wedding },
  });
};
