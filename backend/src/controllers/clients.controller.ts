import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, page = '1', limit = '50' } = req.query;

  // Role isolation: if CLIENT role, can only see own profile
  const where: Prisma.ClientWhereInput = {};
  if (req.user?.role === 'CLIENT') {
    where.userId = req.user.id;
  } else if (search) {
    const s = String(search);
    where.OR = [
      { partner1Name: { contains: s, mode: 'insensitive' } },
      { partner2Name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s } },
      { city: { contains: s, mode: 'insensitive' } },
    ];
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const take = parseInt(String(limit), 10) || 50;
  const skip = (pageNum - 1) * take;

  const [total, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        weddings: {
          select: {
            id: true,
            weddingCode: true,
            name: true,
            startDate: true,
            status: true,
            contractAmount: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            paidAmount: true,
            balanceDue: true,
            status: true,
          },
        },
      },
    }),
  ]);

  // Aggregate financial metrics per client
  const enrichedClients = clients.map((client) => {
    let totalSpent = 0;
    let outstandingBalance = 0;
    client.invoices.forEach((inv) => {
      totalSpent += Number(inv.paidAmount);
      outstandingBalance += Number(inv.balanceDue);
    });

    return {
      ...client,
      totalWeddings: client.weddings.length,
      totalSpent,
      outstandingBalance,
    };
  });

  res.json({
    success: true,
    data: {
      clients: enrichedClients,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      weddings: {
        include: {
          assignedPlanner: { select: { id: true, firstName: true, lastName: true } },
          milestones: true,
        },
      },
      agreements: true,
      invoices: true,
      enquiries: true,
    },
  });

  if (!client) {
    res.status(404).json({ success: false, message: 'Client not found' });
    return;
  }

  // Client isolation check
  if (req.user?.role === 'CLIENT' && client.userId !== req.user.id) {
    res.status(403).json({ success: false, message: 'Access denied to this client profile' });
    return;
  }

  res.json({
    success: true,
    data: { client },
  });
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  const { partner1Name, partner2Name, email, phone, altPhone, address, city, notes } = req.body;

  const existing = await prisma.client.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    res.status(409).json({ success: false, message: 'Client with this email already exists' });
    return;
  }

  const client = await prisma.client.create({
    data: {
      partner1Name,
      partner2Name,
      email: email.toLowerCase().trim(),
      phone,
      altPhone,
      address,
      city,
      notes,
    },
  });

  res.status(201).json({ success: true, data: { client } });
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { partner1Name, partner2Name, phone, altPhone, address, city, notes } = req.body;

  const client = await prisma.client.update({
    where: { id },
    data: {
      partner1Name,
      partner2Name,
      phone,
      altPhone,
      address,
      city,
      notes,
    },
  });

  res.json({ success: true, data: { client } });
};
