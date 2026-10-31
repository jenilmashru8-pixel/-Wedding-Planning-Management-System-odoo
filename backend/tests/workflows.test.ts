import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/config/prisma.js';

let founderToken: string;
let plannerToken: string;
let clientToken: string;
let demoWeddingId: string;
let demoClientId: string;

beforeAll(async () => {
  // Login as Founder
  const founderRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'founder@royalknot.com', password: 'RoyalKnot@2026' });
  expect(founderRes.status).toBe(200);
  founderToken = founderRes.body.data.token;

  // Login as Planner
  const plannerRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'priya.sharma@royalknot.com', password: 'RoyalKnot@2026' });
  expect(plannerRes.status).toBe(200);
  plannerToken = plannerRes.body.data.token;

  // Login as Client
  const clientRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'aarav.kapoor@example.com', password: 'RoyalKnot@2026' });
  expect(clientRes.status).toBe(200);
  clientToken = clientRes.body.data.token;

  const wedding = await prisma.wedding.findFirst({ where: { weddingCode: 'TRK-2026-001' } });
  expect(wedding).toBeDefined();
  demoWeddingId = wedding!.id;
  demoClientId = wedding!.clientId;
});

describe('TEST 1: CRM & Enquiry Conversion Workflow', () => {
  let createdEnquiryId: string;

  it('should create a new enquiry with auto-generated enquiryNumber', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        coupleName: 'Vikram & Radhika',
        partner1Name: 'Vikram',
        partner2Name: 'Radhika',
        email: 'vikram.radhika@test.com',
        phone: '+91 99999 12345',
        source: 'INSTAGRAM',
        weddingLocation: 'Jaipur',
        preferredDate: new Date(Date.now() + 86400000 * 100).toISOString(),
        weddingDurationDays: 3,
        guestCount: 400,
        maxBudget: 35000000,
        theme: 'Heritage Royal Palace',
        packageType: 'FULL_SERVICE',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.enquiry.enquiryNumber).toMatch(/^ENQ-\d{4}-\d{3}$/);
    createdEnquiryId = res.body.data.enquiry.id;
  });

  it('should schedule a consultation for the enquiry', async () => {
    const res = await request(app)
      .post(`/api/enquiries/${createdEnquiryId}/consultation`)
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        location: 'Jaipur Studio',
        meetingNotes: 'Discussing Rambagh Palace vs Alila Fort',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.consultation.status).toBe('SCHEDULED');
  });

  it('should convert enquiry to wedding project and preserve enquiry history', async () => {
    const res = await request(app)
      .post(`/api/enquiries/${createdEnquiryId}/convert`)
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        contractAmount: 35000000,
        venueName: 'Rambagh Palace Grand Ballroom',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.wedding.weddingCode).toMatch(/^TRK-\d{4}-\d{3}$/);
    expect(res.body.data.enquiry.status).toBe('CONVERTED');

    // Idempotency: cannot convert twice
    const resDuplicate = await request(app)
      .post(`/api/enquiries/${createdEnquiryId}/convert`)
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({ contractAmount: 35000000 });
    expect(resDuplicate.status).toBe(400);
  });
});

describe('TEST 2: Digital Agreements & Immutability', () => {
  let agreementId: string;

  it('should create and send an agreement', async () => {
    const res = await request(app)
      .post('/api/agreements')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId: demoWeddingId,
        title: 'Master Service Agreement',
        scopeOfServices: 'Full palace planning and coordination',
        termsAndConditions: 'Milestones: 25%, 50%, 25%',
        totalAmount: 45000000,
      });

    expect(res.status).toBe(201);
    agreementId = res.body.data.agreement.id;

    const sendRes = await request(app)
      .post(`/api/agreements/${agreementId}/send`)
      .set('Authorization', `Bearer ${plannerToken}`);
    expect(sendRes.status).toBe(200);
    expect(sendRes.body.data.agreement.status).toBe('SENT');
  });

  it('should digitally sign the agreement and generate PDF', async () => {
    const res = await request(app)
      .post(`/api/agreements/${agreementId}/sign`)
      .send({
        signerName: 'Aarav Kapoor',
        signerEmail: 'aarav.kapoor@example.com',
        signatureImage: 'data:image/png;base64,mockSignatureBytes',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.agreement.status).toBe('SIGNED');
    expect(res.body.data.agreement.signedPdfUrl).toBeDefined();

    // Verify immutability
    const resResign = await request(app)
      .post(`/api/agreements/${agreementId}/sign`)
      .send({ signerName: 'Another Name' });
    expect(resResign.status).toBe(400);
  });
});

