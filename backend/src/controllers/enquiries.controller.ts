import { Response } from 'express';
import prisma from '../config/prisma.js';
import { enquirySchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

export const getEnquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, source, status, location, minBudget, maxBudget, page = '1', limit = '50' } = req.query;

  const where: Prisma.EnquiryWhereInput = {};

  if (search) {
    const s = String(search);
    where.OR = [
      { coupleName: { contains: s, mode: 'insensitive' } },
      { partner1Name: { contains: s, mode: 'insensitive' } },
      { partner2Name: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s } },
      { email: { contains: s, mode: 'insensitive' } },
      { enquiryNumber: { contains: s, mode: 'insensitive' } },
    ];
  }

  if (source) {
    where.source = source as any;
  }

  if (status) {
    where.status = status as any;
  }

  if (location) {
    where.weddingLocation = { contains: String(location), mode: 'insensitive' };
  }

  if (minBudget || maxBudget) {
    where.maxBudget = {};
    if (minBudget) where.maxBudget.gte = new Prisma.Decimal(String(minBudget));
    if (maxBudget) where.maxBudget.lte = new Prisma.Decimal(String(maxBudget));
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const take = parseInt(String(limit), 10) || 50;
  const skip = (pageNum - 1) * take;

  const [total, enquiries] = await Promise.all([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        consultations: {
          orderBy: { scheduledAt: 'desc' },
          take: 3,
        },
        convertedWedding: {
          select: { id: true, weddingCode: true, name: true, status: true },
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      enquiries,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

export const getEnquiryById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      consultations: {
        include: { planner: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { scheduledAt: 'desc' },
      },
      convertedWedding: true,
      client: true,
    },
  });

  if (!enquiry) {
    res.status(404).json({ success: false, message: 'Enquiry not found' });
    return;
  }

  res.json({
    success: true,
    data: { enquiry },
  });
};

export const createEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = enquirySchema.parse(req.body);

  const count = await prisma.enquiry.count();
  const year = new Date().getFullYear();
  const enquiryNumber = `ENQ-${year}-${String(count + 1).padStart(3, '0')}`;

  const enquiry = await prisma.enquiry.create({
    data: {
      enquiryNumber,
      coupleName: data.coupleName,
      partner1Name: data.partner1Name,
      partner2Name: data.partner2Name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      whatsapp: data.whatsapp,
      source: data.source,
      weddingLocation: data.weddingLocation,
      preferredDate: new Date(data.preferredDate),
      alternativeDate: data.alternativeDate ? new Date(data.alternativeDate) : null,
      weddingDurationDays: data.weddingDurationDays,
      guestCount: data.guestCount,
      maxBudget: new Prisma.Decimal(data.maxBudget),
      theme: data.theme,
      packageType: data.packageType,
      specialRequirements: data.specialRequirements,
      notes: data.notes,
      assignedPlannerId: data.assignedPlannerId || req.user?.id,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      status: data.status,
    },
  });

  // Log activity
  if (req.user?.id) {
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_ENQUIRY',
        entity: 'Enquiry',
        entityId: enquiry.id,
        newValue: { enquiryNumber, coupleName: enquiry.coupleName },
      },
    });
  }

  res.status(201).json({
    success: true,
    data: { enquiry },
  });
};

export const updateEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = enquirySchema.partial().parse(req.body);

  const existing = await prisma.enquiry.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ success: false, message: 'Enquiry not found' });
    return;
  }

  const updateData: any = { ...data };
  if (data.preferredDate) updateData.preferredDate = new Date(data.preferredDate);
  if (data.alternativeDate) updateData.alternativeDate = new Date(data.alternativeDate);
  if (data.followUpDate) updateData.followUpDate = new Date(data.followUpDate);
  if (data.maxBudget) updateData.maxBudget = new Prisma.Decimal(data.maxBudget);

  const updated = await prisma.enquiry.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    data: { enquiry: updated },
  });
};

export const deleteEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.enquiry.delete({ where: { id } });
  res.json({ success: true, message: 'Enquiry deleted successfully' });
};

export const scheduleConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { scheduledAt, location, meetingNotes, plannerId } = req.body;

  const consultation = await prisma.consultation.create({
    data: {
      enquiryId: id,
      scheduledAt: new Date(scheduledAt),
      location: location || 'The Royal Knot Studio, Jaipur',
      meetingNotes,
      plannerId: plannerId || req.user?.id,
      status: 'SCHEDULED',
    },
  });

  await prisma.enquiry.update({
    where: { id },
    data: { status: 'MEETING_SCHEDULED' },
  });

  res.status(201).json({
    success: true,
    data: { consultation },
  });
};

