import { Response } from 'express';
import prisma from '../config/prisma.js';
import { vendorSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  const categories = await prisma.vendorCategory.findMany({
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: { categories } });
};

export const getVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  const { categoryId, location, search, availability, page = '1', limit = '50' } = req.query;

  const where: Prisma.VendorWhereInput = {
    isArchived: false,
  };

  // Vendor role isolation
  if (req.user?.role === 'VENDOR') {
    where.userId = req.user.id;
  }

  if (categoryId) where.categoryId = String(categoryId);
  if (location) where.location = { contains: String(location), mode: 'insensitive' };
  if (availability !== undefined) where.availabilityStatus = availability === 'true';

  if (search) {
    const s = String(search);
    where.OR = [
      { companyName: { contains: s, mode: 'insensitive' } },
      { contactPerson: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s } },
    ];
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const take = parseInt(String(limit), 10) || 50;
  const skip = (pageNum - 1) * take;

  const [total, vendors] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where,
      skip,
      take,
      orderBy: { rating: 'desc' },
      include: {
        category: true,
        _count: {
          select: {
            bookings: true,
            quotations: true,
            checkIns: true,
          },
        },
      },
    }),
  ]);

  // Restrict bank details for non-privileged roles
  const canViewFinancials = ['FOUNDER', 'FINANCE'].includes(req.user?.role || '');
  const sanitized = vendors.map((v) => {
    if (!canViewFinancials && req.user?.id !== v.userId) {
      return {
        ...v,
        bankName: v.bankName ? 'Confidential' : null,
        bankAccount: v.bankAccount ? '••••••••' + v.bankAccount.slice(-4) : null,
        bankIfsc: v.bankIfsc ? '••••' : null,
        totalBookings: v._count.bookings,
      };
    }
    return {
      ...v,
      totalBookings: v._count.bookings,
    };
  });

  res.json({
    success: true,
    data: {
      vendors: sanitized,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

export const getVendorById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      category: true,
      bookings: {
        include: {
          wedding: { select: { id: true, weddingCode: true, name: true, startDate: true, status: true } },
          quotation: true,
        },
      },
      checkIns: {
        take: 10,
        orderBy: { expectedArrivalTime: 'desc' },
        include: { wedding: { select: { name: true } } },
      },
      feedbacks: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vendor) {
    res.status(404).json({ success: false, message: 'Vendor not found' });
    return;
  }

  // Restrict bank details if unauthorized
  const canViewFinancials = ['FOUNDER', 'FINANCE'].includes(req.user?.role || '');
  if (!canViewFinancials && req.user?.id !== vendor.userId) {
    vendor.bankAccount = vendor.bankAccount ? '••••••••' + vendor.bankAccount.slice(-4) : null;
    vendor.bankIfsc = vendor.bankIfsc ? '••••' : null;
  }

  res.json({ success: true, data: { vendor } });
};

export const createVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = vendorSchema.parse(req.body);

  const vendor = await prisma.vendor.create({
    data: {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email.toLowerCase().trim(),
      address: data.address,
      categoryId: data.categoryId,
      services: data.services,
      location: data.location,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankIfsc: data.bankIfsc,
      bankBranch: data.bankBranch,
      availabilityStatus: data.availabilityStatus,
      rating: data.rating,
      notes: data.notes,
    },
  });

  res.status(201).json({ success: true, data: { vendor } });
};

export const updateVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = vendorSchema.partial().parse(req.body);

  const vendor = await prisma.vendor.update({
    where: { id },
    data,
  });

  res.json({ success: true, data: { vendor } });
};

export const archiveVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  await prisma.vendor.update({
    where: { id },
    data: { isArchived: true },
  });

  res.json({ success: true, message: 'Vendor archived successfully' });
};
