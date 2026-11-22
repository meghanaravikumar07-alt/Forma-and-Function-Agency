import type {
  ClientTestimonial,
  FounderContact,
  FounderKey,
  PortfolioProject,
  ServicePackage,
} from '../types.ts';

export const AGENCY_NAME = 'Form and Function';

export const FOUNDER_CONTACTS: Record<FounderKey, FounderContact> = {
  meghana: {
    key: 'meghana',
    name: 'Meghana',
    role: 'Co-Founder · Web Architecture & Conversion UX',
    phone: '7676261078',
    displayPhone: '+91 76762 61078',
    whatsappDigits: '917676261078',
    gpayHandle: '7676261078@okaxis',
    specialty: 'Custom Local Websites, Speed Optimization & Google Pay Integration',
  },
  jayanth: {
    key: 'jayanth',
    name: 'Jayanth',
    role: 'Co-Founder · Local SEO & Search Growth',
    phone: '8310611317',
    displayPhone: '+91 83106 11317',
    whatsappDigits: '918310611317',
    gpayHandle: '8310611317@okaxis',
    specialty: 'Google Maps Local Pack Ranking, Schema & Citation Audits',
  },
};

export const SERVICE_CATALOG: ServicePackage[] = [
  {
    id: 'local-launchpad',
    indexLabel: '01.',
    title: 'Local Launchpad Website',
    shortTitle: 'Local Launchpad',
    priceInr: 14999,
    billingCycle: 'One-Time',
    turnaround: '10 Days',
    summary:
      'A conversion-focused, mobile-first website engineered for neighborhood clinics, cafes, salons, and service businesses with instant WhatsApp and phone call routing.',
    deliverables: [
      'Custom 5-page responsive web build under 1.0s LCP',
      'LocalBusiness JSON-LD schema & city-targeted page copy',
      'Click-to-call, phone inquiry capture & WhatsApp handover',
      'Google Business Profile sync and SSL deployment',
    ],
    recommendedFor: 'New or redesigning local businesses seeking immediate credibility',
  },
  {
    id: 'local-seo-sprint',
    indexLabel: '02.',
    title: 'Local SEO & Google Maps Dominance',
    shortTitle: 'Local SEO Retainer',
    priceInr: 9999,
    billingCycle: 'Monthly',
    turnaround: 'Ongoing 30-Day Cycle',
    summary:
      'Systematic local search ranking optimization designed to put your storefront in the Google Maps 3-Pack for high-intent "near me" searches.',
    deliverables: [
      'Google Business Profile category, Q&A & photo cadence',
      '35+ NAP-consistent local directory & map citations',
      'Hyper-local landing pages for surrounding neighborhoods',
      'Monthly rank movement, call clicks & direction reporting',
    ],
    recommendedFor: 'Established brick-and-mortar shops losing clicks to local competitors',
  },
  {
    id: 'growth-engine',
    indexLabel: '03.',
    title: 'Full Web + Local SEO + Booking Engine',
    shortTitle: 'Complete Growth Engine',
    priceInr: 24999,
    billingCycle: 'One-Time',
    turnaround: '14 Days',
    summary:
      'Our flagship end-to-end package combining bespoke web design, online appointment scheduling, Google Pay UPI collection, and 90-day local search launch.',
    deliverables: [
      'Full custom multi-page web platform + service booking flow',
      'Direct Google Pay / UPI payment & client receipt tracking',
      'Complete technical + local on-page SEO foundation',
      '90-day priority rank monitoring by Jayanth & Meghana',
    ],
    recommendedFor: 'Clinics, studios, and multi-service local brands scaling bookings',
  },
  {
    id: 'speed-audit',
    indexLabel: '04.',
    title: 'Core Web Vitals & Local SEO Audit',
    shortTitle: '48-Hour Diagnostic Audit',
    priceInr: 4999,
    billingCycle: 'One-Time',
    turnaround: '48 Hours',
    summary:
      'A forensic technical teardown of why your current website is slow or buried below page one, delivered with a prioritized fix blueprint and 1-on-1 walkthrough.',
    deliverables: [
      'Google Maps ranking gap analysis vs. top 3 local rivals',
      'Mobile speed, CLS, and image payload diagnostic report',
      'Keyword intent map & meta/schema correction checklist',
      '45-minute strategy call directly with Meghana & Jayanth',
    ],
    recommendedFor: 'Business owners wanting clear proof and quick wins before a full build',
  },
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'forage-and-flour',
    title: 'Forage & Flour Artisan Sourdough',
    clientName: 'Forage & Flour Bakery',
    location: 'Indiranagar, Bengaluru',
    category: 'E-Commerce',
    imageUrl: '/src/assets/images/portfolio_artisan_bakery_1795364165389.jpg',
    imageAlt: 'Forage & Flour artisan sourdough bakery counter with morning sunlight',
    primaryMetric: '+185% Google Maps Direction Clicks in 90 Days',
    secondaryMetric: '0.7s Mobile Load Speed',
    lighthouseScore: 99,
    summary:
      'Built a pre-order bread reservation storefront with daily batch counters and neighborhood local SEO pages targeting weekend sourdough buyers.',
    beforeState:
      'Relied solely on Instagram DMs and ranked #9 on Google Maps for "artisan bakery near me" with a 4.8s slow third-party link page.',
    strategyExecuted:
      'Engineered an ultra-light static pre-order web storefront, embedded Bakery & Menu schema markup, and optimized 42 Google Business Profile product listings.',
    outcomeAchieved:
      'Moved to #1 in the Local Map Pack within 11 weeks, cutting manual DM order handling by 65% and growing weekend pre-orders by 3.2x.',
    seoKeywordsRanked: ['artisan sourdough bakery', 'fresh sourdough indiranagar', 'bakery pre order near me'],
  },
  {
    id: 'aurora-dental',
    title: 'Aurora Dental & Wellness Studio',
    clientName: 'Aurora Dental Clinic',
    location: 'Jayanagar, Bengaluru',
    category: 'Web & Booking',
    imageUrl: '/src/assets/images/portfolio_dental_clinic_1795364165951.jpg',
    imageAlt: 'Aurora Dental and Wellness reception with walnut slats and travertine stone desk',
    primaryMetric: '3.8x Online Consultation Bookings in 4 Months',
    secondaryMetric: '#1 Rank for 14 Local Keywords',
    lighthouseScore: 98,
    summary:
      'Designed a calm, patient-first clinic website with treatment-specific local SEO pages, direct slot booking, and instant WhatsApp patient triage.',
    beforeState:
      'Outdated template site with broken mobile appointment forms and zero visibility for high-intent implant and aligner searches.',
    strategyExecuted:
      'Created dedicated Dentist & MedicalClinic schema pages per procedure, streamlined booking down to 3 fields, and built local healthcare directory citations.',
    outcomeAchieved:
      'Organic local search calls increased from 18 to 74 per month while front-desk phone scheduling workload dropped noticeably.',
    seoKeywordsRanked: ['dentist in jayanagar', 'invisible aligners clinic', 'cosmetic dental studio near me'],
  },
  {
    id: 'blackstone-detailing',
    title: 'Blackstone Automotive Detailing',
    clientName: 'Blackstone Detailing Studio',
    location: 'Koramangala, Bengaluru',
    category: 'Local SEO',
    imageUrl: '/src/assets/images/portfolio_auto_detailing_1795364165844.jpg',
    imageAlt: 'Blackstone automotive detailing bay with gloss black coupe under studio lights',
    primaryMetric: '+240% Qualified Ceramic Coating Leads in 120 Days',
    secondaryMetric: '₹14.6L Attributed Local Pipeline',
    lighthouseScore: 97,
    summary:
      'Rebuilt service package architecture with transparent tier comparisons, WhatsApp quote routing, and hyper-local PPF & ceramic SEO landing pages.',
    beforeState:
      'Zero organic page-one rankings and inconsistent pricing inquiries coming only from paid social ads.',
    strategyExecuted:
      'Structured individual neighborhood landing pages, verified Geo-tagged workshop media, and integrated direct WhatsApp vehicle photo submission.',
    outcomeAchieved:
      'Captured #1 and #2 Map Pack spots across 6 surrounding pin codes, eliminating dependency on expensive paid ad clicks.',
    seoKeywordsRanked: ['ceramic coating koramangala', 'ppf car detailing studio', 'paint correction near me'],
  },
  {
    id: 'terra-and-leaf',
    title: 'Terra & Leaf Conservatory',
    clientName: 'Terra & Leaf Landscape Design',
    location: 'Sadashivanagar, Bengaluru',
    category: 'Web & Booking',
    imageUrl: '/src/assets/images/portfolio_botanical_nursery_1795364165472.jpg',
    imageAlt: 'Terra & Leaf sunlit indoor plant conservatory with stoneware planters',
    primaryMetric: '+162% Residential Consultation Requests in 6 Months',
    secondaryMetric: '99/100 Mobile Core Web Vitals',
    lighthouseScore: 99,
    summary:
      'Crafted an architectural plant and balcony landscaping showcase with site-visit booking, curated planter lookbooks, and local affluent-locality SEO.',
    beforeState:
      'High-value residential clients could not discover their bespoke balcony design services online; foot traffic was purely word-of-mouth.',
    strategyExecuted:
      'Developed gallery-grade imagery compression with WebP/srcset discipline, HomeAndConstructionBusiness schema, and targeted neighborhood case studies.',
    outcomeAchieved:
      'Booked 28 high-ticket residential landscape consultations directly from organic search in the first two quarters post-launch.',
    seoKeywordsRanked: ['balcony garden design', 'indoor plant studio bengaluru', 'landscape architect near me'],
  },
];

