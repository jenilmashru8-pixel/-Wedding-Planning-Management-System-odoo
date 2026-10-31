import { Response } from 'express';
import prisma from '../config/prisma.js';
import { quotationRequestSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateQuotationTotal, toDecimal } from '../utils/calculations.js';
import { Prisma } from '@prisma/client';

export const getQuotations = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, categoryId, vendorId, status } = req.query;

  const where: Prisma.VendorQuotationWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);
  if (categoryId) where.categoryId = String(categoryId);
  if (status) where.status = status as any;

  // Vendor role isolation
  if (req.user?.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) {
      res.json({ success: true, data: { quotations: [] } });
      return;
    }
    where.vendorId = vendor.id;
  } else if (vendorId) {
    where.vendorId = String(vendorId);
  }

  const quotations = await prisma.vendorQuotation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      vendor: { select: { id: true, companyName: true, contactPerson: true, phone: true, rating: true } },
      category: true,
      wedding: { select: { id: true, weddingCode: true, name: true } },
      booking: true,
    },
  });

  res.json({
    success: true,
    data: { quotations },
  });
};

export const createQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = quotationRequestSchema.parse(req.body);

  const quoteCount = await prisma.vendorQuotation.count();
  const year = new Date().getFullYear();
  const quoteNumber = `QUO-${year}-${String(quoteCount + 1).padStart(3, '0')}`;

  const { subtotal, taxAmount, totalAmount } = calculateQuotationTotal({
    baseAmount: data.baseAmount,
    pricePerPlate: data.pricePerPlate,
    guestCount: data.guestCount,
    additionalStaffCost: data.additionalStaffCost,
    transportationCost: data.transportationCost,
    taxRate: data.taxRate,
    discountAmount: data.discountAmount,
  });

  const quotation = await prisma.vendorQuotation.create({
    data: {
      quoteNumber,
      weddingId: data.weddingId,
      vendorId: data.vendorId,
      categoryId: data.categoryId,
      guestCount: data.guestCount,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
      baseAmount: toDecimal(data.baseAmount),
      pricePerPlate: toDecimal(data.pricePerPlate),
      extraHourRate: toDecimal(data.extraHourRate),
      menuDetails: data.menuDetails || null,
      includedServices: data.includedServices || [],
      excludedServices: data.excludedServices || [],
      additionalStaffCost: toDecimal(data.additionalStaffCost),
      transportationCost: toDecimal(data.transportationCost),
      taxRate: toDecimal(data.taxRate),
      taxAmount,
      discountAmount: toDecimal(data.discountAmount),
      totalAmount,
      validityDate: data.validityDate ? new Date(data.validityDate) : null,
      terms: data.terms,
      status: 'SUBMITTED',
    },
  });

  res.status(201).json({
    success: true,
    data: { quotation },
  });
};

/**
 * Compare quotations side by side for a wedding and category
 */
export const compareQuotations = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, categoryId } = req.query;

  if (!weddingId || !categoryId) {
    res.status(400).json({ success: false, message: 'weddingId and categoryId are required' });
    return;
  }

  const quotations = await prisma.vendorQuotation.findMany({
    where: {
      weddingId: String(weddingId),
      categoryId: String(categoryId),
    },
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
          rating: true,
          location: true,
        },
      },
      category: true,
      booking: true,
    },
    orderBy: { totalAmount: 'asc' },
  });

  res.json({
    success: true,
    data: {
      quotations,
      count: quotations.length,
    },
  });
};

/**
 * Select final vendor quotation:
 * - In a transaction, mark selected quotation as ACCEPTED.
 * - Create or update VendorBooking.
 * - Automatically close competing requests for this category.
 */
export const selectQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const quotation = await prisma.vendorQuotation.findUnique({
    where: { id },
    include: { vendor: true, wedding: true },
  });

  if (!quotation) {
    res.status(404).json({ success: false, message: 'Quotation not found' });
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Mark selected quotation as ACCEPTED
    const acceptedQuote = await tx.vendorQuotation.update({
      where: { id: quotation.id },
      data: {
        status: 'ACCEPTED',
        coupleApproved: true,
      },
    });

    // 2. Automatically close competing quotations for the same wedding & category
    await tx.vendorQuotation.updateMany({
      where: {
        weddingId: quotation.weddingId,
        categoryId: quotation.categoryId,
        id: { not: quotation.id },
      },
      data: {
        status: 'CLOSED',
      },
    });

    // 3. Create or update VendorBooking with agreed amount
    const booking = await tx.vendorBooking.upsert({
      where: {
        weddingId_vendorId: {
          weddingId: quotation.weddingId,
          vendorId: quotation.vendorId,
        },
      },
      update: {
        quotationId: quotation.id,
        agreedAmount: quotation.totalAmount,
        status: 'CONFIRMED',
      },
      create: {
        weddingId: quotation.weddingId,
        vendorId: quotation.vendorId,
        quotationId: quotation.id,
        agreedAmount: quotation.totalAmount,
        status: 'CONFIRMED',
      },
    });

    // 4. Log Activity
    if (req.user?.id) {
      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'SELECT_VENDOR_QUOTATION',
          entity: 'VendorBooking',
          entityId: booking.id,
          newValue: {
            vendorName: quotation.vendor.companyName,
            agreedAmount: quotation.totalAmount.toString(),
            quoteNumber: quotation.quoteNumber,
          },
        },
      });
    }

    return { quotation: acceptedQuote, booking };
  });

  res.json({
    success: true,
    message: 'Vendor selected successfully. Competing quotes have been closed.',
    data: result,
  });
};