describe('TEST 3: Vendor Quotations & Competitor Auto-Closing', () => {
  let quoteAId: string;
  let quoteBId: string;
  let cateringCatId: string;

  beforeAll(async () => {
    const cat = await prisma.vendorCategory.findUnique({ where: { code: 'CATERING' } });
    cateringCatId = cat!.id;
  });

  it('should create quotation requests with line-item and per-plate pricing', async () => {
    const vendors = await prisma.vendor.findMany({ where: { categoryId: cateringCatId }, take: 2 });

    const resA = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId: demoWeddingId,
        vendorId: vendors[0].id,
        categoryId: cateringCatId,
        guestCount: 400,
        pricePerPlate: 2500,
        additionalStaffCost: 100000,
        taxRate: 18,
      });
    expect(resA.status).toBe(201);
    quoteAId = resA.body.data.quotation.id;

    const resB = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId: demoWeddingId,
        vendorId: vendors[1].id,
        categoryId: cateringCatId,
        guestCount: 400,
        pricePerPlate: 3000,
        additionalStaffCost: 150000,
        taxRate: 18,
      });
    expect(resB.status).toBe(201);
    quoteBId = resB.body.data.quotation.id;
  });

  it('should select one quotation and automatically close the competing quotation', async () => {
    const res = await request(app)
      .post(`/api/quotations/${quoteAId}/select`)
      .set('Authorization', `Bearer ${plannerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.quotation.status).toBe('ACCEPTED');

    // Verify competing quote B is closed
    const competingQuote = await prisma.vendorQuotation.findUnique({ where: { id: quoteBId } });
    expect(competingQuote!.status).toBe('CLOSED');
  });
});

describe('TEST 4: Automatic Task Generation & Idempotency', () => {
  it('should generate at least 35 tasks for Full-Service and reject duplicate generation', async () => {
    const wedding = await prisma.wedding.findFirst({ where: { weddingCode: 'TRK-2026-003' } });
    expect(wedding).toBeDefined();

    // Ensure clean state for test idempotency
    await prisma.weddingTask.deleteMany({ where: { weddingId: wedding!.id } });

    // First call generates tasks
    const res = await request(app)
      .post(`/api/tasks/${wedding!.id}/generate`)
      .set('Authorization', `Bearer ${plannerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.data.count).toBeGreaterThanOrEqual(35);

    // Second call must be rejected to ensure idempotency
    const resDuplicate = await request(app)
      .post(`/api/tasks/${wedding!.id}/generate`)
      .set('Authorization', `Bearer ${plannerToken}`);

    expect(resDuplicate.status).toBe(400);
    expect(resDuplicate.body.message).toContain('idempotent');
  });
});

describe('TEST 5: Wedding Day Operations & Incident Resolution', () => {
  it('should record vendor check-in and delay detection', async () => {
    const vendor = await prisma.vendor.findFirst();
    expect(vendor).toBeDefined();

    const expectedTime = new Date(Date.now() - 3600000); // 1 hour ago
    const res = await request(app)
      .post(`/api/operations/weddings/${demoWeddingId}/vendors/${vendor!.id}/check-in`)
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        expectedArrivalTime: expectedTime.toISOString(),
        delayReason: 'Traffic jam near Ajmer highway',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.checkIn.status).toBe('DELAYED');
    expect(res.body.data.checkIn.delayMinutes).toBeGreaterThan(15);
  });

  it('should report an incident and resolve it with persisted audit', async () => {
    const reportRes = await request(app)
      .post('/api/operations/incidents')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId: demoWeddingId,
        title: 'Flower Garland Shortage for Varmala',
        description: 'Need 2 extra premium fragrant rose garlands immediately.',
        severity: 'HIGH',
      });

    expect(reportRes.status).toBe(201);
    const incidentId = reportRes.body.data.incident.id;

    const resolveRes = await request(app)
      .patch(`/api/operations/incidents/${incidentId}/resolve`)
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        resolutionNotes: 'Dispatched emergency runner to local luxury florist. Received at 04:30 PM.',
      });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.incident.status).toBe('RESOLVED');
  });
});

describe('TEST 6: Guest Management & CSV', () => {
  it('should bulk import guests and calculate RSVP totals', async () => {
    const sampleGuests = [
      { firstName: 'TestGuest1', lastName: 'Family', rsvpStatus: 'CONFIRMED', dietaryPreference: 'VEG' },
      { firstName: 'TestGuest2', lastName: 'Family', rsvpStatus: 'CONFIRMED', dietaryPreference: 'JAIN' },
      { firstName: 'TestGuest3', lastName: 'Family', rsvpStatus: 'DECLINED', dietaryPreference: 'NON_VEG' },
    ];

    const res = await request(app)
      .post('/api/guests/import')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId: demoWeddingId,
        guests: sampleGuests,
      });

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(3);
  });
});

