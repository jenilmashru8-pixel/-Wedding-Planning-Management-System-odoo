"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_js_1 = require("../src/index.js");
const prisma_js_1 = __importDefault(require("../src/config/prisma.js"));
let founderToken;
let plannerToken;
let clientToken;
let demoWeddingId;
let demoClientId;
(0, vitest_1.beforeAll)(async () => {
    // Login as Founder
    const founderRes = await (0, supertest_1.default)(index_js_1.app)
        .post('/api/auth/login')
        .send({ email: 'founder@royalknot.com', password: 'RoyalKnot@2026' });
    (0, vitest_1.expect)(founderRes.status).toBe(200);
    founderToken = founderRes.body.data.token;
    // Login as Planner
    const plannerRes = await (0, supertest_1.default)(index_js_1.app)
        .post('/api/auth/login')
        .send({ email: 'priya.sharma@royalknot.com', password: 'RoyalKnot@2026' });
    (0, vitest_1.expect)(plannerRes.status).toBe(200);
    plannerToken = plannerRes.body.data.token;
    // Login as Client
    const clientRes = await (0, supertest_1.default)(index_js_1.app)
        .post('/api/auth/login')
        .send({ email: 'aarav.kapoor@example.com', password: 'RoyalKnot@2026' });
    (0, vitest_1.expect)(clientRes.status).toBe(200);
    clientToken = clientRes.body.data.token;
    const wedding = await prisma_js_1.default.wedding.findFirst({ where: { weddingCode: 'TRK-2026-001' } });
    (0, vitest_1.expect)(wedding).toBeDefined();
    demoWeddingId = wedding.id;
    demoClientId = wedding.clientId;
});
(0, vitest_1.describe)('TEST 1: CRM & Enquiry Conversion Workflow', () => {
    let createdEnquiryId;
    (0, vitest_1.it)('should create a new enquiry with auto-generated enquiryNumber', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
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
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.enquiry.enquiryNumber).toMatch(/^ENQ-\d{4}-\d{3}$/);
        createdEnquiryId = res.body.data.enquiry.id;
    });
    (0, vitest_1.it)('should schedule a consultation for the enquiry', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/enquiries/${createdEnquiryId}/consultation`)
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
            location: 'Jaipur Studio',
            meetingNotes: 'Discussing Rambagh Palace vs Alila Fort',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.consultation.status).toBe('SCHEDULED');
    });
    (0, vitest_1.it)('should convert enquiry to wedding project and preserve enquiry history', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/enquiries/${createdEnquiryId}/convert`)
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            contractAmount: 35000000,
            venueName: 'Rambagh Palace Grand Ballroom',
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.wedding.weddingCode).toMatch(/^TRK-\d{4}-\d{3}$/);
        (0, vitest_1.expect)(res.body.data.enquiry.status).toBe('CONVERTED');
        // Idempotency: cannot convert twice
        const resDuplicate = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/enquiries/${createdEnquiryId}/convert`)
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({ contractAmount: 35000000 });
        (0, vitest_1.expect)(resDuplicate.status).toBe(400);
    });
});
(0, vitest_1.describe)('TEST 2: Digital Agreements & Immutability', () => {
    let agreementId;
    (0, vitest_1.it)('should create and send an agreement', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/agreements')
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            weddingId: demoWeddingId,
            title: 'Master Service Agreement',
            scopeOfServices: 'Full palace planning and coordination',
            termsAndConditions: 'Milestones: 25%, 50%, 25%',
            totalAmount: 45000000,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        agreementId = res.body.data.agreement.id;
        const sendRes = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/agreements/${agreementId}/send`)
            .set('Authorization', `Bearer ${plannerToken}`);
        (0, vitest_1.expect)(sendRes.status).toBe(200);
        (0, vitest_1.expect)(sendRes.body.data.agreement.status).toBe('SENT');
    });
    (0, vitest_1.it)('should digitally sign the agreement and generate PDF', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/agreements/${agreementId}/sign`)
            .send({
            signerName: 'Aarav Kapoor',
            signerEmail: 'aarav.kapoor@example.com',
            signatureImage: 'data:image/png;base64,mockSignatureBytes',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.data.agreement.status).toBe('SIGNED');
        (0, vitest_1.expect)(res.body.data.agreement.signedPdfUrl).toBeDefined();
        // Verify immutability
        const resResign = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/agreements/${agreementId}/sign`)
            .send({ signerName: 'Another Name' });
        (0, vitest_1.expect)(resResign.status).toBe(400);
    });
});
(0, vitest_1.describe)('TEST 3: Vendor Quotations & Competitor Auto-Closing', () => {
    let quoteAId;
    let quoteBId;
    let cateringCatId;
    (0, vitest_1.beforeAll)(async () => {
        const cat = await prisma_js_1.default.vendorCategory.findUnique({ where: { code: 'CATERING' } });
        cateringCatId = cat.id;
    });
    (0, vitest_1.it)('should create quotation requests with line-item and per-plate pricing', async () => {
        const vendors = await prisma_js_1.default.vendor.findMany({ where: { categoryId: cateringCatId }, take: 2 });
        const resA = await (0, supertest_1.default)(index_js_1.app)
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
        (0, vitest_1.expect)(resA.status).toBe(201);
        quoteAId = resA.body.data.quotation.id;
        const resB = await (0, supertest_1.default)(index_js_1.app)
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
        (0, vitest_1.expect)(resB.status).toBe(201);
        quoteBId = resB.body.data.quotation.id;
    });
    (0, vitest_1.it)('should select one quotation and automatically close the competing quotation', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/quotations/${quoteAId}/select`)
            .set('Authorization', `Bearer ${plannerToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.data.quotation.status).toBe('ACCEPTED');
        // Verify competing quote B is closed
        const competingQuote = await prisma_js_1.default.vendorQuotation.findUnique({ where: { id: quoteBId } });
        (0, vitest_1.expect)(competingQuote.status).toBe('CLOSED');
    });
});
(0, vitest_1.describe)('TEST 4: Automatic Task Generation & Idempotency', () => {
    (0, vitest_1.it)('should generate at least 35 tasks for Full-Service and reject duplicate generation', async () => {
        const wedding = await prisma_js_1.default.wedding.findFirst({ where: { weddingCode: 'TRK-2026-003' } });
        (0, vitest_1.expect)(wedding).toBeDefined();
        // Ensure clean state for test idempotency
        await prisma_js_1.default.weddingTask.deleteMany({ where: { weddingId: wedding.id } });
        // First call generates tasks
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/tasks/${wedding.id}/generate`)
            .set('Authorization', `Bearer ${plannerToken}`);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.count).toBeGreaterThanOrEqual(35);
        // Second call must be rejected to ensure idempotency
        const resDuplicate = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/tasks/${wedding.id}/generate`)
            .set('Authorization', `Bearer ${plannerToken}`);
        (0, vitest_1.expect)(resDuplicate.status).toBe(400);
        (0, vitest_1.expect)(resDuplicate.body.message).toContain('idempotent');
    });
});
(0, vitest_1.describe)('TEST 5: Wedding Day Operations & Incident Resolution', () => {
    (0, vitest_1.it)('should record vendor check-in and delay detection', async () => {
        const vendor = await prisma_js_1.default.vendor.findFirst();
        (0, vitest_1.expect)(vendor).toBeDefined();
        const expectedTime = new Date(Date.now() - 3600000); // 1 hour ago
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post(`/api/operations/weddings/${demoWeddingId}/vendors/${vendor.id}/check-in`)
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            expectedArrivalTime: expectedTime.toISOString(),
            delayReason: 'Traffic jam near Ajmer highway',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.data.checkIn.status).toBe('DELAYED');
        (0, vitest_1.expect)(res.body.data.checkIn.delayMinutes).toBeGreaterThan(15);
    });
    (0, vitest_1.it)('should report an incident and resolve it with persisted audit', async () => {
        const reportRes = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/operations/incidents')
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            weddingId: demoWeddingId,
            title: 'Flower Garland Shortage for Varmala',
            description: 'Need 2 extra premium fragrant rose garlands immediately.',
            severity: 'HIGH',
        });
        (0, vitest_1.expect)(reportRes.status).toBe(201);
        const incidentId = reportRes.body.data.incident.id;
        const resolveRes = await (0, supertest_1.default)(index_js_1.app)
            .patch(`/api/operations/incidents/${incidentId}/resolve`)
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            resolutionNotes: 'Dispatched emergency runner to local luxury florist. Received at 04:30 PM.',
        });
        (0, vitest_1.expect)(resolveRes.status).toBe(200);
        (0, vitest_1.expect)(resolveRes.body.data.incident.status).toBe('RESOLVED');
    });
});
(0, vitest_1.describe)('TEST 6: Guest Management & CSV', () => {
    (0, vitest_1.it)('should bulk import guests and calculate RSVP totals', async () => {
        const sampleGuests = [
            { firstName: 'TestGuest1', lastName: 'Family', rsvpStatus: 'CONFIRMED', dietaryPreference: 'VEG' },
            { firstName: 'TestGuest2', lastName: 'Family', rsvpStatus: 'CONFIRMED', dietaryPreference: 'JAIN' },
            { firstName: 'TestGuest3', lastName: 'Family', rsvpStatus: 'DECLINED', dietaryPreference: 'NON_VEG' },
        ];
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/guests/import')
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            weddingId: demoWeddingId,
            guests: sampleGuests,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.count).toBe(3);
    });
    (0, vitest_1.it)('should return guest pagination and arrival stats in the API response', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .get('/api/guests')
            .query({ weddingId: demoWeddingId, page: 1, limit: 10 })
            .set('Authorization', 'Bearer ' + founderToken);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(typeof res.body.data.pagination.total).toBe('number');
        (0, vitest_1.expect)(typeof res.body.data.stats.actualAttendees).toBe('number');
    });
    (0, vitest_1.it)('should reject imported rows without guest names instead of creating placeholders', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/guests/import')
            .set('Authorization', 'Bearer ' + founderToken)
            .send({
            weddingId: demoWeddingId,
            guests: [{ firstName: 'No Last Name' }],
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.message).toContain('Last Name');
    });
    (0, vitest_1.it)('should allow authenticated guest CSV export', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .get(`/api/guests/export/${demoWeddingId}`)
            .set('Authorization', 'Bearer ' + founderToken);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.headers['content-type']).toContain('text/csv');
    });
});
(0, vitest_1.describe)('TEST 7: Extra Billing & Client Invoice Calculation', () => {
    (0, vitest_1.it)('should add extra expense, approve it, and generate client invoice', async () => {
        const addRes = await (0, supertest_1.default)(index_js_1.app)
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
        (0, vitest_1.expect)(addRes.status).toBe(201);
        const expenseId = addRes.body.data.expense.id;
        (0, vitest_1.expect)(Number(addRes.body.data.expense.amount)).toBe(80000);
        (0, vitest_1.expect)(Number(addRes.body.data.expense.taxAmount)).toBe(14400);
        (0, vitest_1.expect)(Number(addRes.body.data.expense.totalAmount)).toBe(94400);
        // Approve expense
        const appRes = await (0, supertest_1.default)(index_js_1.app)
            .patch(`/api/expenses/${expenseId}/approval`)
            .set('Authorization', `Bearer ${plannerToken}`)
            .send({
            approvalStatus: 'APPROVED',
            clientComments: 'Confirmed by family lead',
        });
        (0, vitest_1.expect)(appRes.status).toBe(200);
        // Generate invoice
        const invRes = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/expenses/invoices/generate')
            .set('Authorization', `Bearer ${founderToken}`)
            .send({ weddingId: demoWeddingId });
        (0, vitest_1.expect)(invRes.status).toBe(201);
        (0, vitest_1.expect)(invRes.body.data.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
        (0, vitest_1.expect)(invRes.body.data.invoice.pdfUrl).toBeDefined();
    });
});
(0, vitest_1.describe)('TEST 8: Client Payments & Duplicate Prevention', () => {
    (0, vitest_1.it)('should record payment and reject duplicate transaction reference', async () => {
        const uniqueRef = `TXN-TEST-${Date.now()}`;
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/payments')
            .set('Authorization', `Bearer ${founderToken}`)
            .send({
            weddingId: demoWeddingId,
            amount: 500000,
            paymentMethod: 'UPI',
            transactionRef: uniqueRef,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.data.payment.paymentNumber).toMatch(/^PAY-\d{4}-\d{4}$/);
        // Try recording with the exact same reference
        const dupRes = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/payments')
            .set('Authorization', `Bearer ${founderToken}`)
            .send({
            weddingId: demoWeddingId,
            amount: 500000,
            paymentMethod: 'UPI',
            transactionRef: uniqueRef,
        });
        (0, vitest_1.expect)(dupRes.status).toBe(409);
        (0, vitest_1.expect)(dupRes.body.message).toContain('Duplicate transaction');
    });
});
(0, vitest_1.describe)('TEST 9: Vendor Settlement & Advance Tracking', () => {
    (0, vitest_1.it)('should record vendor payment and reject duplicate reference', async () => {
        const vendor = await prisma_js_1.default.vendor.findFirst();
        const vRef = `VTXN-${Date.now()}`;
        const res = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/vendor-settlements/payments')
            .set('Authorization', `Bearer ${founderToken}`)
            .send({
            weddingId: demoWeddingId,
            vendorId: vendor.id,
            amount: 250000,
            paymentMethod: 'BANK_TRANSFER',
            transactionRef: vRef,
            isAdvance: true,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        const dupRes = await (0, supertest_1.default)(index_js_1.app)
            .post('/api/vendor-settlements/payments')
            .set('Authorization', `Bearer ${founderToken}`)
            .send({
            weddingId: demoWeddingId,
            vendorId: vendor.id,
            amount: 250000,
            paymentMethod: 'BANK_TRANSFER',
            transactionRef: vRef,
        });
        (0, vitest_1.expect)(dupRes.status).toBe(409);
    });
});
(0, vitest_1.describe)('TEST 10: Financial Analytics & Profitability', () => {
    (0, vitest_1.it)('should compute recognized revenue, costs, net profit and profit margin', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .get('/api/finance/dashboard')
            .set('Authorization', `Bearer ${founderToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        const { kpis, weddingBreakdowns, locationComparison } = res.body.data;
        (0, vitest_1.expect)(Number(kpis.totalRecognizedRevenue)).toBeGreaterThan(0);
        (0, vitest_1.expect)(Number(kpis.totalWeddingCosts)).toBeGreaterThan(0);
        (0, vitest_1.expect)(kpis.profitMargin).toBeTypeOf('number');
        (0, vitest_1.expect)(locationComparison.jaipur).toBeDefined();
        (0, vitest_1.expect)(locationComparison.udaipur).toBeDefined();
        (0, vitest_1.expect)(weddingBreakdowns.length).toBeGreaterThan(0);
    });
});
(0, vitest_1.describe)('TEST 11: Role Security & Access Control', () => {
    (0, vitest_1.it)('should reject unauthorized access from client to founder endpoints', async () => {
        // Client cannot access finance dashboard
        const res = await (0, supertest_1.default)(index_js_1.app)
            .get('/api/finance/dashboard')
            .set('Authorization', `Bearer ${clientToken}`);
        (0, vitest_1.expect)(res.status).toBe(403);
        (0, vitest_1.expect)(res.body.message).toContain('Access denied');
    });
    (0, vitest_1.it)('should isolate clients so they only see their own records', async () => {
        const res = await (0, supertest_1.default)(index_js_1.app)
            .get('/api/weddings')
            .set('Authorization', `Bearer ${clientToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        // Every wedding returned must match client's own ID
        res.body.data.weddings.forEach((w) => {
            (0, vitest_1.expect)(w.clientId).toBe(demoClientId);
        });
    });
});
