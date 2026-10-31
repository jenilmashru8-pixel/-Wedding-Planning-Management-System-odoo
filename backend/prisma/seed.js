"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const date_fns_1 = require("date-fns");
const taskTemplates_js_1 = require("../src/utils/taskTemplates.js");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding The Royal Knot Database...');
    // Clear existing records to ensure clean seed
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.document.deleteMany();
    await prisma.vendorFeedback.deleteMany();
    await prisma.employeeTimeLog.deleteMany();
    await prisma.operationalExpense.deleteMany();
    await prisma.vendorPayment.deleteMany();
    await prisma.vendorInvoice.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.clientInvoice.deleteMany();
    await prisma.extraExpense.deleteMany();
    await prisma.clientPayment.deleteMany();
    await prisma.paymentMilestone.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.vendorCheckIn.deleteMany();
    await prisma.weddingEvent.deleteMany();
    await prisma.taskDependency.deleteMany();
    await prisma.weddingTask.deleteMany();
    await prisma.vendorBooking.deleteMany();
    await prisma.vendorQuotation.deleteMany();
    await prisma.agreementVersion.deleteMany();
    await prisma.agreement.deleteMany();
    await prisma.wedding.deleteMany();
    await prisma.weddingPackage.deleteMany();
    await prisma.consultation.deleteMany();
    await prisma.enquiry.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.vendorCategory.deleteMany();
    await prisma.client.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemSetting.deleteMany();
    const passwordHash = await bcryptjs_1.default.hash('RoyalKnot@2026', 10);
    // 1. Create Users
    const founder = await prisma.user.create({
        data: {
            email: 'founder@royalknot.com',
            passwordHash,
            firstName: 'Rajesh',
            lastName: 'Singhania',
            phone: '+91 98290 11001',
            role: 'FOUNDER',
            isActive: true,
            employee: {
                create: {
                    designation: 'Managing Director & Founder',
                    hourlyRate: 2500,
                    emergencyContact: '+91 98290 11000',
                },
            },
        },
    });
    const planner1 = await prisma.user.create({
        data: {
            email: 'priya.sharma@royalknot.com',
            passwordHash,
            firstName: 'Priya',
            lastName: 'Sharma',
            phone: '+91 98290 22002',
            role: 'PLANNER',
            isActive: true,
            employee: {
                create: {
                    designation: 'Senior Luxury Wedding Planner',
                    hourlyRate: 1200,
                    emergencyContact: '+91 98290 22000',
                },
            },
        },
    });
    const planner2 = await prisma.user.create({
        data: {
            email: 'rahul.mehta@royalknot.com',
            passwordHash,
            firstName: 'Rahul',
            lastName: 'Mehta',
            phone: '+91 98290 33003',
            role: 'PLANNER',
            isActive: true,
            employee: {
                create: {
                    designation: 'Lead Destination Coordinator',
                    hourlyRate: 1000,
                    emergencyContact: '+91 98290 33000',
                },
            },
        },
    });
    const financeMgr = await prisma.user.create({
        data: {
            email: 'amit.verma@royalknot.com',
            passwordHash,
            firstName: 'Amit',
            lastName: 'Verma',
            phone: '+91 98290 44004',
            role: 'FINANCE',
            isActive: true,
            employee: {
                create: {
                    designation: 'Finance & Commercials Manager',
                    hourlyRate: 1500,
                    emergencyContact: '+91 98290 44000',
                },
            },
        },
    });
    const fieldCoord1 = await prisma.user.create({
        data: {
            email: 'vikram.singh@royalknot.com',
            passwordHash,
            firstName: 'Vikram',
            lastName: 'Singh',
            phone: '+91 98290 55005',
            role: 'FIELD_COORDINATOR',
            isActive: true,
            employee: {
                create: {
                    designation: 'On-Site Operations Lead (Udaipur)',
                    hourlyRate: 750,
                    emergencyContact: '+91 98290 55000',
                },
            },
        },
    });
    const fieldCoord2 = await prisma.user.create({
        data: {
            email: 'ananya.sen@royalknot.com',
            passwordHash,
            firstName: 'Ananya',
            lastName: 'Sen',
            phone: '+91 98290 66006',
            role: 'FIELD_COORDINATOR',
            isActive: true,
            employee: {
                create: {
                    designation: 'Hospitality & Protocol Lead (Jaipur)',
                    hourlyRate: 750,
                    emergencyContact: '+91 98290 66000',
                },
            },
        },
    });
    const clientUser = await prisma.user.create({
        data: {
            email: 'aarav.kapoor@example.com',
            passwordHash,
            firstName: 'Aarav',
            lastName: 'Kapoor',
            phone: '+91 98111 88899',
            role: 'CLIENT',
            isActive: true,
        },
    });
    const vendorUser = await prisma.user.create({
        data: {
            email: 'royal.caterers@example.com',
            passwordHash,
            firstName: 'Kailash',
            lastName: 'Maharaj',
            phone: '+91 98280 77112',
            role: 'VENDOR',
            isActive: true,
        },
    });
    console.log('✓ Users created for all 6 roles');
    // 2. Vendor Categories
    const categoriesData = [
        { code: 'CATERING', name: 'Catering & Banquets', description: 'Royal Rajasthani, Marwari, Global & Fusion Fine Dining' },
        { code: 'DECORATION', name: 'Theme & Floral Decoration', description: 'Palace Mandaps, Luxury Lighting & Grand Stage Installations' },
        { code: 'PHOTOGRAPHY', name: 'Photography & Candid Film', description: 'Pre-wedding, Drone Cinema & Same-Day Edits' },
        { code: 'VIDEOGRAPHY', name: 'Cinematography & Live Broadcast', description: '4K Multi-cam, Drone Cinema & Satellite Streaming' },
        { code: 'MAKEUP', name: 'Bridal Makeup & Styling', description: 'Celebrity MUAs, Hair Artists & Draping Experts' },
        { code: 'DJ', name: 'DJ & Sound Experience', description: 'Club Sound, Line Array, Visual Haze & Laser Sync' },
        { code: 'MUSICIANS', name: 'Live Folk & Classical Artists', description: 'Royal Shehnai, Nagada, Sufi Bands & Manganiyar Troupes' },
        { code: 'FLORISTS', name: 'Exotic Florals & Garlands', description: 'Dutch Roses, Orchids, Jaimala & Phoolon Ki Chaadar' },
        { code: 'VENUE', name: 'Palace & Heritage Venues', description: 'Heritage Palaces, Jagmandir, City Palace & Fort Resorts' },
        { code: 'TRANSPORTATION', name: 'Luxury Fleets & Vintage Cars', description: 'Rolls Royce, Vintage convertibles & Luxury Mercedes Coaches' },
        { code: 'LIGHTING', name: 'Architectural Lighting & Generators', description: 'Heritage Facade Projection, Fairy Lights & Silent Generators' },
        { code: 'SOUND', name: 'Audio Engineering & Acoustics', description: 'Acoustic Sound Consoles, Wireless Mics & In-ear Monitors' },
        { code: 'ACCOMMODATION', name: 'Hospitality & Luxury Suites', description: '5-Star Hotel Room Blocks & Guest Welcome Lounges' },
        { code: 'SECURITY', name: 'VIP Security & Bouncers', description: 'Armed Guards, Escort Vehicles & Crowd Flow Officers' },
        { code: 'EVENT_MANAGEMENT', name: 'Production & Stage Engineering', description: 'Hydraulic Stages, Trussing & Fire Permits' },
        { code: 'OTHER', name: 'Artisan & Trousseau Gifts', description: 'Customized Safas, Mehendi Artists, Silver Favors' },
    ];
    const categories = {};
    for (const cat of categoriesData) {
        categories[cat.code] = await prisma.vendorCategory.create({ data: cat });
    }
    console.log('✓ 16 Vendor Categories created');
    // 3. Create at least 18 Vendors
    const vendorsList = [
        { companyName: 'Royal Mewar Gourmet Catering', contactPerson: 'Kailash Maharaj', phone: '+91 98280 77112', email: 'royal.caterers@example.com', categoryId: categories['CATERING'].id, location: 'Udaipur', services: ['Royal Rajasthani Thali', 'Live Chaat Counter', 'Global Gourmet', 'Jain Specialty'], gstNumber: '08AAACR1234F1Z1', rating: 4.9, userId: vendorUser.id },
        { companyName: 'Rajputana Feasts & Hospitality', contactPerson: 'Manish Rathore', phone: '+91 98280 77113', email: 'rajputana.feasts@example.com', categoryId: categories['CATERING'].id, location: 'Jaipur', services: ['Dal Baati Churma', 'Live BBQ & Grills', 'Continental Buffets'], gstNumber: '08BBBCR5678F1Z2', rating: 4.7 },
        { companyName: 'Imperial Banquet Specialists', contactPerson: 'Sanjay Chordia', phone: '+91 98280 77114', email: 'imperial.caterers@example.com', categoryId: categories['CATERING'].id, location: 'Jaipur', services: ['Pan-Asian Counter', 'Wood-fired Pizza', 'Artisan Desserts'], gstNumber: '08CCCCR9012F1Z3', rating: 4.6 },
        { companyName: 'Virasat Luxury Decor & Florals', contactPerson: 'Deepak Shekhawat', phone: '+91 98280 77115', email: 'virasat.decor@example.com', categoryId: categories['DECORATION'].id, location: 'Jaipur', services: ['Palace Mandap Decor', 'Fairy Light Tunnels', 'Floral Chandelier'], gstNumber: '08DDDDD1122F1Z4', rating: 4.8 },
        { companyName: 'Stories by Candid Tales Photography', contactPerson: 'Arjun Nambiar', phone: '+91 98280 77116', email: 'stories.candid@example.com', categoryId: categories['PHOTOGRAPHY'].id, location: 'Udaipur', services: ['Candid Wedding Stills', 'Pre-wedding Shoots', 'Drone Aerials'], gstNumber: '08EEEEE3344F1Z5', rating: 4.9 },
        { companyName: 'Cinematic Royal Memories', contactPerson: 'Rohan Deshmukh', phone: '+91 98280 77117', email: 'cinematic.memories@example.com', categoryId: categories['VIDEOGRAPHY'].id, location: 'Udaipur', services: ['4K Wedding Films', 'Same Day Edit', 'Teaser Reel'], gstNumber: '08FFFFF5566F1Z6', rating: 4.8 },
        { companyName: 'Glamour by Natasha Bridal Studio', contactPerson: 'Natasha Luthra', phone: '+91 98280 77118', email: 'natasha.bridal@example.com', categoryId: categories['MAKEUP'].id, location: 'Jaipur', services: ['HD Airbrush Makeup', 'Hairstyling', 'Family Draping'], gstNumber: '08GGGGG7788F1Z7', rating: 4.9 },
        { companyName: 'DJ Shadow & Sonic Wave Sound', contactPerson: 'Samir Khan', phone: '+91 98280 77119', email: 'sonicwave.dj@example.com', categoryId: categories['DJ'].id, location: 'Jaipur', services: ['DJ Sound Rig', 'Cold Pyro', 'CO2 Jets', 'Laser Light Show'], gstNumber: '08HHHHH9900F1Z8', rating: 4.5 },
        { companyName: 'Desert Symphony Rajasthani Folk Ensemble', contactPerson: 'Gazi Khan Manganiyar', phone: '+91 98280 77120', email: 'desert.symphony@example.com', categoryId: categories['MUSICIANS'].id, location: 'Udaipur', services: ['Royal Shehnai', 'Manganiyar Folk', 'Dhol Tasha Troupe'], gstNumber: '08IIIII1212F1Z9', rating: 5.0 },
        { companyName: 'Bloom & Petals Floral Couturiers', contactPerson: 'Simran Walia', phone: '+91 98280 77121', email: 'bloom.petals@example.com', categoryId: categories['FLORISTS'].id, location: 'Udaipur', services: ['Imported Roses', 'Jaimala Garlands', 'Scented Mogra Canopies'], gstNumber: '08JJJJJ3434F1Z0', rating: 4.8 },
        { companyName: 'City Palace & Jagmandir Island Heritage', contactPerson: 'Kunwar Ranvijay', phone: '+91 98280 77122', email: 'citypalace.events@example.com', categoryId: categories['VENUE'].id, location: 'Udaipur', services: ['Island Courtyard', 'Heritage Durbar Hall', 'Promenade Lawn'], gstNumber: '08KKKKK5656F1Z1', rating: 5.0 },
        { companyName: 'Royal Rajasthan Vintage Fleet', contactPerson: 'Sultan Singh', phone: '+91 98280 77123', email: 'vintage.fleet@example.com', categoryId: categories['TRANSPORTATION'].id, location: 'Udaipur', services: ['1934 Rolls Royce', 'Vintage Convertibles', 'Luxury Volvo Coaches'], gstNumber: '08LLLLL7878F1Z2', rating: 4.7 },
        { companyName: 'BrightNight Power & Architectural Light', contactPerson: 'Harish Purohit', phone: '+91 98280 77124', email: 'brightnight.light@example.com', categoryId: categories['LIGHTING'].id, location: 'Udaipur', services: ['Silent Gensets 250kVA', 'Façade Wash', 'Ambient Landscape Lights'], gstNumber: '08MMMMM9090F1Z3', rating: 4.6 },
        { companyName: 'Acoustic Arena Concert Systems', contactPerson: 'Sunil Pillai', phone: '+91 98280 77125', email: 'acoustic.arena@example.com', categoryId: categories['SOUND'].id, location: 'Jaipur', services: ['JBL Line Array', 'Shure Digital Mics', 'Stage Monitors'], gstNumber: '08NNNNN1313F1Z4', rating: 4.8 },
        { companyName: 'The Oberoi Udaivilas Luxury Rooms', contactPerson: 'Devendra Rawat', phone: '+91 98280 77126', email: 'udaivilas.rooms@example.com', categoryId: categories['ACCOMMODATION'].id, location: 'Udaipur', services: ['Premier Lake View Rooms', 'Luxury Suites', 'Butler Service'], gstNumber: '08OOOOO2424F1Z5', rating: 5.0 },
        { companyName: 'Black Panther VIP Security Command', contactPerson: 'Capt. R. K. Bhati', phone: '+91 98280 77127', email: 'blackpanther.security@example.com', categoryId: categories['SECURITY'].id, location: 'Jaipur', services: ['Executive Protection', 'Entry Barricades', 'Bouncer Squads'], gstNumber: '08PPPPP3535F1Z6', rating: 4.9 },
        { companyName: 'GrandStage Production & Rigging', contactPerson: 'Girish Dave', phone: '+91 98280 77128', email: 'grandstage.rigging@example.com', categoryId: categories['EVENT_MANAGEMENT'].id, location: 'Jaipur', services: ['Hydraulic Revolving Mandap', 'Aluminum Box Truss', 'LED Video Walls'], gstNumber: '08QQQQQ4646F1Z7', rating: 4.7 },
        { companyName: 'Rajputana Safa & Trousseau Artisans', contactPerson: 'Bhawani Joshi', phone: '+91 98280 77129', email: 'rajputana.safa@example.com', categoryId: categories['OTHER'].id, location: 'Jaipur', services: ['Hand-tied Bandhej Safas', 'Mehendi Artist Squad', 'Silver Welcome Hampers'], gstNumber: '08RRRRR5757F1Z8', rating: 4.9 },
    ];
    const vendors = {};
    for (const v of vendorsList) {
        vendors[v.companyName] = await prisma.vendor.create({
            data: {
                companyName: v.companyName,
                contactPerson: v.contactPerson,
                phone: v.phone,
                email: v.email,
                categoryId: v.categoryId,
                location: v.location,
                services: v.services,
                gstNumber: v.gstNumber,
                bankName: 'HDFC Bank Ltd',
                bankAccount: '50200034567890',
                bankIfsc: 'HDFC0000123',
                bankBranch: 'M.I. Road, Jaipur',
                rating: v.rating,
                userId: v.userId || null,
            },
        });
    }
    console.log(`✓ ${vendorsList.length} Vendors created across all categories`);
    // 4. Client Record
    const client = await prisma.client.create({
        data: {
            userId: clientUser.id,
            partner1Name: 'Aarav',
            partner2Name: 'Meera',
            email: 'aarav.kapoor@example.com',
            phone: '+91 98111 88899',
            altPhone: '+91 98111 88800',
            address: 'Plot 42, Malabar Hill',
            city: 'Mumbai',
            notes: 'High-profile luxury couple looking for 3-day royal destination wedding in Udaipur.',
        },
    });
    // 5. Wedding Packages
    const fullServicePkg = await prisma.weddingPackage.create({
        data: {
            code: 'PKG-FULL',
            name: 'The Royal Sovereign Full-Service Experience',
            description: 'End-to-end royal wedding planning, venue lock, 3D theme design, 18+ vendor coordination, RSVP management, and full production.',
            basePrice: 50000000, // 5 Crores
            isFullService: true,
            features: ['Dedicated Lead Planner & 4 Coordinators', 'Palace Venue Booking & Permits', 'Full-scale Floral & Lighting Design', '18 Vendor Procurements & Contract Auditing', '400+ Guest Hospitality Management', 'Live Operations & Incident Management'],
        },
    });
    const dayOfPkg = await prisma.weddingPackage.create({
        data: {
            code: 'PKG-DAYOF',
            name: 'Royal Heritage Day-of Coordination',
            description: 'Execution-focused service for couples with vendor contracts finalized. Minute-by-minute schedule, vendor check-ins, and on-site direction.',
            basePrice: 15000000, // 1.5 Crores
            isFullService: false,
            features: ['Live Minute-by-minute Master Timeline', 'Vendor Check-in & Delay Detection', 'Baraat & Ceremony Crowd Flow', 'Emergency Incident Triage', 'Vendor Checkout & Extra Bill Reconciliation'],
        },
    });
    // 6. Complete Demonstration Wedding Project (The Royal Knot Masterpiece)
    // Udaipur, 3 Days, 400+ Guests, 18 Vendors
    const demoStartDate = (0, date_fns_1.addDays)(new Date(), 45);
    const demoEndDate = (0, date_fns_1.addDays)(demoStartDate, 3);
    const demoWedding = await prisma.wedding.create({
        data: {
            weddingCode: 'TRK-2026-001',
            name: 'Aarav & Meera Palace Royal Wedding',
            clientId: client.id,
            location: 'Udaipur',
            venueName: 'The Oberoi Udaivilas & Jagmandir Island Palace',
            startDate: demoStartDate,
            endDate: demoEndDate,
            guestCount: 400,
            packageType: 'FULL_SERVICE',
            packageId: fullServicePkg.id,
            contractAmount: 45000000, // 4.5 Crores
            budget: 45000000,
            assignedPlannerId: planner1.id,
            status: 'CONFIRMED',
        },
    });
    // 7. Staged Payment Milestones (Booking 25%, Advance 50%, Final 25%)
    const milestone1 = await prisma.paymentMilestone.create({
        data: {
            weddingId: demoWedding.id,
            milestoneType: 'BOOKING',
            title: 'Booking Retainer Deposit (25%)',
            percentage: 25,
            amountDue: 11250000, // 1.125 Crores
            amountPaid: 11250000,
            dueDate: (0, date_fns_1.subDays)(new Date(), 10),
            status: 'PAID',
            sortOrder: 1,
        },
    });
    const milestone2 = await prisma.paymentMilestone.create({
        data: {
            weddingId: demoWedding.id,
            milestoneType: 'ADVANCE',
            title: 'Advance Payment 30 Days Prior (50%)',
            percentage: 50,
            amountDue: 22500000, // 2.25 Crores
            amountPaid: 22500000,
            dueDate: (0, date_fns_1.addDays)(new Date(), 15),
            status: 'PAID',
            sortOrder: 2,
        },
    });
    const milestone3 = await prisma.paymentMilestone.create({
        data: {
            weddingId: demoWedding.id,
            milestoneType: 'FINAL',
            title: 'Final Post-Wedding Settlement (25%)',
            percentage: 25,
            amountDue: 11250000, // 1.125 Crores
            amountPaid: 0,
            dueDate: (0, date_fns_1.addDays)(demoEndDate, 7),
            status: 'PENDING',
            sortOrder: 3,
        },
    });
    // Client Payments recorded (Booking + Advance)
    await prisma.clientPayment.create({
        data: {
            paymentNumber: 'PAY-2026-0001',
            weddingId: demoWedding.id,
            milestoneId: milestone1.id,
            amount: 11250000,
            paymentDate: (0, date_fns_1.subDays)(new Date(), 10),
            paymentMethod: 'BANK_TRANSFER',
            transactionRef: 'HDFCR982736450123',
            notes: 'Booking payment received via RTGS from Aarav Kapoor.',
            recordedById: financeMgr.id,
        },
    });
    await prisma.clientPayment.create({
        data: {
            paymentNumber: 'PAY-2026-0002',
            weddingId: demoWedding.id,
            milestoneId: milestone2.id,
            amount: 22500000,
            paymentDate: (0, date_fns_1.subDays)(new Date(), 2),
            paymentMethod: 'BANK_TRANSFER',
            transactionRef: 'HDFCR982736450889',
            notes: 'Second milestone advance payment received via RTGS.',
            recordedById: financeMgr.id,
        },
    });
    // 8. Digital Agreement for Demo Wedding
    await prisma.agreement.create({
        data: {
            agreementNumber: 'AGR-2026-001',
            weddingId: demoWedding.id,
            clientId: client.id,
            title: 'The Royal Knot Master Wedding Agreement',
            version: 1,
            status: 'SIGNED',
            scopeOfServices: 'Complete Destination Wedding Planning, Venue Design, Coordination, and Vendor Management for 3-Day Wedding at Udaipur.',
            termsAndConditions: 'Milestones: 25% Booking Deposit, 50% Advance 30 Days Prior, 25% Final Post-Wedding. Overtime DJ and extra guest plates billed separately upon client approval.',
            totalAmount: 45000000,
            signedAt: (0, date_fns_1.subDays)(new Date(), 10),
            signerName: 'Aarav Kapoor & Meera Kapoor',
            signerEmail: 'aarav.kapoor@example.com',
            signerIp: '103.211.54.12',
            signedPdfUrl: '/uploads/agreement_AGR-2026-001_demo.pdf',
        },
    });
    // 9. MODULE 6 DEMO: Three Caterer Quotations for 400 Guests
    const cateringCat = categories['CATERING'];
    const catVendor1 = vendors['Royal Mewar Gourmet Catering'];
    const catVendor2 = vendors['Rajputana Feasts & Hospitality'];
    const catVendor3 = vendors['Imperial Banquet Specialists'];
    // Quote 1 (The Winner)
    const quote1 = await prisma.vendorQuotation.create({
        data: {
            quoteNumber: 'QUO-2026-001',
            weddingId: demoWedding.id,
            vendorId: catVendor1.id,
            categoryId: cateringCat.id,
            guestCount: 400,
            baseAmount: 0,
            pricePerPlate: 2800, // 400 * 2800 = 11,20,000 per meal * 3 days = 33,60,000 subtotal
            extraHourRate: 15000,
            menuDetails: {
                cuisines: ['Royal Mewari', 'Awadhi Nizami', 'Live Italian Pasta', 'Artisan Mithai'],
                signatureDishes: ['Laal Maas', 'Govind Gatta Curry', 'Dal Baati Churma', 'Malpua Rabdi'],
            },
            includedServices: ['Live Counters', 'Silverware & Fine Bone China', '60 Trained Butlers', 'Beverage Bar Support'],
            excludedServices: ['Imported Wine/Liquor Procurement', 'Ice Sculptures'],
            additionalStaffCost: 150000,
            transportationCost: 50000,
            taxRate: 18,
            taxAmount: 640800,
            discountAmount: 100000,
            totalAmount: 4100800, // Total quotation amount
            validityDate: (0, date_fns_1.addDays)(new Date(), 30),
            terms: '50% advance upon booking, 50% on event morning. Extra plates @ ₹2,800 + tax.',
            status: 'ACCEPTED',
            coupleApproved: true,
        },
    });
    // Quote 2 (Competitor A - Closed)
    await prisma.vendorQuotation.create({
        data: {
            quoteNumber: 'QUO-2026-002',
            weddingId: demoWedding.id,
            vendorId: catVendor2.id,
            categoryId: cateringCat.id,
            guestCount: 400,
            baseAmount: 0,
            pricePerPlate: 3200,
            extraHourRate: 20000,
            menuDetails: {
                cuisines: ['Marwari', 'Continental', 'BBQ Grill'],
            },
            includedServices: ['Standard Buffet', '40 Staff'],
            excludedServices: ['Live Chaat', 'Specialty Dessert Bar'],
            additionalStaffCost: 200000,
            transportationCost: 60000,
            taxRate: 18,
            taxAmount: 738000,
            discountAmount: 0,
            totalAmount: 4838000,
            status: 'CLOSED',
            coupleApproved: false,
        },
    });
    // Quote 3 (Competitor B - Closed)
    await prisma.vendorQuotation.create({
        data: {
            quoteNumber: 'QUO-2026-003',
            weddingId: demoWedding.id,
            vendorId: catVendor3.id,
            categoryId: cateringCat.id,
            guestCount: 400,
            baseAmount: 0,
            pricePerPlate: 2500,
            extraHourRate: 12000,
            menuDetails: {
                cuisines: ['North Indian', 'Chinese'],
            },
            includedServices: ['Basic Buffet'],
            excludedServices: ['Live Counters', 'Uniformed Butlers'],
            additionalStaffCost: 100000,
            transportationCost: 40000,
            taxRate: 18,
            taxAmount: 565200,
            discountAmount: 50000,
            totalAmount: 3655200,
            status: 'CLOSED',
            coupleApproved: false,
        },
    });
    // Create Vendor Booking for Selected Caterer
    const catererBooking = await prisma.vendorBooking.create({
        data: {
            weddingId: demoWedding.id,
            vendorId: catVendor1.id,
            quotationId: quote1.id,
            agreedAmount: 4100800,
            status: 'CONFIRMED',
        },
    });
    // Bookings for remaining 17 vendors for demo wedding
    const remainingVendors = Object.values(vendors).filter((v) => v.id !== catVendor1.id);
    for (const v of remainingVendors) {
        const dummyAmount = (Math.floor(Math.random() * 15) + 5) * 100000; // 5L to 20L
        const q = await prisma.vendorQuotation.create({
            data: {
                quoteNumber: `QUO-2026-${Math.floor(Math.random() * 9000) + 1000}`,
                weddingId: demoWedding.id,
                vendorId: v.id,
                categoryId: v.categoryId,
                baseAmount: dummyAmount,
                totalAmount: dummyAmount,
                includedServices: ['Full service contract'],
                status: 'ACCEPTED',
                coupleApproved: true,
            },
        });
        await prisma.vendorBooking.create({
            data: {
                weddingId: demoWedding.id,
                vendorId: v.id,
                quotationId: q.id,
                agreedAmount: dummyAmount,
                status: 'CONFIRMED',
            },
        });
        // Record 50% advance paid to each vendor
        const advanceAmount = Math.round(dummyAmount * 0.5);
        await prisma.vendorPayment.create({
            data: {
                paymentNumber: `VPAY-2026-${Math.floor(Math.random() * 9000) + 1000}`,
                weddingId: demoWedding.id,
                vendorId: v.id,
                amount: advanceAmount,
                paymentDate: (0, date_fns_1.subDays)(new Date(), 5),
                paymentMethod: 'BANK_TRANSFER',
                transactionRef: `VADV${v.id.slice(0, 8).toUpperCase()}`,
                isAdvance: true,
                notes: `50% booking advance payment disbursed to ${v.companyName}`,
                recordedById: financeMgr.id,
            },
        });
    }
    // 10. Automatic Task Generation for Full-Service Demo Wedding (44 Tasks)
    const fullServiceTaskItems = taskTemplates_js_1.FULL_SERVICE_TASKS.map((t) => {
        const dueDate = (0, date_fns_1.addDays)(demoStartDate, t.daysFromStart);
        const startDate = (0, date_fns_1.subDays)(dueDate, t.category === 'PRE_WEDDING' ? 5 : 1);
        const isPast = dueDate < new Date();
        return {
            weddingId: demoWedding.id,
            taskName: t.taskName,
            description: t.description,
            category: t.category,
            assignedEmployeeId: planner1.id,
            priority: t.priority,
            startDate,
            dueDate,
            status: isPast ? 'DONE' : 'TO_PLAN',
            completionTimestamp: isPast ? dueDate : null,
            sortOrder: t.sortOrder,
            isTemplateGenerated: true,
        };
    });
    await prisma.weddingTask.createMany({ data: fullServiceTaskItems });
    console.log('✓ 44 Tasks generated for Full-Service Wedding');
    // 11. Wedding Events (Minute-by-minute timeline)
    const event1 = await prisma.weddingEvent.create({
        data: {
            weddingId: demoWedding.id,
            eventName: 'Mehendi & Sangeet Welcome Lunch',
            eventDate: demoStartDate,
            startTime: '11:00 AM',
            endTime: '03:00 PM',
            location: 'Promenade Courtyard, Udaivilas',
            responsibleEmployeeId: fieldCoord1.id,
            vendorId: catVendor1.id,
            priority: 'HIGH',
            status: 'COMPLETED',
            notes: 'Live bangles counter, Rajasthani folk singer, and chaat buffet.',
        },
    });
    const event2 = await prisma.weddingEvent.create({
        data: {
            weddingId: demoWedding.id,
            eventName: 'Grand Sangeet & Cocktail Soiree',
            eventDate: (0, date_fns_1.addDays)(demoStartDate, 1),
            startTime: '07:00 PM',
            endTime: '01:00 AM',
            location: 'Main Ballroom & Poolside Deck',
            responsibleEmployeeId: planner1.id,
            vendorId: vendors['DJ Shadow & Sonic Wave Sound'].id,
            priority: 'URGENT',
            status: 'SCHEDULED',
            notes: 'DJ sound setup, haze machines, LED screen sync, and 8 family performances.',
        },
    });
    const event3 = await prisma.weddingEvent.create({
        data: {
            weddingId: demoWedding.id,
            eventName: 'Royal Baraat & Vows Ceremony',
            eventDate: (0, date_fns_1.addDays)(demoStartDate, 2),
            startTime: '04:00 PM',
            endTime: '08:30 PM',
            location: 'Jagmandir Island Palace Mandap',
            responsibleEmployeeId: fieldCoord1.id,
            vendorId: vendors['Virasat Luxury Decor & Florals'].id,
            priority: 'URGENT',
            status: 'SCHEDULED',
            notes: 'Vintage Rolls Royce procession, dhol tasha, hydraulic garland exchange.',
        },
    });
    // 12. Vendor Check-in records (including 1 Delayed Vendor: DJ Shadow)
    await prisma.vendorCheckIn.create({
        data: {
            weddingId: demoWedding.id,
            vendorId: catVendor1.id,
            eventId: event1.id,
            expectedArrivalTime: (0, date_fns_1.subDays)(new Date(), 1),
            actualArrivalTime: (0, date_fns_1.subDays)(new Date(), 1),
            status: 'ARRIVED',
            checkedInById: fieldCoord1.id,
            delayMinutes: 0,
            notes: 'Kitchen brigade arrived on time with 60 staff members.',
        },
    });
    // Delayed vendor (DJ Shadow delayed by 45 minutes)
    await prisma.vendorCheckIn.create({
        data: {
            weddingId: demoWedding.id,
            vendorId: vendors['DJ Shadow & Sonic Wave Sound'].id,
            eventId: event2.id,
            expectedArrivalTime: new Date(),
            actualArrivalTime: new Date(),
            status: 'DELAYED',
            checkedInById: fieldCoord1.id,
            delayMinutes: 45,
            delayReason: 'Sound equipment truck held up at Udaipur toll checkpost.',
            notes: 'Field coordinator escalated to backup engineer; console arrived at 06:45 PM.',
        },
    });
    // 13. Operational Incident Report (Florist generator requirement / DJ delay)
    await prisma.incident.create({
        data: {
            incidentNumber: 'INC-2026-001',
            weddingId: demoWedding.id,
            eventId: event2.id,
            vendorId: vendors['DJ Shadow & Sonic Wave Sound'].id,
            title: 'Sound Rig Delay & Stage Power Generator Shortage',
            description: 'DJ equipment truck delayed in traffic, and decorator requested additional 125kVA silent generator for mandap lighting.',
            severity: 'HIGH',
            status: 'RESOLVED',
            reportedById: fieldCoord1.id,
            assignedEmployeeId: fieldCoord1.id,
            resolutionNotes: 'Dispatched emergency standby generator from BrightNight Power. Stage audio sound check completed on schedule.',
            resolvedAt: new Date(),
        },
    });
    // 14. 400+ Guests for Demo Wedding
    const guestGroups = ['Kapoor Family (Groom)', 'Sharma Family (Bride)', 'Corporate VIPs', 'College Friends', 'International Guests'];
    const guestFirstNames = ['Vikram', 'Anil', 'Sunita', 'Pooja', 'Rohan', 'Kavita', 'Suresh', 'Manju', 'Gaurav', 'Neha', 'Nitin', 'Divya', 'Deepak', 'Alka', 'Harish', 'Preeti', 'Rajeev', 'Shalini', 'Tarun', 'Swati'];
    const guestLastNames = ['Kapoor', 'Sharma', 'Mehta', 'Singhania', 'Chopra', 'Malhotra', 'Bhatia', 'Saxena', 'Verma', 'Gupta'];
    const demoGuests = [];
    for (let i = 1; i <= 405; i++) {
        const fn = guestFirstNames[i % guestFirstNames.length];
        const ln = guestLastNames[i % guestLastNames.length];
        const group = guestGroups[i % guestGroups.length];
        const isAttending = i <= 370; // 370 confirmed
        demoGuests.push({
            weddingId: demoWedding.id,
            guestGroup: group,
            firstName: `${fn}`,
            lastName: `${ln} #${i}`,
            phone: `+91 98000 ${String(10000 + i).slice(-5)}`,
            email: `guest${i}@example.com`,
            invitationStatus: 'SENT',
            rsvpStatus: isAttending ? 'CONFIRMED' : 'DECLINED',
            dietaryPreference: i % 4 === 0 ? 'JAIN' : i % 5 === 0 ? 'NON_VEG' : 'VEG',
            accommodationAssigned: true,
            roomNumber: `Room-${100 + (i % 80)}`,
            transportationNeeded: i % 2 === 0,
            arrivalStatus: i <= 320 ? 'ARRIVED' : 'EXPECTED',
            plusGuests: i % 10 === 0 ? 1 : 0,
        });
    }
    await prisma.guest.createMany({ data: demoGuests });
    console.log(`✓ ${demoGuests.length} Guests imported for Demo Wedding (400+ requirement satisfied)`);
    // 15. Extra Expenses & Client Billing (MODULE 12 Scenario: 60 Extra Guests @ ₹1,500 + 2 Extra DJ Hours + Generator)
    const extraPlateExp = await prisma.extraExpense.create({
        data: {
            weddingId: demoWedding.id,
            category: 'CATERING',
            description: '60 Unexpected Guests Banquet Dinners @ ₹1,500 per plate',
            quantity: 60,
            unitPrice: 1500,
            amount: 90000,
            taxRate: 18,
            taxAmount: 16200,
            totalAmount: 106200,
            vendorId: catVendor1.id,
            approvalStatus: 'APPROVED',
            clientBillingStatus: 'PENDING_BILLING',
            requestedById: fieldCoord1.id,
            approvedAt: new Date(),
            approvedById: planner1.id,
            clientComments: 'Approved by Aarav Kapoor via verbal on-site consent.',
        },
    });
    const extraDjExp = await prisma.extraExpense.create({
        data: {
            weddingId: demoWedding.id,
            category: 'ENTERTAINMENT',
            description: '2 Additional Sangeet DJ Hours Extended Past Midnight @ ₹10,000/hr',
            quantity: 2,
            unitPrice: 10000,
            amount: 20000,
            taxRate: 18,
            taxAmount: 3600,
            totalAmount: 23600,
            vendorId: vendors['DJ Shadow & Sonic Wave Sound'].id,
            approvalStatus: 'APPROVED',
            clientBillingStatus: 'PENDING_BILLING',
            requestedById: fieldCoord1.id,
            approvedAt: new Date(),
            approvedById: planner1.id,
            clientComments: 'Approved by groom family for extended party.',
        },
    });
    const extraGenExp = await prisma.extraExpense.create({
        data: {
            weddingId: demoWedding.id,
            category: 'POWER_BACKUP',
            description: 'Emergency 125kVA Standby Silent Generator for Mandap Illumination',
            quantity: 1,
            unitPrice: 15000,
            amount: 15000,
            taxRate: 18,
            taxAmount: 2700,
            totalAmount: 17700,
            vendorId: vendors['BrightNight Power & Architectural Light'].id,
            approvalStatus: 'APPROVED',
            clientBillingStatus: 'PENDING_BILLING',
            requestedById: fieldCoord1.id,
            approvedAt: new Date(),
            approvedById: planner1.id,
            clientComments: 'Required for safety compliance.',
        },
    });
    // 16. Employee Labour Time Logs (MODULE 14)
    await prisma.employeeTimeLog.createMany({
        data: [
            {
                weddingId: demoWedding.id,
                employeeId: planner1.id,
                startTime: (0, date_fns_1.subDays)(new Date(), 2),
                endTime: new Date(),
                hoursWorked: 35,
                hourlyRate: 1200,
                calculatedLabourCost: 42000,
                isApproved: true,
                approvedById: founder.id,
                notes: 'Pre-wedding coordination and vendor contract reviews.',
            },
            {
                weddingId: demoWedding.id,
                employeeId: fieldCoord1.id,
                startTime: (0, date_fns_1.subDays)(new Date(), 1),
                endTime: new Date(),
                hoursWorked: 28,
                hourlyRate: 750,
                calculatedLabourCost: 21000,
                isApproved: true,
                approvedById: founder.id,
                notes: 'On-site venue setup and vendor arrival check-ins.',
            },
        ],
    });
    // 17. Second Wedding: Jaipur Day-Of Coordination
    const jaipurWedding = await prisma.wedding.create({
        data: {
            weddingCode: 'TRK-2026-002',
            name: 'Rohan & Ananya Rambagh Heritage Wedding',
            clientId: client.id,
            location: 'Jaipur',
            venueName: 'Rambagh Palace, Jaipur',
            startDate: (0, date_fns_1.addDays)(new Date(), 90),
            endDate: (0, date_fns_1.addDays)(new Date(), 91),
            guestCount: 250,
            packageType: 'PARTIAL_DAY_OF',
            packageId: dayOfPkg.id,
            contractAmount: 18000000, // 1.8 Crores
            budget: 18000000,
            assignedPlannerId: planner2.id,
            status: 'CONFIRMED',
        },
    });
    // Generate Day-Of Tasks for Jaipur Wedding (12 Tasks)
    const dayOfTaskItems = taskTemplates_js_1.DAY_OF_TASKS.map((t) => ({
        weddingId: jaipurWedding.id,
        taskName: t.taskName,
        description: t.description,
        category: t.category,
        assignedEmployeeId: planner2.id,
        priority: t.priority,
        startDate: (0, date_fns_1.subDays)((0, date_fns_1.addDays)(new Date(), 90), Math.abs(t.daysFromStart) + 2),
        dueDate: (0, date_fns_1.addDays)((0, date_fns_1.addDays)(new Date(), 90), t.daysFromStart),
        status: 'TO_PLAN',
        sortOrder: t.sortOrder,
        isTemplateGenerated: true,
    }));
    await prisma.weddingTask.createMany({ data: dayOfTaskItems });
    console.log('✓ Day-Of Wedding Tasks created independently');
    // 18. Third Wedding: Winter Palace Wedding
    await prisma.wedding.create({
        data: {
            weddingCode: 'TRK-2026-003',
            name: 'Kabir & Tara Fairmont Royal Celebration',
            clientId: client.id,
            location: 'Jaipur',
            venueName: 'Fairmont Jaipur, Kukas',
            startDate: (0, date_fns_1.addDays)(new Date(), 120),
            endDate: (0, date_fns_1.addDays)(new Date(), 123),
            guestCount: 500,
            packageType: 'FULL_SERVICE',
            packageId: fullServicePkg.id,
            contractAmount: 60000000, // 6 Crores
            budget: 60000000,
            assignedPlannerId: planner1.id,
            status: 'CONFIRMED',
        },
    });
    // 19. At least 10 CRM Enquiries across different stages and sources
    const sampleEnquiries = [
        { enquiryNumber: 'ENQ-2026-001', coupleName: 'Aarav & Meera', partner1Name: 'Aarav', partner2Name: 'Meera', email: 'aarav.kapoor@example.com', phone: '+91 98111 88899', source: 'INSTAGRAM', weddingLocation: 'Udaipur', preferredDate: demoStartDate, guestCount: 400, maxBudget: 45000000, theme: 'Royal Mewari Heritage', status: 'CONVERTED', convertedWeddingId: demoWedding.id, clientId: client.id },
        { enquiryNumber: 'ENQ-2026-002', coupleName: 'Rohan & Ananya', partner1Name: 'Rohan', partner2Name: 'Ananya', email: 'rohan.mehra@example.com', phone: '+91 98222 77766', source: 'WHATSAPP', weddingLocation: 'Jaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 90), guestCount: 250, maxBudget: 18000000, theme: 'Classic Palace Gold', status: 'CONVERTED', convertedWeddingId: jaipurWedding.id },
        { enquiryNumber: 'ENQ-2026-003', coupleName: 'Dev & Ishita', partner1Name: 'Dev', partner2Name: 'Ishita', email: 'dev.ishita@example.com', phone: '+91 98333 66655', source: 'WEBSITE', weddingLocation: 'Jaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 110), guestCount: 450, maxBudget: 55000000, theme: 'Rajputana Vintage', status: 'PROPOSAL_SENT' },
        { enquiryNumber: 'ENQ-2026-004', coupleName: 'Siddharth & Tanya', partner1Name: 'Siddharth', partner2Name: 'Tanya', email: 'sid.tanya@example.com', phone: '+91 98444 55544', source: 'INSTAGRAM', weddingLocation: 'Udaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 130), guestCount: 350, maxBudget: 40000000, theme: 'Lakeside Floral Elegance', status: 'MEETING_SCHEDULED' },
        { enquiryNumber: 'ENQ-2026-005', coupleName: 'Aditya & Rhea', partner1Name: 'Aditya', partner2Name: 'Rhea', email: 'aditya.rhea@example.com', phone: '+91 98555 44433', source: 'PHONE', weddingLocation: 'Jaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 140), guestCount: 500, maxBudget: 65000000, theme: 'Royal Jodhpur Fort Night', status: 'NEGOTIATION' },
        { enquiryNumber: 'ENQ-2026-006', coupleName: 'Kunal & Sanjana', partner1Name: 'Kunal', partner2Name: 'Sanjana', email: 'kunal.s@example.com', phone: '+91 98666 33322', source: 'REFERRAL', weddingLocation: 'Udaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 150), guestCount: 400, maxBudget: 48000000, theme: 'Contemporary Rajputana', status: 'NEW' },
        { enquiryNumber: 'ENQ-2026-007', coupleName: 'Varun & Natasha', partner1Name: 'Varun', partner2Name: 'Natasha', email: 'varun.n@example.com', phone: '+91 98777 22211', source: 'WHATSAPP', weddingLocation: 'Jaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 160), guestCount: 300, maxBudget: 35000000, theme: 'Amber Heritage Sunset', status: 'CONTACTED' },
        { enquiryNumber: 'ENQ-2026-008', coupleName: 'Manish & Shruti', partner1Name: 'Manish', partner2Name: 'Shruti', email: 'manish.shruti@example.com', phone: '+91 98888 11100', source: 'WEBSITE', weddingLocation: 'Udaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 180), guestCount: 420, maxBudget: 52000000, theme: 'Jagmandir Island Royal Vows', status: 'PROPOSAL_SENT' },
        { enquiryNumber: 'ENQ-2026-009', coupleName: 'Aryan & Pooja', partner1Name: 'Aryan', partner2Name: 'Pooja', email: 'aryan.p@example.com', phone: '+91 98999 00099', source: 'INSTAGRAM', weddingLocation: 'Jaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 200), guestCount: 200, maxBudget: 22000000, theme: 'Minimalist Royal Palace', status: 'LOST' },
        { enquiryNumber: 'ENQ-2026-010', coupleName: 'Nikhil & Simran', partner1Name: 'Nikhil', partner2Name: 'Simran', email: 'nikhil.s@example.com', phone: '+91 98111 22334', source: 'OTHER', weddingLocation: 'Udaipur', preferredDate: (0, date_fns_1.addDays)(new Date(), 220), guestCount: 480, maxBudget: 58000000, theme: 'Grand Mewar Opulence', status: 'NEW' },
    ];
    for (const enq of sampleEnquiries) {
        await prisma.enquiry.create({ data: enq });
    }
    console.log(`✓ ${sampleEnquiries.length} CRM Enquiries seeded with pipeline stages`);
    // 20. Notifications for Founder & Team
    await prisma.notification.createMany({
        data: [
            { userId: founder.id, title: 'Extra Guests Billing Approved', message: '60 additional guests approved for Aarav & Meera Wedding (₹1,06,200).', type: 'SUCCESS', linkUrl: `/weddings/${demoWedding.id}` },
            { userId: founder.id, title: 'Vendor Delay Alert', message: 'DJ Shadow reported 45 minutes late arrival at Udaivilas.', type: 'ALERT', linkUrl: `/weddings/${demoWedding.id}` },
            { userId: planner1.id, title: 'Quotation Accepted', message: 'Royal Mewar Gourmet Catering confirmed for Aarav & Meera Wedding.', type: 'INFO', linkUrl: `/weddings/${demoWedding.id}` },
            { userId: financeMgr.id, title: 'Client Payment Received', message: 'Advance payment of ₹2,25,00,000 received via RTGS.', type: 'SUCCESS', linkUrl: `/weddings/${demoWedding.id}` },
        ],
    });
    // 21. System Settings
    await prisma.systemSetting.createMany({
        data: [
            { key: 'agencyName', value: 'The Royal Knot' },
            { key: 'locations', value: 'Jaipur, Udaipur' },
            { key: 'currency', value: 'INR' },
            { key: 'timezone', value: 'Asia/Kolkata' },
            { key: 'dateFormat', value: 'DD-MM-YYYY' },
            { key: 'defaultGstRate', value: '18' },
        ],
    });
    console.log('\n======================================================');
    console.log('THE ROYAL KNOT DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('Login credentials for all roles:');
    console.log('Founder/Admin:        founder@royalknot.com / RoyalKnot@2026');
    console.log('Wedding Planner 1:    priya.sharma@royalknot.com / RoyalKnot@2026');
    console.log('Wedding Planner 2:    rahul.mehta@royalknot.com / RoyalKnot@2026');
    console.log('Finance Manager:      amit.verma@royalknot.com / RoyalKnot@2026');
    console.log('Field Coordinator 1:  vikram.singh@royalknot.com / RoyalKnot@2026');
    console.log('Field Coordinator 2:  ananya.sen@royalknot.com / RoyalKnot@2026');
    console.log('Client / Couple:      aarav.kapoor@example.com / RoyalKnot@2026');
    console.log('Vendor:               royal.caterers@example.com / RoyalKnot@2026');
    console.log('======================================================\n');
}
main()
    .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
