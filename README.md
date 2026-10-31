# The Royal Knot — Luxury Wedding Planning Management System
### Jaipur & Udaipur Royal Palace Circuit • Enterprise Business Platform

---

## 1. Executive Summary

**The Royal Knot** is a comprehensive, production-grade enterprise business management system architected specifically for elite destination wedding planning agencies operating across Rajasthan's heritage palaces (Jaipur, Udaipur, Jodhpur). 

This platform manages the entire lifecycle of multi-crore royal weddings — from initial client enquiry and staged agreements to competitive vendor matrix evaluation, minute-by-minute day-of operations, guest hospitality, unexpected addition billing, vendor invoice reconciliation, and executive accrual profitability reporting.

---

## 2. Technology Stack & System Architecture

### Backend Core
- **Runtime**: Node.js v24 (TypeScript ESM)
- **Framework**: Express.js with Helmet, CORS, and Express Rate Limit
- **Database**: PostgreSQL 16 (strict relational schema with 39 models)
- **ORM**: Prisma ORM v5 (all monetary fields strictly typed as `Decimal(12, 2)`)
- **Real-Time Communication**: Socket.IO v4 with wedding room segmentation (`wedding:${weddingId}`)
- **Document Engine**: PDFKit with custom luxury styling, digital signature stamps, and watermarking
- **Validation**: Zod schema validation across all request pipelines
- **Testing**: Vitest + Supertest automated end-to-end integration test suite

### Frontend Core
- **Framework**: React 18 with Vite and TypeScript
- **Styling**: Tailwind CSS tailored with the official luxury Royal Knot palette:
  - **Royal Burgundy**: `#722F37`
  - **Champagne Gold**: `#C5A46D`
  - **Ivory Parchment**: `#FAF8F3`
  - **Charcoal**: `#292929`
- **Visualizations**: Recharts (Monthly revenue vs net profit trajectory, category breakdowns)
- **Typography**: Google Fonts (*Playfair Display* serif headlines + *Plus Jakarta Sans* UI body)
- **Icons**: Lucide React
- **State & Server Cache**: TanStack React Query + Context API (Auth, Socket)

---

## 3. Five Real-World Business Problem Workflows

### Scene 1: CRM, Consultation & Digital Agreements
- **CRM Ingestion**: Captures high-net-worth inquiries across Instagram, WhatsApp, Website, and Referrals.
- **Conversion Pipeline**: Transaction-safe conversion of qualified inquiries into active Wedding Projects with client account creation.
- **Digital Agreements**: Automatically creates customized planning agreements with default staged payment terms. Dispatches digital signing links (`/sign/:id`).
- **Legal Immutability**: Client digital signature pad (mouse, touch, or stylus) permanently locks the contract and generates an official signed PDF document.

### Scene 2: Vendor Sourcing & Competitive Quotation Matrix
- **Curated Partner Directory**: 18+ verified heritage vendors across 16 categories (Palace Catering, Royal Decor, Folk Artists, Photography, Transport, etc.).
- **Side-by-Side Matrix**: Compares competing vendor quotes on per-plate rates (e.g. ₹2,200 vs ₹2,500 vs ₹2,800), overtime rates, and menu inclusions.
- **Automated Competitor Closing**: Selecting the winning vendor automatically awards the contract, sets the quotation to `ACCEPTED`, creates the booking, and automatically marks competing bids as `CLOSED`.

### Scene 3: Day-Of Operations & Incident Command
- **44 Idempotent Standard Tasks**: Auto-generates the comprehensive 44-task Royal Full-Service checklist (venue architectural mapping, dhol artists escort, royal thali tasting, baraat vintage cars) with duplicate prevention.
- **Kanban Planning Board**: Drag-and-drop workflow across *To Plan*, *In Progress*, *Blocked*, *Review*, and *Done*.
- **Live Event Timeline**: Minute-by-minute scheduling (Baraat, Varmala, Pheras, Gala Reception).
- **Vendor Arrival Check-In**: Records check-ins with automatic late arrival detection (>15 minutes late triggers operational delay alerts via Socket.IO).
- **Incident Command & Triage**: Real-time logging of critical disruptions (e.g. sound power outage, decor delays) with immediate resolution protocol tracking.

