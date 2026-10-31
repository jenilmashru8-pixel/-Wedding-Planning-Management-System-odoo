import { TaskCategory, TaskPriority } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

export interface TaskTemplateItem {
  taskName: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  daysFromStart: number; // Negative = before wedding, Positive = after wedding
  sortOrder: number;
}

export const FULL_SERVICE_TASKS: TaskTemplateItem[] = [
  // Pre-Wedding (1 to 24)
  { taskName: 'Initial Consultation & Vision Discovery', description: 'Meet with couple to capture aesthetic preferences, traditions, and priorities.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -120, sortOrder: 1 },
  { taskName: 'Detailed Requirement Collection', description: 'Gather family requirements, guest counts, and VIP hospitality requirements.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -115, sortOrder: 2 },
  { taskName: 'Master Budget Finalization', description: 'Establish line-item budget allocation across venues, catering, decor, and artists.', category: 'PRE_WEDDING', priority: 'URGENT', daysFromStart: -110, sortOrder: 3 },
  { taskName: 'Service Agreement Signing & Deposit', description: 'Execute formal service contract and record booking milestone payment.', category: 'PRE_WEDDING', priority: 'URGENT', daysFromStart: -105, sortOrder: 4 },
  { taskName: 'Date & Muhurat Confirmation', description: 'Confirm exact wedding dates, auspicious timings, and duration.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -100, sortOrder: 5 },
  { taskName: 'Venue Shortlisting & Site Inspections', description: 'Scout luxury palace and heritage venues in Jaipur/Udaipur.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -95, sortOrder: 6 },
  { taskName: 'Venue Booking & Retainer Lock', description: 'Finalize contracts with selected palace hotels and luxury resorts.', category: 'PRE_WEDDING', priority: 'URGENT', daysFromStart: -90, sortOrder: 7 },
  { taskName: 'Theme & Concept Moodboard Finalization', description: 'Finalize Royal Heritage, Rajputana Elegance, or Lake Palace aesthetics.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -85, sortOrder: 8 },
  { taskName: 'Decor & Architectural Design Planning', description: 'Plan 3D layouts, floral installations, entry tunnels, and mandap structure.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -80, sortOrder: 9 },
  { taskName: 'Master Guest List Preparation', description: 'Consolidate 400+ guest database, VIP protocols, and family groupings.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -75, sortOrder: 10 },
  { taskName: 'Guest Accommodation Planning & Room Blocks', description: 'Allocate hotel wings, suites, and hospitality welcome kits.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -70, sortOrder: 11 },
  { taskName: 'Luxury Fleet & Airport Logistics Planning', description: 'Charter luxury buses, vintage wedding cars, and airport transfer desks.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -65, sortOrder: 12 },
  { taskName: 'Catering Vendor Selection & Food Tasting', description: 'Evaluate quotes from top caterers, curate 5-star regional Rajasthani/Global menus.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -60, sortOrder: 13 },
  { taskName: 'Photography & Cinematography Selection', description: 'Book candid photographers, drone pilots, and same-day-edit video team.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -55, sortOrder: 14 },
  { taskName: 'Bridal & Groom Makeup Artist Booking', description: 'Lock renowned celebrity MUAs and hair stylists for bride and family.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -50, sortOrder: 15 },
  { taskName: 'Live Bands, DJ & Royal Dhol Booking', description: 'Contract leading DJ, percussionists, live folk musicians, and sound crew.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -45, sortOrder: 16 },
  { taskName: 'Vendor Contracts Approval & Advance Payments', description: 'Finalize contracts and disburse booking advances to all 18 primary vendors.', category: 'PRE_WEDDING', priority: 'URGENT', daysFromStart: -40, sortOrder: 17 },
  { taskName: 'Digital & Physical Invitations Dispatch', description: 'Send digital save-the-dates and distribute luxury royal invitation boxes.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -35, sortOrder: 18 },
  { taskName: 'RSVP Tracking & Dietary Consolidation', description: 'Confirm attendee counts, Jain/Veg dietary requirements, and room lists.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -30, sortOrder: 19 },
  { taskName: 'Master Floor Plan & Seating Layouts', description: 'Finalize guest table charts, royal gaddi seating, and buffet zones.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -25, sortOrder: 20 },
  { taskName: 'Grand Mandap & Stage Engineering Review', description: 'Inspect structure stability, safety permits, and stage fireproofing.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -20, sortOrder: 21 },
  { taskName: 'Architectural Lighting & Power Generator Audit', description: 'Ensure silent backup generators, fairy lights, and facade wash fixtures.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -15, sortOrder: 22 },
  { taskName: 'Sangeet Choreography & Audio-Visual Rehearsal', description: 'Run full technical dry run with sound engineers, LED screens, and family dance lineup.', category: 'PRE_WEDDING', priority: 'MEDIUM', daysFromStart: -7, sortOrder: 23 },
  { taskName: 'Final Vendor Attendance Confirmation', description: 'Reconfirm load-in schedules, dispatch arrival passes, and briefing calls.', category: 'PRE_WEDDING', priority: 'URGENT', daysFromStart: -2, sortOrder: 24 },

  // Wedding Events (25 to 37)
  { taskName: 'Mehendi Ceremony Setup & Floral Decor', description: 'Coordinate bohemian seating, live bangles/bangles counter, and floral canopies.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 0, sortOrder: 25 },
  { taskName: 'Mehendi Live Event Coordination', description: 'Manage artist queues, hospitality chaat counters, and photographer coordination.', category: 'EVENT_DAY', priority: 'MEDIUM', daysFromStart: 0, sortOrder: 26 },
  { taskName: 'Haldi Ceremony Setup & Turmeric Stations', description: 'Set up urli floral tubs, marigold backdrop, and family kurta hampers.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 1, sortOrder: 27 },
  { taskName: 'Haldi Flower Shower Coordination', description: 'Direct phoolon ki holi sequence, water management, and guest change rooms.', category: 'EVENT_DAY', priority: 'MEDIUM', daysFromStart: 1, sortOrder: 28 },
  { taskName: 'Grand Sangeet Setup & Stage Lighting', description: 'Check multi-tier stage, sound console, haze machines, and bar setups.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 1, sortOrder: 29 },
  { taskName: 'Sangeet Execution & Guest Hospitality', description: 'Anchor family performances, DJ set, and late-night banquet service.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 1, sortOrder: 30 },
  { taskName: 'Wedding Ceremony Mandap Setup', description: 'Oversee royal havankund, floral canopy, samagri setup, and sound checks.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 2, sortOrder: 31 },
  { taskName: 'Baraat & Royal Groom Arrival Coordination', description: 'Coordinate vintage car/ghodi, dhol tasha troupe, safa tying, and fireworks.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 2, sortOrder: 32 },
  { taskName: 'Bridal Grand Entry & Phoolon Ki Chaadar', description: 'Direct bridal procession, customized entry anthem, and smoke effects.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 2, sortOrder: 33 },
  { taskName: 'Jaimala / Garland Exchange Management', description: 'Stage hydraulic lift/revolving stage, confetti cannons, and family cueing.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 2, sortOrder: 34 },
  { taskName: 'Pheras & Vedic Wedding Rituals Coordination', description: 'Ensure pandit requirements, havan wood replenishment, and kanyadaan coordination.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 2, sortOrder: 35 },
  { taskName: 'Royal Reception Setup & Seating Transition', description: 'Transform banquets for formal seated dinner, stage backdrop, and champagne tower.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 2, sortOrder: 36 },
  { taskName: 'Reception Execution & Couple Send-off', description: 'Manage VIP guest greetings, live orchestra, and royal vidai coordination.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 2, sortOrder: 37 },

  // Post-Wedding (38 to 44)
  { taskName: 'Vendor Bill Verification & Quotation Match', description: 'Audit all 18 vendor invoices against agreed scope and initial quotations.', category: 'POST_WEDDING', priority: 'HIGH', daysFromStart: 4, sortOrder: 38 },
  { taskName: 'Extra Expense Verification & Client Sign-off', description: 'Compile additional guest plates, extended DJ hours, and generator fuels.', category: 'POST_WEDDING', priority: 'URGENT', daysFromStart: 5, sortOrder: 39 },
  { taskName: 'Vendor Final Settlements & Balance Disbursements', description: 'Disburse remaining balances to caterer, decorator, and all contracted vendors.', category: 'POST_WEDDING', priority: 'URGENT', daysFromStart: 7, sortOrder: 40 },
  { taskName: 'Client Final Invoice Generation', description: 'Issue comprehensive final invoice with contract value, approved extras, and taxes.', category: 'POST_WEDDING', priority: 'HIGH', daysFromStart: 8, sortOrder: 41 },
  { taskName: 'Client Final Payment Settlement', description: 'Reconcile outstanding receivables and generate formal payment receipt.', category: 'POST_WEDDING', priority: 'URGENT', daysFromStart: 10, sortOrder: 42 },
  { taskName: 'Client & Vendor Feedback Collection', description: 'Record reviews, ratings, and operational learnings for future seasons.', category: 'POST_WEDDING', priority: 'MEDIUM', daysFromStart: 12, sortOrder: 43 },
  { taskName: 'Wedding Project Formal Closure & Archival', description: 'Archive media assets, close financial ledger, and record founder review.', category: 'POST_WEDDING', priority: 'MEDIUM', daysFromStart: 14, sortOrder: 44 },
];

export const DAY_OF_TASKS: TaskTemplateItem[] = [
  { taskName: 'Operational Schedule Preparation & Handover', description: 'Prepare minute-by-minute rundown and distribute to family and leads.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -10, sortOrder: 1 },
  { taskName: 'Vendor Advance Check & Contact Verification', description: 'Verify contact list of all 18 external vendors hired by the couple.', category: 'PRE_WEDDING', priority: 'HIGH', daysFromStart: -5, sortOrder: 2 },
  { taskName: 'Venue Load-in & Setup Supervision', description: 'Supervise external decorator and caterer arrivals on event morning.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 0, sortOrder: 3 },
  { taskName: 'Vendor Arrival Check-in & Delay Detection', description: 'Log actual arrival times and resolve missing equipment immediately.', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 0, sortOrder: 4 },
  { taskName: 'Sound, Stage & Lighting Operational Check', description: 'Dry run generator backups, stage clearance, and DJ audio testing.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 0, sortOrder: 5 },
  { taskName: 'Family Movement & Timeline Coordination', description: 'Guide bride, groom, and immediate families through scheduled timings.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 0, sortOrder: 6 },
  { taskName: 'Baraat & Ceremony Crowd Flow Control', description: 'Direct guest seating, procession safety, and entry protocols.', category: 'EVENT_DAY', priority: 'HIGH', daysFromStart: 0, sortOrder: 7 },
  { taskName: 'Live Wedding Operations & Problem Handling', description: 'Promptly triage on-day incidents (delays, technical glitches, extras).', category: 'EVENT_DAY', priority: 'URGENT', daysFromStart: 0, sortOrder: 8 },
  { taskName: 'Vendor Checkout & Inventory Handover', description: 'Verify safe dismantle of rental fixtures and venue condition signoff.', category: 'POST_WEDDING', priority: 'MEDIUM', daysFromStart: 1, sortOrder: 9 },
  { taskName: 'Extra Hours & Additional Consumption Audit', description: 'Reconcile extra hours worked or additional guest count with venue.', category: 'POST_WEDDING', priority: 'HIGH', daysFromStart: 2, sortOrder: 10 },
  { taskName: 'Post-Event Cleanup & Security Closure', description: 'Ensure property returned to venue management without penalties.', category: 'POST_WEDDING', priority: 'MEDIUM', daysFromStart: 2, sortOrder: 11 },
  { taskName: 'Final Day-of Service Sign-off', description: 'Deliver event summary to couple and conclude agency engagement.', category: 'POST_WEDDING', priority: 'MEDIUM', daysFromStart: 3, sortOrder: 12 },
];

export const getTasksForPackage = (packageType: 'FULL_SERVICE' | 'PARTIAL_DAY_OF', weddingStartDate: Date) => {
  const templates = packageType === 'FULL_SERVICE' ? FULL_SERVICE_TASKS : DAY_OF_TASKS;
  return templates.map((item) => {
    const dueDate = addDays(weddingStartDate, item.daysFromStart);
    const startDate = subDays(dueDate, item.category === 'PRE_WEDDING' ? 5 : 1);
    return {
      taskName: item.taskName,
      description: item.description,
      category: item.category,
      priority: item.priority,
      startDate,
      dueDate,
      sortOrder: item.sortOrder,
      isTemplateGenerated: true,
    };
  });
};
