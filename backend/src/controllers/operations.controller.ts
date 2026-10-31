import { Response } from 'express';
import prisma from '../config/prisma.js';
import { eventTimelineSchema, incidentSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { emitToWedding } from '../socket.js';
import { differenceInMinutes } from 'date-fns';

export const getWeddingTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.params;

  const events = await prisma.weddingEvent.findMany({
    where: { weddingId },
    orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
    include: {
      checkIns: {
        include: {
          vendor: { select: { id: true, companyName: true, contactPerson: true, phone: true } },
        },
      },
      incidents: true,
    },
  });

  res.json({ success: true, data: { events } });
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = eventTimelineSchema.parse(req.body);

  const event = await prisma.weddingEvent.create({
    data: {
      weddingId: data.weddingId,
      eventName: data.eventName,
      eventDate: new Date(data.eventDate),
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      responsibleEmployeeId: data.responsibleEmployeeId || req.user?.id,
      vendorId: data.vendorId,
      priority: data.priority,
      status: data.status,
      notes: data.notes,
    },
  });

  res.status(201).json({ success: true, data: { event } });
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = eventTimelineSchema.partial().parse(req.body);

  const updateData: any = { ...data };
  if (data.eventDate) updateData.eventDate = new Date(data.eventDate);

  const event = await prisma.weddingEvent.update({
    where: { id },
    data: updateData,
  });

  res.json({ success: true, data: { event } });
};

/**
 * Vendor Check-in with Late Arrival Detection & Real-time Socket.IO alerts
 */
export const checkInVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, vendorId } = req.params;
  const { eventId, status, delayReason, expectedArrivalTime, notes } = req.body;

  const actualArrivalTime = new Date();
  let delayMinutes = 0;
  let computedStatus = status || 'ARRIVED';

  let checkIn = await prisma.vendorCheckIn.findFirst({
    where: { weddingId, vendorId, eventId: eventId || null },
  });

  if (checkIn) {
    if (checkIn.expectedArrivalTime) {
      const diff = differenceInMinutes(actualArrivalTime, new Date(checkIn.expectedArrivalTime));
      if (diff > 15) {
        delayMinutes = diff;
        computedStatus = 'DELAYED';
      }
    }

    checkIn = await prisma.vendorCheckIn.update({
      where: { id: checkIn.id },
      data: {
        actualArrivalTime,
        status: computedStatus,
        checkedInById: req.user?.id,
        delayMinutes,
        delayReason: delayReason || (delayMinutes > 0 ? 'Traffic/Transit delay' : null),
        notes,
      },
      include: {
        vendor: { select: { id: true, companyName: true, contactPerson: true, phone: true } },
      },
    });
  } else {
    const expected = expectedArrivalTime ? new Date(expectedArrivalTime) : new Date();
    const diff = differenceInMinutes(actualArrivalTime, expected);
    if (diff > 15) {
      delayMinutes = diff;
      computedStatus = 'DELAYED';
    }

    checkIn = await prisma.vendorCheckIn.create({
      data: {
        weddingId,
        vendorId,
        eventId: eventId || null,
        expectedArrivalTime: expected,
        actualArrivalTime,
        status: computedStatus,
        checkedInById: req.user?.id,
        delayMinutes,
        delayReason: delayReason || (delayMinutes > 0 ? 'Late check-in recorded' : null),
        notes,
      },
      include: {
        vendor: { select: { id: true, companyName: true, contactPerson: true, phone: true } },
      },
    });
  }

  // Real-time broadcast
  emitToWedding(weddingId, 'vendor_checkin', checkIn);
  if (computedStatus === 'DELAYED') {
    emitToWedding(weddingId, 'vendor_delayed', {
      vendorName: checkIn.vendor.companyName,
      delayMinutes: checkIn.delayMinutes,
      delayReason: checkIn.delayReason,
    });
  }

  res.json({
    success: true,
    message: computedStatus === 'DELAYED' ? `Vendor checked in with ${delayMinutes} mins delay` : 'Vendor checked in on time',
    data: { checkIn },
  });
};

export const getVendorCheckIns = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.params;

  const checkIns = await prisma.vendorCheckIn.findMany({
    where: { weddingId },
    orderBy: { expectedArrivalTime: 'asc' },
    include: {
      vendor: { select: { id: true, companyName: true, contactPerson: true, phone: true } },
      event: { select: { id: true, eventName: true, startTime: true } },
      checkedInBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.json({ success: true, data: { checkIns } });
};

/**
 * Incident Management
 */
export const getIncidents = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, status, severity } = req.query;

  const where: any = {};
  if (weddingId) where.weddingId = String(weddingId);
  if (status) where.status = status;
  if (severity) where.severity = severity;

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { reportedAt: 'desc' },
    include: {
      vendor: { select: { id: true, companyName: true } },
      event: { select: { id: true, eventName: true } },
      reportedBy: { select: { id: true, firstName: true, lastName: true } },
      assignedEmployee: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.json({ success: true, data: { incidents } });
};

export const reportIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = incidentSchema.parse(req.body);

  const count = await prisma.incident.count();
  const year = new Date().getFullYear();
  const incidentNumber = `INC-${year}-${String(count + 1).padStart(3, '0')}`;

  const incident = await prisma.incident.create({
    data: {
      incidentNumber,
      weddingId: data.weddingId,
      eventId: data.eventId,
      vendorId: data.vendorId,
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: 'OPEN',
      reportedById: req.user?.id,
      assignedEmployeeId: data.assignedEmployeeId || req.user?.id,
    },
    include: {
      vendor: { select: { companyName: true } },
      reportedBy: { select: { firstName: true, lastName: true } },
    },
  });

  emitToWedding(data.weddingId, 'incident_reported', incident);

  res.status(201).json({ success: true, data: { incident } });
};

export const resolveIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolutionNotes,
      resolvedAt: new Date(),
    },
  });

  emitToWedding(incident.weddingId, 'incident_resolved', incident);

  res.json({ success: true, data: { incident } });
};