### Scene 4: Unexpected Guest Additions & Vendor Settlements
- **Extra Client Billing**: Handles unexpected additions during the event (60 extra guests on day 2 @ ₹1,500/plate, 2 extended DJ hours @ ₹25,000/hr, silent 125 kVA generator).
- **Client Approval & Tax Invoice**: Allows couple/planner sign-off and generates consolidated 18% GST Tax Invoices.
- **Vendor Settlement Matching**: Compares submitted vendor invoices against original agreed quotations, flags variances, reconciles pre-event advances, and records balance disbursements with UTR tracking.

### Scene 5: Founder Executive Profitability & Regional Analytics
- **Accounting Distinction**: Explicitly differentiates:
  1. **Contracted Revenue**: Total signed contract values.
  2. **Recognized Revenue**: Contract amount + approved extra additions.
  3. **Cash Collections**: Actual realized bank transfers and client receipts.
- **Regional Profitability**: Side-by-side performance comparison of **Jaipur Palace Circuit** vs **Udaipur Lake Circuit** (wedding count, revenue, profit, and margin %).
- **Monthly Trajectory**: Recharts visual analytics showing revenue and net earnings progression.

---

## 4. Role-Based Access Control (RBAC) & Demo Credentials

The application includes 1-click role switcher buttons on the `/login` page and top navigation bar:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Founder / Admin** | `founder@royalknot.com` | `RoyalKnot@2026` | Full system access, executive analytics, all weddings, profit margins |
| **Wedding Planner** | `priya.sharma@royalknot.com` | `RoyalKnot@2026` | CRM pipeline, task templates, client agreements, day-of operations |
| **Finance Manager** | `amit.verma@royalknot.com` | `RoyalKnot@2026` | Client payment receipts, vendor invoice matching, settlements, tax invoices |
| **Field Coordinator**| `vikram.singh@royalknot.com` | `RoyalKnot@2026` | Live event timeline, vendor check-ins, delayed alerts, incident logging |
| **Client (Couple)** | `aarav.kapoor@example.com` | `RoyalKnot@2026` | Isolated view: their wedding, RSVP guests, digital signing, invoice approvals |
| **Vendor Partner** | `royal.caterers@example.com`| `RoyalKnot@2026` | Isolated view: submit quotations, view booked events, check invoice status |

---

## 5. Setup & Running Instructions

### Prerequisites
- Node.js (v20+ or v24)
- Docker & Docker Compose (or local PostgreSQL 16)

### 1. Database Setup (Dedicated Port 5435)
```bash
# Launch isolated PostgreSQL container
docker run -d --name royal_knot_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=royal_knot_db \
  -p 5435:5432 \
  postgres:16-alpine
```

### 2. Backend Initialization
```bash
cd backend

# Synchronize database schema (39 models)
npx prisma db push

# Seed master Udaipur & Jaipur demonstration weddings
npx tsx prisma/seed.ts

# Run automated integration tests (17 passed out of 17)
npm test

# Start backend development server (Port 5000)
npm run dev
```

### 3. Frontend Initialization
```bash
cd frontend

# Build production bundle
npm run build

# Start frontend development server with API proxy (Port 5173)
npm run dev
```

Visit the application at: **`http://localhost:5173`**

---

## 6. Automated Integration Test Coverage

The backend test suite (`backend/tests/workflows.test.ts`) executes 17 automated tests covering all core system workflows:

```text
✓ TEST 1: CRM & Enquiry Conversion Workflow (3 tests)
  - Auto-generated enquiryNumber and inquiry intake
  - Consultation scheduling and meeting status
  - Transactional conversion to Wedding with Client isolation

✓ TEST 2: Digital Agreements & Immutability (2 tests)
  - Agreement creation with staged milestones and PDF generation
  - Immutable digital signature execution and IP audit trail

✓ TEST 3: Vendor Quotations & Competitor Auto-Closing (2 tests)
  - Line-item and per-plate pricing evaluation
  - Winner selection with automated competitor quote closing

✓ TEST 4: Automatic Task Generation & Idempotency (1 test)
  - Full-Service royal template generation (44 tasks) and duplicate prevention

✓ TEST 5: Wedding Day Operations & Incident Resolution (2 tests)
  - Vendor check-in with late arrival detection (>15 mins)
  - Live incident triage and corrective action resolution

✓ TEST 6: Guest Management & CSV (1 test)
  - 400+ guest registry, CSV bulk import, and RSVP tallying

✓ TEST 7: Extra Billing & Client Invoice Calculation (1 test)
  - Unforeseen expense recording, approval, and 18% GST tax invoice calculation

✓ TEST 8: Client Payments & Duplicate Prevention (1 test)
  - Staged milestone payment recording and duplicate UTR prevention

✓ TEST 9: Vendor Settlement & Advance Tracking (1 test)
  - Advance retainer reconciliation, invoice matching, and final settlement

✓ TEST 10: Financial Analytics & Profitability (1 test)
  - Accrual revenue recognition, COGS calculation, and net margin verification

✓ TEST 11: Role Security & Access Control (2 tests)
  - RBAC verification (Clients cannot access Founder financial endpoints)
  - Client data isolation
```

---

## 7. Directory Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 39 models, Decimal monetary fields, indexes
│   │   └── seed.ts             # Realistic 3-day Udaipur wedding seed data
│   ├── src/
│   │   ├── config/             # Singleton Prisma client
│   │   ├── controllers/        # 16 domain controllers
│   │   ├── middleware/         # JWT verification, RBAC, error handlers
│   │   ├── routes/             # REST route declarations
│   │   ├── utils/              # Decimal calculations, PDFKit generator, task templates
│   │   ├── validators/         # Zod validation schemas
│   │   ├── socket.ts           # Socket.IO real-time server
│   │   └── index.ts            # Express server entry point
│   └── tests/
│       └── workflows.test.ts   # 17 automated integration tests
│
├── frontend/
│   ├── src/
│   │   ├── components/         # MetricCard, Modal, StatusBadge, EmptyState
│   │   ├── contexts/           # AuthContext (RBAC), SocketContext
│   │   ├── layouts/            # Sidebar (17 sections), Navbar, MainLayout
│   │   ├── pages/              # 20 luxury full-stack pages
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Enquiries.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Weddings.tsx
│   │   │   ├── WeddingWorkspace.tsx (12 integrated operational tabs)
│   │   │   ├── Agreements.tsx
│   │   │   ├── PublicSignAgreement.tsx (Client digital signature portal)
│   │   │   ├── Vendors.tsx
│   │   │   ├── Quotations.tsx (Competitive matrix & winner selection)
│   │   │   ├── Tasks.tsx (Kanban & List views)
│   │   │   ├── Guests.tsx (400+ guests, CSV import/export)
│   │   │   ├── Operations.tsx (Minute-by-minute timeline & live delays)
│   │   │   ├── Payments.tsx (Staged milestones & PDF receipts)
│   │   │   ├── Expenses.tsx (Unforeseen additions & tax invoices)
│   │   │   ├── VendorSettlements.tsx (Advances vs final settlements)
│   │   │   ├── FinancialReports.tsx (Jaipur vs Udaipur, Recharts)
│   │   │   ├── Team.tsx (Staff roster & time logging)
│   │   │   ├── Notifications.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/           # Axios client with JWT interceptors
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   └── utils/              # Currency (INR) and date formatters
│   ├── index.html
│   └── tailwind.config.js
│
└── uploads/                    # Generated signed PDFs, receipts, and invoices
```

---

*Architected & engineered with precision for The Royal Knot Luxury Weddings.*
