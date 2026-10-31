import { Response } from 'express';
import prisma from '../config/prisma.js';
import { paymentSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { generatePaymentReceiptPDF } from '../utils/pdfGenerator.js';
import { Prisma } from '@prisma/client';
import { format } from 'date-fns';

export const getMilestones = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.query;

  const where: Prisma.PaymentMilestoneWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);

  const milestones = await prisma.paymentMilestone.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: {
      payments: true,
      wedding: { select: { weddingCode: true, name: true } },
    },
  });

  res.json({ success: true, data: { milestones } });
};

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, page = '1', limit = '50' } = req.query;

  const where: Prisma.ClientPaymentWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);

  // Client role isolation
  if (req.user?.role === 'CLIENT') {
    const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
    if (!client) {
      res.json({ success: true, data: { payments: [] } });
      return;
    }
    where.wedding = { clientId: client.id };
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const take = parseInt(String(limit), 10) || 50;
  const skip = (pageNum - 1) * take;

  const [total, payments] = await Promise.all([
    prisma.clientPayment.count({ where }),
    prisma.clientPayment.findMany({
      where,
      skip,
      take,
      orderBy: { paymentDate: 'desc' },
      include: {
        milestone: true,
        wedding: {
          include: {
            client: { select: { partner1Name: true, partner2Name: true, email: true } },
          },
        },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

/**
 * Record Client Payment (Transaction-safe with duplicate reference check and receipt PDF generation)
 */
export const recordClientPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = paymentSchema.parse(req.body);

  // 1. Prevent duplicate transaction reference
  const duplicateRef = await prisma.clientPayment.findUnique({
    where: { transactionRef: data.transactionRef.trim() },
  });

  if (duplicateRef) {
    res.status(409).json({
      success: false,
      message: `Duplicate transaction detected: Reference '${data.transactionRef}' has already been recorded.`,
    });
    return;
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: data.weddingId },
    include: { client: true },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const payCount = await prisma.clientPayment.count();
  const year = new Date().getFullYear();
  const paymentNumber = `PAY-${year}-${String(payCount + 1).padStart(4, '0')}`;
  const paymentAmount = new Prisma.Decimal(data.amount);

  const result = await prisma.$transaction(async (tx) => {
    // 2. Generate Receipt PDF
    let receiptUrl: string | null = null;
    try {
      receiptUrl = await generatePaymentReceiptPDF({
        receiptNumber: paymentNumber,
        clientNames: `${wedding.client.partner1Name} & ${wedding.client.partner2Name}`,
        weddingName: wedding.name,
        amount: paymentAmount.toString(),
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef,
        paymentDate: format(data.paymentDate ? new Date(data.paymentDate) : new Date(), 'dd-MM-yyyy'),
      });
    } catch (e) {
      console.error('Failed to generate receipt PDF:', e);
    }

    // 3. Create Payment record
    const payment = await tx.clientPayment.create({
      data: {
        paymentNumber,
        weddingId: data.weddingId,
        milestoneId: data.milestoneId || null,
        amount: paymentAmount,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef.trim(),
        receiptUrl,
        notes: data.notes,
        recordedById: req.user?.id,
      },
    });

    // 4. Update Milestone status if linked
    if (data.milestoneId) {
      const milestone = await tx.paymentMilestone.findUnique({ where: { id: data.milestoneId } });
      if (milestone) {
        const newPaid = new Prisma.Decimal(milestone.amountPaid).add(paymentAmount);
        const status = newPaid.greaterThanOrEqualTo(milestone.amountDue) ? 'PAID' : 'PARTIALLY_PAID';

        await tx.paymentMilestone.update({
          where: { id: milestone.id },
          data: {
            amountPaid: newPaid,
            status,
          },
        });
      }
    }

    // 5. Update invoice paidAmount / balanceDue if client invoice exists
    const invoice = await tx.clientInvoice.findFirst({
      where: { weddingId: wedding.id, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
    });

    if (invoice) {
      const updatedPaid = new Prisma.Decimal(invoice.paidAmount).add(paymentAmount);
      const updatedBalance = new Prisma.Decimal(invoice.totalAmount).sub(updatedPaid);
      await tx.clientInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: updatedPaid,
          balanceDue: updatedBalance.greaterThan(0) ? updatedBalance : new Prisma.Decimal(0),
          status: updatedBalance.lessThanOrEqualTo(0) ? 'PAID' : 'PARTIALLY_PAID',
        },
      });
    }

    // 6. Log Activity
    if (req.user?.id) {
      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'RECORD_CLIENT_PAYMENT',
          entity: 'ClientPayment',
          entityId: payment.id,
          newValue: {
            paymentNumber,
            amount: paymentAmount.toString(),
            transactionRef: data.transactionRef,
          },
        },
      });
    }

    return payment;
  });

  res.status(201).json({
    success: true,
    message: 'Client payment recorded successfully',
    data: { payment: result },
  });
};

/**
 * Get upcoming & overdue payment obligations
 */
export const getUpcomingPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();

  const [upcoming, overdue] = await Promise.all([
    prisma.paymentMilestone.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        dueDate: { gte: now },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: {
        wedding: {
          include: { client: { select: { partner1Name: true, partner2Name: true, phone: true } } },
        },
      },
    }),
    prisma.paymentMilestone.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: {
        wedding: {
          include: { client: { select: { partner1Name: true, partner2Name: true, phone: true } } },
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: { upcoming, overdue },
  });
};
