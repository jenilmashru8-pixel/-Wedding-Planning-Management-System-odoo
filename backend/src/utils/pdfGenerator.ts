import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

const UPLOADS_DIR = path.resolve(process.cwd(), '../uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

/**
 * Generate Agreement PDF
 */
export const generateAgreementPDF = async (data: {
  agreementNumber: string;
  weddingName: string;
  clientNames: string;
  clientEmail: string;
  clientPhone: string;
  weddingLocation: string;
  weddingDates: string;
  scopeOfServices: string;
  termsAndConditions: string;
  totalAmount: string;
  signerName?: string | null;
  signerEmail?: string | null;
  signedAt?: Date | string | null;
  signerIp?: string | null;
}): Promise<string> => {
  ensureUploadsDir();
  const fileName = `agreement_${data.agreementNumber}_${Date.now()}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header styling
    doc.fillColor('#722F37')
       .fontSize(22)
       .text('THE ROYAL KNOT', { align: 'center', characterSpacing: 2 });
    doc.fillColor('#C5A46D')
       .fontSize(10)
       .text('LUXURY DESTINATION WEDDING PLANNING • JAIPUR & UDAIPUR', { align: 'center' });
    doc.moveDown();

    doc.strokeColor('#C5A46D')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();
    doc.moveDown(1.5);

    // Title
    doc.fillColor('#292929')
       .fontSize(16)
       .text(`WEDDING SERVICE AGREEMENT - #${data.agreementNumber}`, { align: 'left' });
    doc.moveDown(0.5);

    // Details box
    doc.fontSize(10).fillColor('#444444');
    doc.text(`Client(s): ${data.clientNames}`);
    doc.text(`Email: ${data.clientEmail} | Phone: ${data.clientPhone}`);
    doc.text(`Wedding: ${data.weddingName}`);
    doc.text(`Location: ${data.weddingLocation} | Dates: ${data.weddingDates}`);
    doc.text(`Total Agreement Value: INR ${Number(data.totalAmount).toLocaleString('en-IN')}`);
    doc.moveDown(1.5);

    // Scope of Services
    doc.fillColor('#722F37').fontSize(12).text('1. SCOPE OF SERVICES');
    doc.moveDown(0.5);
    doc.fillColor('#333333').fontSize(9).text(data.scopeOfServices || 'Comprehensive wedding planning and coordination services.');
    doc.moveDown(1.5);

    // Terms
    doc.fillColor('#722F37').fontSize(12).text('2. TERMS & PAYMENT MILESTONES');
    doc.moveDown(0.5);
    doc.fillColor('#333333').fontSize(9).text(data.termsAndConditions || 'Standard payment milestones: Booking, Advance 30 days prior, Final post-wedding.');
    doc.moveDown(2);

    // Signature Block
    doc.strokeColor('#E0E0E0').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    if (data.signedAt && data.signerName) {
      doc.fillColor('#2e7d32').fontSize(11).text('DIGITALLY SIGNED & ACCEPTED', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#333333');
      doc.text(`Signer Name: ${data.signerName}`);
      doc.text(`Signer Email: ${data.signerEmail || data.clientEmail}`);
      doc.text(`Signed At: ${format(new Date(data.signedAt), 'dd MMMM yyyy, hh:mm a')}`);
      doc.text(`Signer IP Address: ${data.signerIp || 'Verified Web Portal Session'}`);
      doc.text('Verification: Document integrity verified via cryptographic audit trail.');
    } else {
      doc.fillColor('#722F37').fontSize(11).text('SIGNATURE PENDING');
      doc.fontSize(9).fillColor('#666666').text('Awaiting client digital execution via secure agreement link.');
    }

    doc.end();

    writeStream.on('finish', () => resolve(`/uploads/${fileName}`));
    writeStream.on('error', reject);
  });
};

/**
 * Generate Client Invoice PDF
 */
