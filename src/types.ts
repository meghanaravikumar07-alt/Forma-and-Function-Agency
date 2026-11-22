export type FounderKey = 'meghana' | 'jayanth';

export type PaymentPlan = 'deposit_50' | 'full_100' | 'balance_50';

export type PaymentStatus = 'pending' | 'partial_submitted' | 'paid_submitted' | 'verified';

export type BookingStatus = 'scheduled' | 'in_progress' | 'completed';

export type TransactionStatus = 'Recorded' | 'Verified' | 'Refunded';

export interface FounderContact {
  key: FounderKey;
  name: string;
  role: string;
  phone: string;
  displayPhone: string;
  whatsappDigits: string;
  gpayHandle: string;
  specialty: string;
}

export interface ServicePackage {
  id: string;
  indexLabel: string;
  title: string;
  shortTitle: string;
  priceInr: number;
  billingCycle: 'One-Time' | 'Monthly';
  turnaround: string;
  summary: string;
  deliverables: string[];
  recommendedFor: string;
}

export type PortfolioCategory = 'All Projects' | 'Local SEO' | 'Web & Booking' | 'E-Commerce';

export interface PortfolioProject {
  id: string;
  title: string;
  clientName: string;
  location: string;
  category: Exclude<PortfolioCategory, 'All Projects'>;
  imageUrl: string;
  imageAlt: string;
  primaryMetric: string;
  secondaryMetric: string;
  lighthouseScore: number;
  summary: string;
  beforeState: string;
  strategyExecuted: string;
  outcomeAchieved: string;
  seoKeywordsRanked: string[];
}

export interface ClientTestimonial {
  id: string;
  clientName: string;
  role: string;
  businessName: string;
  location: string;
  serviceUsed: string;
  metricHighlight: string;
  quote: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  role: 'client' | 'admin';
  createdAt: string;
}

export interface BookingRecord {
  id: string;
  bookingCode: string;
  userId: string;
  clientName: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  serviceId: string;
  serviceTitle: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  preferredDate: string;
  recipientKey: FounderKey;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  txnCode: string;
  userId: string;
  bookingId: string;
  bookingCode: string;
  serviceTitle: string;
  recipientKey: FounderKey;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: string;
  paymentPlan: PaymentPlan;
  amount: number;
  utrReference: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface InquiryRecord {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  serviceId: string;
  recipientKey: FounderKey;
  message: string;
  channel: 'web_form' | 'whatsapp_handover';
  createdAt: string;
}
