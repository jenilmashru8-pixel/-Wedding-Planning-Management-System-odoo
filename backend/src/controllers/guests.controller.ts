import { Response } from 'express';
import prisma from '../config/prisma.js';
import { guestSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

export const getGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, rsvpStatus, dietaryPreference, arrivalStatus, search, page = '1', limit = '100' } = req.query;

  let targetWeddingId = weddingId ? String(weddingId) : undefined;

  if (!targetWeddingId && req.user?.role === 'CLIENT') {
    const client = await prisma.client.findUnique({
      where: { userId: req.user.id },
      include: { weddings: { take: 1 } },
    });
    if (client?.weddings?.[0]) {
      targetWeddingId = client.weddings[0].id;
    }
  }

  const where: Prisma.GuestWhereInput = {};
  if (targetWeddingId) {
    where.weddingId = targetWeddingId;
  }

  if (rsvpStatus) where.rsvpStatus = rsvpStatus as any;
  if (dietaryPreference) where.dietaryPreference = dietaryPreference as any;
  if (arrivalStatus) where.arrivalStatus = String(arrivalStatus);

  if (search) {
    const s = String(search);
    where.OR = [
      { firstName: { contains: s, mode: 'insensitive' } },
      { lastName: { contains: s, mode: 'insensitive' } },
      { guestGroup: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s } },
      { email: { contains: s, mode: 'insensitive' } },
    ];
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const take = parseInt(String(limit), 10) || 100;
  const skip = (pageNum - 1) * take;

  const [total, guests, counts] = await Promise.all([
    prisma.guest.count({ where }),
    prisma.guest.findMany({
      where,
      skip,
      take,
      orderBy: [{ guestGroup: 'asc' }, { lastName: 'asc' }],
    }),
    prisma.guest.groupBy({
      by: ['rsvpStatus'],
      where: targetWeddingId ? { weddingId: targetWeddingId } : {},
      _count: true,
    }),
  ]);

  const [attendedCount, totalWeddingGuests] = await Promise.all([
    prisma.guest.count({ where: targetWeddingId ? { weddingId: targetWeddingId, arrivalStatus: 'ARRIVED' } : { arrivalStatus: 'ARRIVED' } }),
    prisma.guest.count({ where: targetWeddingId ? { weddingId: targetWeddingId } : {} }),
  ]);

  const stats = {
    total: totalWeddingGuests,
    confirmed: counts.find((c) => c.rsvpStatus === 'CONFIRMED')?._count || 0,
    declined: counts.find((c) => c.rsvpStatus === 'DECLINED')?._count || 0,
    pending: counts.find((c) => c.rsvpStatus === 'PENDING')?._count || 0,
    actualAttendees: attendedCount,
  };

  res.json({
    success: true,
    data: {
      guests,
      stats,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

export const createGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = guestSchema.parse(req.body);

  const guest = await prisma.guest.create({
    data: {
      weddingId: data.weddingId,
      guestGroup: data.guestGroup,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || null,
      invitationStatus: data.invitationStatus,
      rsvpStatus: data.rsvpStatus,
      dietaryPreference: data.dietaryPreference,
      accommodationAssigned: data.accommodationAssigned,
      roomNumber: data.roomNumber,
      transportationNeeded: data.transportationNeeded,
      plusGuests: data.plusGuests,
      notes: data.notes,
    },
  });

  res.status(201).json({ success: true, data: { guest } });
};

export const updateGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = guestSchema.partial().parse(req.body);

  const guest = await prisma.guest.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
    },
  });

  res.json({ success: true, data: { guest } });
};

export const deleteGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.guest.delete({ where: { id } });
  res.json({ success: true, message: 'Guest deleted successfully' });
};

export const checkInGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { arrivalStatus } = req.body;

  const guest = await prisma.guest.update({
    where: { id },
    data: {
      arrivalStatus: arrivalStatus || 'ARRIVED',
      arrivalTime: new Date(),
    },
  });

  res.json({ success: true, data: { guest } });
};

/**
 * Bulk Import Guests (supports CSV string or parsed JSON array)
 */
export const importGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, guests: guestList } = req.body;

  if (!weddingId || !Array.isArray(guestList) || guestList.length === 0) {
    res.status(400).json({ success: false, message: 'weddingId and guests array are required' });
    return;
  }

  const validGuests = [];
  for (const [index, guest] of guestList.entries()) {
    const guestRecord =
      guest && typeof guest === 'object' && !Array.isArray(guest)
        ? (guest as Record<string, unknown>)
        : {};
    const parsed = guestSchema.safeParse({ ...guestRecord, weddingId });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path.length ? `.${issue.path.join('.')}` : '';
      res.status(400).json({
        success: false,
        message: `Invalid guest at row ${index + 2}${field}: ${issue.message}`,
      });
      return;
    }

    const data = parsed.data;
    validGuests.push({
      weddingId,
      guestGroup: data.guestGroup,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      email: data.email || null,
      invitationStatus: data.invitationStatus,
      rsvpStatus: data.rsvpStatus,
      dietaryPreference: data.dietaryPreference,
      accommodationAssigned: data.accommodationAssigned,
      roomNumber: data.roomNumber || null,
      transportationNeeded: data.transportationNeeded,
      plusGuests: data.plusGuests,
      notes: data.notes || null,
    });
  }

  const created = await prisma.guest.createMany({
    data: validGuests,
  });

  res.status(201).json({
    success: true,
    message: `Imported ${created.count} guests successfully`,
    count: created.count,
  });
};

/**
 * Export Guests to CSV
 */
export const exportGuestsCsv = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.params;

  const guests = await prisma.guest.findMany({
    where: { weddingId },
    orderBy: [{ guestGroup: 'asc' }, { lastName: 'asc' }],
  });

  const header = 'ID,Group,First Name,Last Name,Phone,Email,RSVP,Dietary,Accommodation,Room,Transportation,Arrival Status\n';
  const rows = guests.map((g) => {
    return `"${g.id}","${g.guestGroup}","${g.firstName}","${g.lastName}","${g.phone || ''}","${g.email || ''}","${g.rsvpStatus}","${g.dietaryPreference}","${g.accommodationAssigned ? 'Yes' : 'No'}","${g.roomNumber || ''}","${g.transportationNeeded ? 'Yes' : 'No'}","${g.arrivalStatus}"`;
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="wedding_${weddingId}_guests.csv"`);
  res.send(header + rows);
};