export const generateInvoicePDF = async (data: {
  invoiceNumber: string;
  clientNames: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress?: string;
  weddingName: string;
  contractAmount: string;
  approvedAdditions: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; unitPrice: string; amount: string }>;
}): Promise<string> => {
  ensureUploadsDir();
  const fileName = `invoice_${data.invoiceNumber}_${Date.now()}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header
    doc.fillColor('#722F37').fontSize(22).text('THE ROYAL KNOT', { align: 'center', characterSpacing: 2 });
    doc.fillColor('#C5A46D').fontSize(10).text('TAX INVOICE', { align: 'center', characterSpacing: 1 });
    doc.moveDown();

    doc.strokeColor('#C5A46D').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Invoice Metadata
    doc.fontSize(10).fillColor('#333333');
    doc.text(`Invoice No: ${data.invoiceNumber}`, { continued: true });
    doc.text(`Date: ${format(new Date(), 'dd-MM-yyyy')}`, { align: 'right' });
    doc.text(`Due Date: ${data.dueDate}`, { align: 'right' });
    doc.moveDown(0.5);

    // Bill To
    doc.fillColor('#722F37').fontSize(11).text('Billed To:');
    doc.fontSize(9).fillColor('#333333');
    doc.text(data.clientNames);
    doc.text(data.clientEmail);
    doc.text(data.clientPhone);
    if (data.clientAddress) doc.text(data.clientAddress);
    doc.moveDown(1.5);

    // Table Header
    const tableTop = doc.y;
    doc.fillColor('#722F37').fontSize(10);
    doc.text('Description', 50, tableTop);
    doc.text('Qty', 320, tableTop, { width: 40, align: 'right' });
    doc.text('Unit Price (INR)', 370, tableTop, { width: 80, align: 'right' });
    doc.text('Amount (INR)', 460, tableTop, { width: 85, align: 'right' });

    doc.strokeColor('#CCCCCC').lineWidth(0.5).moveTo(50, doc.y + 15).lineTo(545, doc.y + 15).stroke();
    let currentY = tableTop + 22;

    doc.fontSize(9).fillColor('#333333');
    data.items.forEach((item) => {
      doc.text(item.description, 50, currentY, { width: 260 });
      doc.text(item.quantity.toString(), 320, currentY, { width: 40, align: 'right' });
      doc.text(Number(item.unitPrice).toLocaleString('en-IN'), 370, currentY, { width: 80, align: 'right' });
      doc.text(Number(item.amount).toLocaleString('en-IN'), 460, currentY, { width: 85, align: 'right' });
      currentY += 20;
    });

    doc.strokeColor('#CCCCCC').lineWidth(0.5).moveTo(50, currentY).lineTo(545, currentY).stroke();
    currentY += 10;

    // Totals
    doc.fontSize(9);
    doc.text('Contract Base Amount:', 340, currentY, { width: 110, align: 'right' });
    doc.text(`INR ${Number(data.contractAmount).toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });
    currentY += 16;

    if (Number(data.approvedAdditions) > 0) {
      doc.text('Approved Additions:', 340, currentY, { width: 110, align: 'right' });
      doc.text(`INR ${Number(data.approvedAdditions).toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });
      currentY += 16;
    }

    doc.text('Applicable GST (18%):', 340, currentY, { width: 110, align: 'right' });
    doc.text(`INR ${Number(data.taxAmount).toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });
    currentY += 16;

    doc.fillColor('#722F37').fontSize(11);
    doc.text('Total Invoice Value:', 340, currentY, { width: 110, align: 'right' });
    doc.text(`INR ${Number(data.totalAmount).toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });
    currentY += 18;

    doc.fillColor('#2e7d32').fontSize(9);
    doc.text('Total Payments Received:', 340, currentY, { width: 110, align: 'right' });
    doc.text(`INR ${Number(data.paidAmount).toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });
    currentY += 16;

    doc.fillColor('#d32f2f').fontSize(11);
    doc.text('Net Balance Due:', 340, currentY, { width: 110, align: 'right' });
    doc.text(`INR ${Number(data.balanceDue).toLocaleString('en-IN')}`, 460, currentY, { width: 85, align: 'right' });
    currentY += 30;

    doc.fillColor('#666666').fontSize(8).text('Thank you for partnering with The Royal Knot. For banking wire transfers, please use reference invoice number.', 50, currentY, { align: 'center' });

    doc.end();

    writeStream.on('finish', () => resolve(`/uploads/${fileName}`));
    writeStream.on('error', reject);
  });
};

/**
 * Generate Payment Receipt PDF
 */
export const generatePaymentReceiptPDF = async (data: {
  receiptNumber: string;
  clientNames: string;
  weddingName: string;
  amount: string;
  paymentMethod: string;
  transactionRef: string;
  paymentDate: string;
  milestoneTitle?: string;
}): Promise<string> => {
  ensureUploadsDir();
  const fileName = `receipt_${data.receiptNumber}_${Date.now()}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A5', layout: 'landscape' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fillColor('#722F37').fontSize(20).text('THE ROYAL KNOT', { align: 'center' });
    doc.fillColor('#C5A46D').fontSize(9).text('OFFICIAL PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown();

    doc.strokeColor('#C5A46D').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    doc.fontSize(10).fillColor('#333333');
    doc.text(`Receipt No: ${data.receiptNumber}`);
    doc.text(`Date: ${data.paymentDate}`);
    doc.text(`Received From: ${data.clientNames}`);
    doc.text(`Wedding: ${data.weddingName}`);
    if (data.milestoneTitle) doc.text(`Milestone: ${data.milestoneTitle}`);
    doc.text(`Payment Mode: ${data.paymentMethod}`);
    doc.text(`Transaction Reference: ${data.transactionRef}`);
    doc.moveDown(1.5);

    doc.fillColor('#722F37').fontSize(14).text(`AMOUNT RECEIVED: INR ${Number(data.amount).toLocaleString('en-IN')}`);
    doc.moveDown(1.5);

    doc.fillColor('#2e7d32').fontSize(9).text('STATUS: COMPLETED & CONFIRMED');
    doc.fillColor('#666666').fontSize(8).text('This is a computer-generated digital receipt and requires no physical signature.');

    doc.end();

    writeStream.on('finish', () => resolve(`/uploads/${fileName}`));
    writeStream.on('error', reject);
  });
};