export const CLIENT_TESTIMONIALS: ClientTestimonial[] = [
  {
    id: 'test-1',
    clientName: 'Dr. Kavya Deshmukh',
    role: 'Clinical Director',
    businessName: 'Aurora Dental & Wellness',
    location: 'Jayanagar',
    serviceUsed: 'Full Web + Local SEO + Booking Engine',
    metricHighlight: '18 → 74 monthly organic patient calls',
    quote:
      'Before working with Meghana and Jayanth, our clinic barely appeared on Google Maps outside our street. Within four months of launching the new site and local procedure pages, organic patient bookings overtook every paid channel we ran.',
  },
  {
    id: 'test-2',
    clientName: 'Rohan Kulkarni',
    role: 'Founder',
    businessName: 'Blackstone Automotive Detailing',
    location: 'Koramangala',
    serviceUsed: 'Local SEO & Google Maps Dominance',
    metricHighlight: '+240% organic coating inquiries',
    quote:
      'Every change they made was tied to measurable local searches. Pairing fast package pages with instant WhatsApp vehicle quotes turned casual searchers into booked bay slots without back-and-forth calls.',
  },
  {
    id: 'test-3',
    clientName: 'Ananya Menon',
    role: 'Owner & Head Baker',
    businessName: 'Forage & Flour Sourdough',
    location: 'Indiranagar',
    serviceUsed: 'Local Launchpad Website',
    metricHighlight: '#1 Map Pack rank · 3.2x weekend pre-orders',
    quote:
      'Our customers used to message us on Instagram just to ask what loaves were available. Form and Function built a fast ordering flow and ranked us first locally, saving hours every morning before bake-off.',
  },
];

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const allowedDigits = phoneDigits === '917676261078' || phoneDigits === '918310611317'
    ? phoneDigits
    : '917676261078';
  return `https://wa.me/${allowedDigits}?text=${encodeURIComponent(message)}`;
}

export function buildUpiDeepLink(
  recipientKey: FounderKey,
  amount: number,
  bookingCode: string
): string {
  const founder = FOUNDER_CONTACTS[recipientKey] ?? FOUNDER_CONTACTS.meghana;
  const params = new URLSearchParams({
    pa: founder.gpayHandle,
    pn: `${founder.name} - Form and Function`,
    am: String(Math.max(1, Math.round(amount))),
    cu: 'INR',
    tn: `Form & Function ${bookingCode}`,
  });
  return `upi://pay?${params.toString()}`;
}
