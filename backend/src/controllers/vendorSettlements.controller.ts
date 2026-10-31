import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

export const getVendorInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, vendorId, status } = req.query;

  const where: Prisma.VendorInvoiceWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);
  if (vendorId) where.vendorId = String(vendorId);
  if (status) where.status = status as any;

  if (req.user?.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) {
      res.json({ success: true, data: { invoices: [] } });
      return;
    }
    where.vendorId = vendor.id;
  }

  const invoices = await prisma.vendorInvoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      vendor: { select: { id: true, companyName: true, contactPerson: true, phone: true } },
      wedding: { select: { id: true, weddingCode: true, name: true } },
      payments: true,
    },
  });

  res.json({ success: true, data: { invoices } });
};

export const createVendorInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, vendorId, invoiceNumber, originalQuotedAmount, approvedAdditions = 0, discountAmount = 0, taxAmount = 0, finalAmount, dueDate, invoicePdfUrl } = req.body;

  // Prevent duplicate invoice number for the same wedding & vendor
  const existing = await prisma.vendorInvoice.findUnique({
    where: {
      weddingId_vendorId_invoiceNumber: {
        weddingId,
        vendorId,
        invoiceNumber: invoiceNumber.trim(),
      },
    },
  });

  if (existing) {
    res.status(409).json({
      success: false,
      message: `Invoice number '${invoiceNumber}' has already been recorded for this vendor.`,
    });
    return;
  }

  // Find existing advance payments made to this vendor for this wedding
  const previousPayments = await prisma.vendorPayment.aggregate({
    where: { weddingId, vendorId },
    _sum: { amount: true },
  });

  const totalPaidSoFar = previousPayments._sum.amount || new Prisma.Decimal(0);
  const finalVal = new Prisma.Decimal(finalAmount);
  const balanceDue = finalVal.sub(totalPaidSoFar);

  const invoice = await prisma.vendorInvoice.create({
    data: {
      invoiceNumber: invoiceNumber.trim(),
      weddingId,
      vendorId,
      originalQuotedAmount: new Prisma.Decimal(originalQuotedAmount),
      approvedAdditions: new Prisma.Decimal(approvedAdditions),
      discountAmount: new Prisma.Decimal(discountAmount),
      taxAmount: new Prisma.Decimal(taxAmount),
      finalAmount: finalVal,
      advancePaid: totalPaidSoFar,
      previousPayments: totalPaidSoFar,
      balanceDue: balanceDue.greaterThan(0) ? balanceDue : new Prisma.Decimal(0),
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      status: balanceDue.lessThanOrEqualTo(0) ? 'PAID' : totalPaidSoFar.greaterThan(0) ? 'PARTIALLY_PAID' : 'PENDING_VERIFICATION',
      invoicePdfUrl,
    },
    include: {
      vendor: { select: { companyName: true } },
    },
  });

  res.status(201).json({ success: true, data: { invoice } });
};

/**
 * Record Vendor Payment (Advance or Final Settlement)
 */
export const recordVendorPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, vendorId, vendorInvoiceId, amount, paymentMethod = 'BANK_TRANSFER', transactionRef, isAdvance = false, notes } = req.body;

  if (!weddingId || !vendorId || !amount || !transactionRef) {
    res.status(400).json({ success: false, message: 'weddingId, vendorId, amount, and transactionRef are required' });
    return;
  }

  // Check duplicate transaction ref
  const duplicate = await prisma.vendorPayment.findUnique({
    where: { transactionRef: transactionRef.trim() },
  });

  if (duplicate) {
    res.status(409).json({
      success: false,
      message: `Duplicate vendor payment: Reference '${transactionRef}' has already been processed.`,
    });
    return;
  }

  const payCount = await prisma.vendorPayment.count();
  const year = new Date().getFullYear();
  const paymentNumber = `VPAY-${year}-${String(payCount + 1).padStart(4, '0')}`;
  const payAmount = new Prisma.Decimal(amount);

  const result = await prisma.$transaction(async (tx) => {
    // Create payment record
    const payment = await tx.vendorPayment.create({
      data: {
        paymentNumber,
        weddingId,
        vendorId,
        vendorInvoiceId: vendorInvoiceId || null,
        amount: payAmount,
        paymentMethod: paymentMethod as any,
        transactionRef: transactionRef.trim(),
        isAdvance: Boolean(isAdvance),
        notes,
        recordedById: req.user?.id,
      },
      include: {
        vendor: { select: { companyName: true } },
      },
    });

    // Update invoice if linked
    if (vendorInvoiceId) {
      const inv = await tx.vendorInvoice.findUnique({ where: { id: vendorInvoiceId } });
      if (inv) {
        const newPrevious = new Prisma.Decimal(inv.previousPayments).add(payAmount);
        const newBalance = new Prisma.Decimal(inv.finalAmount).sub(newPrevious);

        await tx.vendorInvoice.update({
          where: { id: inv.id },
          data: {
            previousPayments: newPrevious,
            balanceDue: newBalance.greaterThan(0) ? newBalance : new Prisma.Decimal(0),
            status: newBalance.lessThanOrEqualTo(0) ? 'PAID' : 'PARTIALLY_PAID',
          },
        });
      }
    }

    // Log Activity
    if (req.user?.id) {
      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'RECORD_VENDOR_PAYMENT',
          entity: 'VendorPayment',
          entityId: payment.id,
          newValue: {
            paymentNumber,
            vendorName: payment.vendor.companyName,
            amount: payAmount.toString(),
            transactionRef,
          },
        },
      });
    }

    return payment;
  });

  res.status(201).json({
    success: true,
    message: isAdvance ? 'Vendor advance payment recorded successfully' : 'Vendor settlement payment recorded successfully',
    data: { payment: result },
  });
};

/**
 * Vendor Settlements Summary per Wedding
 */
export const getVendorSettlementSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.params;

  const bookings = await prisma.vendorBooking.findMany({
    where: { weddingId },
    include: {
      vendor: { include: { category: true } },
      quotation: true,
    },
  });

  const invoices = await prisma.vendorInvoice.findMany({
    where: { weddingId },
  });

  const payments = await prisma.vendorPayment.findMany({
    where: { weddingId },
  });

  const summary = bookings.map((b) => {
    const vendorInvoices = invoices.filter((i) => i.vendorId === b.vendorId);
    const vendorPayments = payments.filter((p) => p.vendorId === b.vendorId);

    const agreedAmount = Number(b.agreedAmount);
    let billedAmount = 0;
    vendorInvoices.forEach((inv) => {
      billedAmount += Number(inv.finalAmount);
    });
    if (billedAmount === 0) billedAmount = agreedAmount;

    let paidAmount = 0;
    vendorPayments.forEach((p) => {
      paidAmount += Number(p.amount);
    });

    const outstandingBalance = billedAmount - paidAmount;

    return {
      vendorId: b.vendorId,
      vendorName: b.vendor.companyName,
      categoryName: b.vendor.category.name,
      agreedAmount,
      billedAmount,
      paidAmount,
      outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
      settlementStatus: outstandingBalance <= 0 && paidAmount > 0 ? 'SETTLED' : paidAmount > 0 ? 'PARTIAL' : 'PENDING',
    };
  });

  res.json({ success: true, data: { summary } });
};
