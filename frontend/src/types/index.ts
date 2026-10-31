export type UserRole = 'FOUNDER' | 'PLANNER' | 'FINANCE' | 'FIELD_COORDINATOR' | 'CLIENT' | 'VENDOR';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type EnquiryStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'MEETING_SCHEDULED' 
  | 'PROPOSAL_SENT' 
  | 'NEGOTIATION' 
  | 'CONVERTED' 
  | 'LOST';

export type EnquirySource = 'WEBSITE' | 'INSTAGRAM' | 'WHATSAPP' | 'PHONE' | 'REFERRAL' | 'OTHER';
export type PackageType = 'FULL_SERVICE' | 'PARTIAL_DAY_OF';

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  coupleName: string;
  partner1Name: string;
  partner2Name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  source: EnquirySource;
  weddingLocation: string;
  preferredDate: string;
  alternativeDate?: string;
  weddingDurationDays: number;
  guestCount: number;
  maxBudget: number | string;
  theme?: string;
  packageType: PackageType;
  specialRequirements?: string;
  notes?: string;
  assignedPlannerId?: string;
  followUpDate?: string;
  status: EnquiryStatus;
  clientId?: string;
  convertedWeddingId?: string;
  createdAt: string;
  updatedAt: string;
  consultations?: Consultation[];
}

export interface Consultation {
  id: string;
  enquiryId: string;
  scheduledAt: string;
  location: string;
  meetingNotes?: string;
  plannerId?: string;
  status: string;
}

export interface Client {
  id: string;
  userId?: string;
  partner1Name: string;
  partner2Name: string;
  email: string;
  phone: string;
  altPhone?: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt: string;
  weddings?: Wedding[];
  totalWeddings?: number;
  totalSpent?: number;
  outstandingBalance?: number;
}

export type WeddingStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Wedding {
  id: string;
  weddingCode: string;
  name: string;
  clientId: string;
  client?: Client;
  location: string;
  venueName?: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  packageType: PackageType;
  packageId?: string;
  contractAmount: number | string;
  recognizedRevenue: number | string;
  budget: number | string;
  assignedPlannerId?: string;
  assignedPlanner?: User;
  status: WeddingStatus;
  createdAt: string;
  completionPercentage?: number;
  assignedVendorsCount?: number;
  pendingTasksCount?: number;
  totalTasksCount?: number;
}

export type AgreementStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'SIGNED' | 'REJECTED' | 'EXPIRED';

export interface Agreement {
  id: string;
  agreementNumber: string;
  weddingId: string;
  wedding?: Wedding;
  clientId: string;
  client?: Client;
  version: number;
  title: string;
  status: AgreementStatus;
  scopeOfServices: string;
  termsAndConditions: string;
  totalAmount: number | string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
  signerIp?: string;
  signatureImage?: string;
  signedPdfUrl?: string;
  createdAt: string;
}

export interface VendorCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  categoryId: string;
  category?: VendorCategory;
  services: string[];
  location: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankBranch?: string;
  availabilityStatus: boolean;
  rating: number;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  totalBookings?: number;
}

export type QuotationStatus = 'REQUESTED' | 'SUBMITTED' | 'RECOMMENDED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';

export interface VendorQuotation {
  id: string;
  quoteNumber: string;
  weddingId: string;
  wedding?: Wedding;
  vendorId: string;
  vendor?: Vendor;
  categoryId: string;
  category?: VendorCategory;
  guestCount: number;
  eventDate?: string;
  baseAmount: number | string;
  pricePerPlate: number | string;
  extraHourRate: number | string;
  menuDetails?: any;
  includedServices: string[];
  excludedServices: string[];
  additionalStaffCost: number | string;
  transportationCost: number | string;
  taxRate: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  validityDate?: string;
  terms?: string;
  pdfUrl?: string;
  status: QuotationStatus;
  coupleApproved: boolean;
  createdAt: string;
}

export type TaskCategory = 'PRE_WEDDING' | 'EVENT_DAY' | 'POST_WEDDING';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TO_PLAN' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'DONE';

