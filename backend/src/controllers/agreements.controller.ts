import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateAgreementPDF } from '../utils/pdfGenerator.js';
import { Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';

export const getAgreements = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, status } = req.query;

  const where: Prisma.AgreementWhereInput = {};
  if (weddingId) where.weddingId = String(weddingId);
  if (status) where.status = status as any;

  if (req.user?.role === 'CLIENT') {
    const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
    if (!client) {
      res.json({ success: true, data: { agreements: [] } });
      return;
    }
    where.clientId = client.id;
  }

  const agreements = await prisma.agreement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { partner1Name: true, partner2Name: true, email: true, phone: true } },
      wedding: { select: { weddingCode: true, name: true, location: true } },
    },
  });

  res.json({
    success: true,
    data: { agreements },
  });
};

export const getAgreementById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      client: true,
      wedding: true,
      versions: { orderBy: { versionNumber: 'desc' } },
    },
  });

  if (!agreement) {
    res.status(404).json({ success: false, message: 'Agreement not found' });
    return;
  }

  res.json({
    success: true,
    data: { agreement },
  });
};

export const createAgreement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { weddingId, title, scopeOfServices, termsAndConditions, totalAmount } = req.body;

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: { client: true },
  });

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const count = await prisma.agreement.count();
  const year = new Date().getFullYear();
  const agreementNumber = `AGR-${year}-${String(count + 1).padStart(3, '0')}`;

  const agreement = await prisma.agreement.create({
    data: {
      agreementNumber,
      weddingId,
      clientId: wedding.clientId,
      title: title || `${wedding.name} Planning Agreement`,
      status: 'DRAFT',
      scopeOfServices: scopeOfServices || 'Full-Service Royal Wedding Planning, Venue Design, Coordination, and Vendor Management.',
      termsAndConditions: termsAndConditions || 'Payment Schedule: 25% Booking Deposit, 50% Advance 30 Days Prior, 25% Final Settlement Post Wedding.',
      totalAmount: new Prisma.Decimal(totalAmount || wedding.contractAmount),
    },
  });

  res.status(201).json({
    success: true,
    data: { agreement },
  });
};

export const sendAgreement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: { client: true, wedding: true },
  });

  if (!agreement) {
    res.status(404).json({ success: false, message: 'Agreement not found' });
    return;
  }

  // Pre-generate draft PDF
  const pdfUrl = await generateAgreementPDF({
    agreementNumber: agreement.agreementNumber,
    weddingName: agreement.wedding.name,
    clientNames: `${agreement.client.partner1Name} & ${agreement.client.partner2Name}`,
    clientEmail: agreement.client.email,
    clientPhone: agreement.client.phone,
    weddingLocation: agreement.wedding.location,
    weddingDates: `${agreement.wedding.startDate.toDateString()} to ${agreement.wedding.endDate.toDateString()}`,
    scopeOfServices: agreement.scopeOfServices,
    termsAndConditions: agreement.termsAndConditions,
    totalAmount: agreement.totalAmount.toString(),
  });

  const updated = await prisma.agreement.update({
    where: { id },
    data: {
      status: 'SENT',
      signedPdfUrl: pdfUrl,
    },
  });

  res.json({
    success: true,
    message: 'Agreement sent to client successfully',
    data: { agreement: updated, signLink: `/sign/${agreement.id}` },
  });
};

/**
 * Sign Agreement (Immutable once signed)
 */
export const signAgreement = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { signerName, signerEmail, signatureImage } = req.body;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: { client: true, wedding: true },
  });

  if (!agreement) {
    res.status(404).json({ success: false, message: 'Agreement not found' });
    return;
  }

  if (agreement.status === 'SIGNED') {
    res.status(400).json({ success: false, message: 'Agreement is already signed and immutable.' });
    return;
  }

  const signerIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const signedAt = new Date();

  // Generate finalized signed PDF with signature watermark
  const signedPdfUrl = await generateAgreementPDF({
    agreementNumber: agreement.agreementNumber,
    weddingName: agreement.wedding.name,
    clientNames: `${agreement.client.partner1Name} & ${agreement.client.partner2Name}`,
    clientEmail: agreement.client.email,
    clientPhone: agreement.client.phone,
    weddingLocation: agreement.wedding.location,
    weddingDates: `${agreement.wedding.startDate.toDateString()} to ${agreement.wedding.endDate.toDateString()}`,
    scopeOfServices: agreement.scopeOfServices,
    termsAndConditions: agreement.termsAndConditions,
    totalAmount: agreement.totalAmount.toString(),
    signerName: signerName || `${agreement.client.partner1Name} & ${agreement.client.partner2Name}`,
    signerEmail: signerEmail || agreement.client.email,
    signedAt,
    signerIp,
  });

  const updated = await prisma.agreement.update({
    where: { id },
    data: {
      status: 'SIGNED',
      signedAt,
      signerName: signerName || `${agreement.client.partner1Name} & ${agreement.client.partner2Name}`,
      signerEmail: signerEmail || agreement.client.email,
      signerIp,
      signatureImage,
      signedPdfUrl,
    },
  });

  res.json({
    success: true,
    message: 'Agreement digitally signed successfully',
    data: { agreement: updated },
  });
};

export const downloadAgreementPdf = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const agreement = await prisma.agreement.findUnique({ where: { id } });
  if (!agreement || !agreement.signedPdfUrl) {
    res.status(404).json({ success: false, message: 'Signed PDF not generated yet' });
    return;
  }

  const relativePath = agreement.signedPdfUrl.replace(/^\/uploads\//, '');
  const filePath = path.resolve(process.cwd(), '../uploads', relativePath);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'PDF file not found on disk' });
    return;
  }

  res.download(filePath, `Agreement_${agreement.agreementNumber}.pdf`);
};