describe('TEST 7: Extra Billing & Client Invoice Calculation', () => {
  it('should add extra expense, approve it, and generate client invoice', async () => {
    const addRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId: demoWeddingId,
        category: 'CATERING',
        description: '40 Extra Banquet Plates for VIP Delegation',
        quantity: 40,
        unitPrice: 2000,
        taxRate: 18,
      });

    expect(addRes.status).toBe(201);
    const expenseId = addRes.body.data.expense.id;
    expect(Number(addRes.body.data.expense.amount)).toBe(80000);
    expect(Number(addRes.body.data.expense.taxAmount)).toBe(14400);
    expect(Number(addRes.body.data.expense.totalAmount)).toBe(94400);

    // Approve expense
    const appRes = await request(app)
      .patch(`/api/expenses/${expenseId}/approval`)
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        approvalStatus: 'APPROVED',
        clientComments: 'Confirmed by family lead',
      });
    expect(appRes.status).toBe(200);

    // Generate invoice
    const invRes = await request(app)
      .post('/api/expenses/invoices/generate')
      .set('Authorization', `Bearer ${founderToken}`)
      .send({ weddingId: demoWeddingId });

    expect(invRes.status).toBe(201);
    expect(invRes.body.data.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(invRes.body.data.invoice.pdfUrl).toBeDefined();
  });
});

describe('TEST 8: Client Payments & Duplicate Prevention', () => {
  it('should record payment and reject duplicate transaction reference', async () => {
    const uniqueRef = `TXN-TEST-${Date.now()}`;

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${founderToken}`)
      .send({
        weddingId: demoWeddingId,
        amount: 500000,
        paymentMethod: 'UPI',
        transactionRef: uniqueRef,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.payment.paymentNumber).toMatch(/^PAY-\d{4}-\d{4}$/);

    // Try recording with the exact same reference
    const dupRes = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${founderToken}`)
      .send({
        weddingId: demoWeddingId,
        amount: 500000,
        paymentMethod: 'UPI',
        transactionRef: uniqueRef,
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toContain('Duplicate transaction');
  });
});

describe('TEST 9: Vendor Settlement & Advance Tracking', () => {
  it('should record vendor payment and reject duplicate reference', async () => {
    const vendor = await prisma.vendor.findFirst();
    const vRef = `VTXN-${Date.now()}`;

    const res = await request(app)
      .post('/api/vendor-settlements/payments')
      .set('Authorization', `Bearer ${founderToken}`)
      .send({
        weddingId: demoWeddingId,
        vendorId: vendor!.id,
        amount: 250000,
        paymentMethod: 'BANK_TRANSFER',
        transactionRef: vRef,
        isAdvance: true,
      });

    expect(res.status).toBe(201);

    const dupRes = await request(app)
      .post('/api/vendor-settlements/payments')
      .set('Authorization', `Bearer ${founderToken}`)
      .send({
        weddingId: demoWeddingId,
        vendorId: vendor!.id,
        amount: 250000,
        paymentMethod: 'BANK_TRANSFER',
        transactionRef: vRef,
      });

    expect(dupRes.status).toBe(409);
  });
});

describe('TEST 10: Financial Analytics & Profitability', () => {
  it('should compute recognized revenue, costs, net profit and profit margin', async () => {
    const res = await request(app)
      .get('/api/finance/dashboard')
      .set('Authorization', `Bearer ${founderToken}`);

    expect(res.status).toBe(200);
    const { kpis, weddingBreakdowns, locationComparison } = res.body.data;

    expect(Number(kpis.totalRecognizedRevenue)).toBeGreaterThan(0);
    expect(Number(kpis.totalWeddingCosts)).toBeGreaterThan(0);
    expect(kpis.profitMargin).toBeTypeOf('number');
    expect(locationComparison.jaipur).toBeDefined();
    expect(locationComparison.udaipur).toBeDefined();
    expect(weddingBreakdowns.length).toBeGreaterThan(0);
  });
});

describe('TEST 11: Role Security & Access Control', () => {
  it('should reject unauthorized access from client to founder endpoints', async () => {
    // Client cannot access finance dashboard
    const res = await request(app)
      .get('/api/finance/dashboard')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access denied');
  });

  it('should isolate clients so they only see their own records', async () => {
    const res = await request(app)
      .get('/api/weddings')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    // Every wedding returned must match client's own ID
    res.body.data.weddings.forEach((w: any) => {
      expect(w.clientId).toBe(demoClientId);
    });
  });
});