export interface WeddingTask {
  id: string;
  weddingId: string;
  taskName: string;
  description?: string;
  category: TaskCategory;
  assignedEmployeeId?: string;
  assignedEmployee?: User;
  priority: TaskPriority;
  startDate?: string;
  dueDate: string;
  status: TaskStatus;
  completionTimestamp?: string;
  notes?: string;
  sortOrder: number;
  isTemplateGenerated: boolean;
  createdAt: string;
}

export type VendorCheckInStatus = 'EXPECTED' | 'ARRIVED' | 'WORKING' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

export interface WeddingEvent {
  id: string;
  weddingId: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  responsibleEmployeeId?: string;
  vendorId?: string;
  priority: string;
  status: string;
  notes?: string;
}

export interface VendorCheckIn {
  id: string;
  weddingId: string;
  vendorId: string;
  vendor?: Vendor;
  eventId?: string;
  event?: WeddingEvent;
  expectedArrivalTime: string;
  actualArrivalTime?: string;
  status: VendorCheckInStatus;
  checkedInById?: string;
  checkedInBy?: User;
  delayMinutes: number;
  delayReason?: string;
  notes?: string;
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export interface Incident {
  id: string;
  incidentNumber: string;
  weddingId: string;
  wedding?: Wedding;
  eventId?: string;
  event?: WeddingEvent;
  vendorId?: string;
  vendor?: Vendor;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  reportedById?: string;
  reportedBy?: User;
  assignedEmployeeId?: string;
  assignedEmployee?: User;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export type RsvpStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';
export type DietaryPreference = 'VEG' | 'JAIN' | 'NON_VEG' | 'VEGAN' | 'OTHER';

export interface Guest {
  id: string;
  weddingId: string;
  guestGroup: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  invitationStatus: string;
  rsvpStatus: RsvpStatus;
  dietaryPreference: DietaryPreference;
  accommodationAssigned: boolean;
  roomNumber?: string;
  transportationNeeded: boolean;
  arrivalStatus: string;
  arrivalTime?: string;
  plusGuests: number;
  notes?: string;
}

export type MilestoneType = 'BOOKING' | 'ADVANCE' | 'FINAL' | 'CUSTOM';
export type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CASH' | 'CARD';

export interface PaymentMilestone {
  id: string;
  weddingId: string;
  milestoneType: MilestoneType;
  title: string;
  percentage: number | string;
  amountDue: number | string;
  amountPaid: number | string;
  dueDate: string;
  status: PaymentStatus;
  sortOrder: number;
}

export interface ClientPayment {
  id: string;
  paymentNumber: string;
  weddingId: string;
  milestoneId?: string;
  milestone?: PaymentMilestone;
  amount: number | string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  receiptUrl?: string;
  notes?: string;
}

export interface ExtraExpense {
  id: string;
  weddingId: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number | string;
  amount: number | string;
  taxRate: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  vendorId?: string;
  vendor?: Vendor;
  receiptUrl?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  clientBillingStatus: 'PENDING_BILLING' | 'BILLED' | 'EXCLUDED';
  requestedById?: string;
  approvedAt?: string;
  clientComments?: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  weddingId: string;
  wedding?: Wedding;
  clientId: string;
  client?: Client;
  contractAmount: number | string;
  approvedAdditions: number | string;
  discountAmount: number | string;
  taxRate: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  balanceDue: number | string;
  dueDate: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
  pdfUrl?: string;
  issuedAt: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  weddingId: string;
  wedding?: Wedding;
  vendorId: string;
  vendor?: Vendor;
  originalQuotedAmount: number | string;
  approvedAdditions: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  finalAmount: number | string;
  advancePaid: number | string;
  previousPayments: number | string;
  balanceDue: number | string;
  dueDate: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'PARTIALLY_PAID' | 'PAID' | 'DISPUTED';
  invoicePdfUrl?: string;
  createdAt: string;
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  vendorInvoiceId?: string;
  weddingId: string;
  vendorId: string;
  vendor?: Vendor;
  amount: number | string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  isAdvance: boolean;
  receiptUrl?: string;
}

export interface EmployeeTimeLog {
  id: string;
  weddingId: string;
  employeeId: string;
  employee?: User;
  taskId?: string;
  task?: WeddingTask;
  startTime: string;
  endTime: string;
  hoursWorked: number | string;
  hourlyRate: number | string;
  calculatedLabourCost: number | string;
  isApproved: boolean;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  createdAt: string;
}
