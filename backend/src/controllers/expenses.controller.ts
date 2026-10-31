import { Response } from 'express';
import prisma from '../config/prisma.js';
import { extraExpenseSchema } from '../validators/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateExtraExpense } from '../utils/calculations.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { Prisma } from '@prisma/client';
import { format, addDays } from 'date-fns';

export const getExtraExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, approvalStatus } = req.query;

  const where: Prisma.ExtraExpenseWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);
  if (approvalStatus) where.approvalStatus = approvalStatus as any;

  const expenses = await prisma.extraExpense.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      vendor: { select: { id: true, companyName: true } },
      wedding: { select: { id: true, weddingCode: true, name: true } },
    },
  });

  res.json({ success: true, data: { expenses } });
};

export const createExtraExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = extraExpenseSchema.parse(req.body);

  const { amount, taxAmount, totalAmount } = calculateExtraExpense({
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    taxRate: data.taxRate,
  });

  const expense = await prisma.extraExpense.create({
    data: {
      weddingId: data.weddingId,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      unitPrice: new Prisma.Decimal(data.unitPrice),
      amount,
      taxRate: new Prisma.Decimal(data.taxRate),
      taxAmount,
      totalAmount,
      vendorId: data.vendorId || null,
      receiptUrl: data.receiptUrl,
      approvalStatus: 'PENDING',
      clientBillingStatus: 'PENDING_BILLING',
      requestedById: req.user?.id,
    },
    include: {
      vendor: { select: { companyName: true } },
    },
  });

  res.status(201).json({ success: true, data: { expense } });
};

/**
 * Client / Planner Approval for Extra Expense
 */
export const updateExpenseApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { approvalStatus, clientComments } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
    res.status(400).json({ success: false, message: 'Invalid approval status' });
    return;
  }

  const expense = await prisma.extraExpense.update({
    where: { id },
    data: {
      approvalStatus,
      clientComments,
      approvedAt: approvalStatus === 'APPROVED' ? new Date() : null,
      approvedById: approvalStatus === 'APPROVED' ? req.user?.id : null,
      clientBillingStatus: approvalStatus === 'APPROVED' ? 'PENDING_BILLING' : 'EXCLUDED',
    },
  });

  res.json({
    success: true,
    message: `Extra expense ${approvalStatus.toLowerCase()} successfully`,
    data: { expense },
  });
};

/**
 * Generate Comprehensive Client Invoice including Contract + Approved Extra Expenses
 */
export const generateClientInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, dueDate } = req.body;

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      client: true,
      extraExpenses: { where: { approvalStatus: 'APPROVED' } },
      clientPayments: true,
    },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const invCount = await prisma.clientInvoice.count();
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(invCount + 1).padStart(4, '0')}`;

  const contractAmount = new Prisma.Decimal(wedding.contractAmount);

  // Sum approved extras
  let approvedAdditions = new Prisma.Decimal(0);
  const invoiceItemsData: Array<{ description: string; quantity: number; unitPrice: Prisma.Decimal; amount: Prisma.Decimal }> = [
    {
      description: `Contract Wedding Planning Services (${wedding.packageType}) - ${wedding.name}`,
      quantity: 1,
      unitPrice: contractAmount,
      amount: contractAmount,
    },
  ];

  wedding.extraExpenses.forEach((exp) => {
    approvedAdditions = approvedAdditions.add(exp.amount);
    invoiceItemsData.push({
      description: `Additional: ${exp.description} (${exp.category})`,
      quantity: exp.quantity,
      unitPrice: exp.unitPrice,
      amount: exp.amount,
    });
  });

  // Calculate 18% GST on subtotal
  const subtotal = contractAmount.add(approvedAdditions);
  const taxRate = new Prisma.Decimal(18);
  const taxAmount = subtotal.mul(taxRate).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  const totalAmount = subtotal.add(taxAmount);

  // Sum total payments received so far
  let totalPaid = new Prisma.Decimal(0);
  wedding.clientPayments.forEach((p) => {
    totalPaid = totalPaid.add(p.amount);
  });

  const balanceDue = totalAmount.sub(totalPaid);
  const due = dueDate ? new Date(dueDate) : addDays(new Date(), 14);

  // Generate Invoice PDF
  const pdfUrl = await generateInvoicePDF({
    invoiceNumber,
    clientNames: `${wedding.client.partner1Name} & ${wedding.client.partner2Name}`,
    clientEmail: wedding.client.email,
    clientPhone: wedding.client.phone,
    clientAddress: wedding.client.address || `${wedding.client.city || wedding.location}`,
    weddingName: wedding.name,
    contractAmount: contractAmount.toString(),
    approvedAdditions: approvedAdditions.toString(),
    discountAmount: '0',
    taxAmount: taxAmount.toString(),
    totalAmount: totalAmount.toString(),
    paidAmount: totalPaid.toString(),
    balanceDue: balanceDue.greaterThan(0) ? balanceDue.toString() : '0',
    dueDate: format(due, 'dd-MM-yyyy'),
    items: invoiceItemsData.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      amount: item.amount.toString(),
    })),
  });

  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.clientInvoice.create({
      data: {
        invoiceNumber,
        weddingId: wedding.id,
        clientId: wedding.clientId,
        contractAmount,
        approvedAdditions,
        discountAmount: new Prisma.Decimal(0),
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: totalPaid,
        balanceDue: balanceDue.greaterThan(0) ? balanceDue : new Prisma.Decimal(0),
        dueDate: due,
        status: balanceDue.lessThanOrEqualTo(0) ? 'PAID' : totalPaid.greaterThan(0) ? 'PARTIALLY_PAID' : 'ISSUED',
        pdfUrl,
        items: {
          create: invoiceItemsData,
        },
      },
      include: { items: true },
    });

    // Mark extra expenses as billed
    await tx.extraExpense.updateMany({
      where: { weddingId: wedding.id, approvalStatus: 'APPROVED' },
      data: { clientBillingStatus: 'BILLED' },
    });

    return inv;
  });

  res.status(201).json({
    success: true,
    message: 'Client invoice generated successfully',
    data: { invoice },
  });
};

export const getClientInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId } = req.query;

  const where: Prisma.ClientInvoiceWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);

  if (req.user?.role === 'CLIENT') {
    const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
    if (!client) {
      res.json({ success: true, data: { invoices: [] } });
      return;
    }
    where.clientId = client.id;
  }

  const invoices = await prisma.clientInvoice.findMany({
    where,
    orderBy: { issuedAt: 'desc' },
    include: {
      wedding: { select: { weddingCode: true, name: true } },
      client: { select: { partner1Name: true, partner2Name: true, email: true } },
      items: true,
    },
  });

  res.json({ success: true, data: { invoices } });
};