/**
 * Convert Enquiry to Wedding in a database transaction!
 */
export const convertEnquiryToWedding = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { contractAmount, venueName } = req.body;

  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
  });

  if (!enquiry) {
    res.status(404).json({ success: false, message: 'Enquiry not found' });
    return;
  }

  if (enquiry.status === 'CONVERTED' || enquiry.convertedWeddingId) {
    res.status(400).json({
      success: false,
      message: 'This enquiry has already been converted to a wedding project',
    });
    return;
  }

  // Database transaction for atomic conversion
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create or link Client
    let client = await tx.client.findUnique({
      where: { email: enquiry.email },
    });

    if (!client) {
      client = await tx.client.create({
        data: {
          partner1Name: enquiry.partner1Name,
          partner2Name: enquiry.partner2Name,
          email: enquiry.email,
          phone: enquiry.phone,
          city: enquiry.weddingLocation,
          notes: `Created from enquiry ${enquiry.enquiryNumber}`,
        },
      });
    }

    // 2. Generate unique Wedding Code
    const weddingCount = await tx.wedding.count();
    const year = new Date().getFullYear();
    const weddingCode = `TRK-${year}-${String(weddingCount + 1).padStart(3, '0')}`;

    const startDate = enquiry.preferredDate;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (enquiry.weddingDurationDays || 3) - 1);

    const agreedAmount = contractAmount ? new Prisma.Decimal(contractAmount) : enquiry.maxBudget;

    // 3. Create Wedding
    const wedding = await tx.wedding.create({
      data: {
        weddingCode,
        name: `${enquiry.coupleName} Royal Wedding`,
        clientId: client.id,
        location: enquiry.weddingLocation,
        venueName: venueName || 'Luxury Palace Heritage Resort',
        startDate,
        endDate,
        guestCount: enquiry.guestCount,
        packageType: enquiry.packageType,
        contractAmount: agreedAmount,
        budget: agreedAmount,
        assignedPlannerId: enquiry.assignedPlannerId || req.user?.id,
        status: 'CONFIRMED',
      },
    });

    // 4. Create Standard Milestones: Booking (25%), Advance (50%), Final (25%)
    const bookingAmount = agreedAmount.mul(25).div(100);
    const advanceAmount = agreedAmount.mul(50).div(100);
    const finalAmount = agreedAmount.mul(25).div(100);

    const advanceDate = new Date(startDate);
    advanceDate.setDate(advanceDate.getDate() - 30);

    const finalDate = new Date(endDate);
    finalDate.setDate(finalDate.getDate() + 7);

    await tx.paymentMilestone.createMany({
      data: [
        {
          weddingId: wedding.id,
          milestoneType: 'BOOKING',
          title: 'Booking Deposit (25%)',
          percentage: new Prisma.Decimal(25),
          amountDue: bookingAmount,
          dueDate: new Date(),
          sortOrder: 1,
        },
        {
          weddingId: wedding.id,
          milestoneType: 'ADVANCE',
          title: 'Advance Payment 30 Days Prior (50%)',
          percentage: new Prisma.Decimal(50),
          amountDue: advanceAmount,
          dueDate: advanceDate,
          sortOrder: 2,
        },
        {
          weddingId: wedding.id,
          milestoneType: 'FINAL',
          title: 'Final Post-Wedding Settlement (25%)',
          percentage: new Prisma.Decimal(25),
          amountDue: finalAmount,
          dueDate: finalDate,
          sortOrder: 3,
        },
      ],
    });

    // 5. Update Enquiry to preserve history and link to converted wedding
    const updatedEnquiry = await tx.enquiry.update({
      where: { id: enquiry.id },
      data: {
        status: 'CONVERTED',
        convertedWeddingId: wedding.id,
        clientId: client.id,
      },
    });

    // 6. Log Activity
    if (req.user?.id) {
      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'CONVERT_ENQUIRY',
          entity: 'Wedding',
          entityId: wedding.id,
          newValue: {
            enquiryNumber: enquiry.enquiryNumber,
            weddingCode,
            contractAmount: agreedAmount.toString(),
          },
        },
      });
    }

    return { wedding, client, enquiry: updatedEnquiry };
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry converted to wedding successfully',
    data: result,
  });
};
