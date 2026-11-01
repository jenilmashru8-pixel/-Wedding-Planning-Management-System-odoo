import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string()
    .min(12)
    .max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
});

export const enquirySchema = z.object({
  coupleName: z.string().min(2),
  partner1Name: z.string().min(1),
  partner2Name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  whatsapp: z.string().optional(),
  source: z.enum(['WEBSITE', 'INSTAGRAM', 'WHATSAPP', 'PHONE', 'REFERRAL', 'OTHER']).default('WEBSITE'),
  weddingLocation: z.string().min(2),
  preferredDate: z.string(),
  alternativeDate: z.string().optional(),
  weddingDurationDays: z.number().int().positive().default(3),
  guestCount: z.number().int().positive().default(400),
  maxBudget: z.number().positive().or(z.string()),
  theme: z.string().optional(),
  packageType: z.enum(['FULL_SERVICE', 'PARTIAL_DAY_OF']).default('FULL_SERVICE'),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
  assignedPlannerId: z.string().optional(),
  followUpDate: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONVERTED', 'LOST']).default('NEW'),
});

export const weddingSchema = z.object({
  name: z.string().min(2),
  clientId: z.string(),
  location: z.string().min(2),
  venueName: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  guestCount: z.number().int().positive().default(400),
  packageType: z.enum(['FULL_SERVICE', 'PARTIAL_DAY_OF']).default('FULL_SERVICE'),
  contractAmount: z.number().positive().or(z.string()),
  budget: z.number().positive().or(z.string()),
  assignedPlannerId: z.string().optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('CONFIRMED'),
});

export const vendorSchema = z.object({
  companyName: z.string().min(2),
  contactPerson: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  address: z.string().optional(),
  categoryId: z.string(),
  services: z.array(z.string()).default([]),
  location: z.string().min(2),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankBranch: z.string().optional(),
  availabilityStatus: z.boolean().default(true),
  rating: z.number().min(1).max(5).default(5),
  notes: z.string().optional(),
});

export const quotationRequestSchema = z.object({
  weddingId: z.string(),
  vendorId: z.string(),
  categoryId: z.string(),
  guestCount: z.number().int().positive().default(400),
  eventDate: z.string().optional(),
  baseAmount: z.number().nonnegative().or(z.string()).default(0),
  pricePerPlate: z.number().nonnegative().or(z.string()).default(0),
  extraHourRate: z.number().nonnegative().or(z.string()).default(0),
  menuDetails: z.any().optional(),
  includedServices: z.array(z.string()).default([]),
  excludedServices: z.array(z.string()).default([]),
  additionalStaffCost: z.number().nonnegative().or(z.string()).default(0),
  transportationCost: z.number().nonnegative().or(z.string()).default(0),
  taxRate: z.number().nonnegative().or(z.string()).default(18),
  discountAmount: z.number().nonnegative().or(z.string()).default(0),
  validityDate: z.string().optional(),
  terms: z.string().optional(),
});

export const taskSchema = z.object({
  weddingId: z.string(),
  taskName: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(['PRE_WEDDING', 'EVENT_DAY', 'POST_WEDDING']).default('PRE_WEDDING'),
  assignedEmployeeId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().optional(),
  dueDate: z.string(),
  status: z.enum(['TO_PLAN', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE']).default('TO_PLAN'),
  notes: z.string().optional(),
});

export const eventTimelineSchema = z.object({
  weddingId: z.string(),
  eventName: z.string().min(2),
  eventDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().min(2),
  responsibleEmployeeId: z.string().optional(),
  vendorId: z.string().optional(),
  priority: z.string().default('MEDIUM'),
  status: z.string().default('SCHEDULED'),
  notes: z.string().optional(),
});

export const incidentSchema = z.object({
  weddingId: z.string(),
  eventId: z.string().optional(),
  vendorId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().min(5),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedEmployeeId: z.string().optional(),
});

export const guestSchema = z.object({
  weddingId: z.string(),
  guestGroup: z.string().default('General'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  invitationStatus: z.string().default('NOT_SENT'),
  rsvpStatus: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']).default('PENDING'),
  dietaryPreference: z.enum(['VEG', 'JAIN', 'NON_VEG', 'VEGAN', 'OTHER']).default('VEG'),
  accommodationAssigned: z.boolean().default(false),
  roomNumber: z.string().optional(),
  transportationNeeded: z.boolean().default(false),
  plusGuests: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  weddingId: z.string(),
  milestoneId: z.string().optional(),
  amount: z.number().positive().or(z.string()),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHEQUE', 'UPI', 'CASH', 'CARD']).default('BANK_TRANSFER'),
  transactionRef: z.string().min(3),
  notes: z.string().optional(),
});

export const extraExpenseSchema = z.object({
  weddingId: z.string(),
  category: z.string().min(2),
  description: z.string().min(2),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive().or(z.string()),
  taxRate: z.number().nonnegative().or(z.string()).default(18),
  vendorId: z.string().optional(),
  receiptUrl: z.string().optional(),
});
