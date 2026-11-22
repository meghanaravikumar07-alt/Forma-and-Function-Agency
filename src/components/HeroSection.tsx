import { ArrowRight, MessageSquare } from 'lucide-react';
import { FOUNDER_CONTACTS, buildWhatsAppUrl } from '../shared/agencyData.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface HeroSectionProps {
  onBookClick: () => void;
  onPortfolioClick: () => void;
}

export function HeroSection({ onBookClick, onPortfolioClick }: HeroSectionProps) {
  const quickWhatsAppUrl = buildWhatsAppUrl(
    FOUNDER_CONTACTS.meghana.whatsappDigits,
    'Hi Meghana & Jayanth, I visited Form and Function and would like to discuss a website and local SEO project for my business.'
  );

  return (
    <section id="top" className="pt-10 pb-14 sm:pt-14 sm:pb-20 border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Two-column editorial split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#4B5563] mb-4">
                Local Business Web Architecture
                <span aria-hidden="true" className="mx-2 text-[#9CA3AF]">
                  ·
                </span>
                Google Maps &amp; Local SEO
                <span aria-hidden="true" className="mx-2 text-[#9CA3AF]">
                  ·
                </span>
                Meghana &amp; Jayanth
              </p>

              <h1
                className="font-bold tracking-tight text-[#111827] text-balance leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Websites and local SEO built to rank neighborhood businesses first
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-xl">
                Form and Function designs sub-second websites, online booking flows, and Google Maps
                ranking systems that turn local searches into phone calls, WhatsApp inquiries, and
                walk-in customers.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBookClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
              >
                <span>Book a Service</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={quickWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#111827] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
              >
                <MessageSquare className="w-4 h-4 text-[#047857]" aria-hidden="true" />
                <span>WhatsApp Studio</span>
              </a>

              <button
                type="button"
                onClick={onPortfolioClick}
                className="px-3 py-3 text-sm font-medium text-[#4B5563] hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Case Studies
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="w-full h-full min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6]">
              <ResilientImage
                src="/src/assets/images/hero_agency_studio_1795364164565.jpg"
                alt="Form and Function architectural web design workspace with sunlit concrete and oak desk"
                fallbackTitle="Form and Function Studio"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column studio benchmark & direct contact strip below hero split */}
        <div className="mt-10 pt-8 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#111827] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
              98–100
            </span>
            <span className="mt-1 text-sm font-medium text-[#111827]">Lighthouse Speed Target</span>
            <span className="text-xs text-[#6B7280] mt-0.5">Sub-second first paint on mobile networks</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#111827] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
              10–14 Days
            </span>
            <span className="mt-1 text-sm font-medium text-[#111827]">Launch Turnaround</span>
            <span className="text-xs text-[#6B7280] mt-0.5">From kickoff brief to live indexed pages</span>
          </div>

          <div className="flex flex-col">
            <a
              href={`tel:+91${FOUNDER_CONTACTS.meghana.phone}`}
              className="text-2xl font-bold text-[#1E40AF] hover:underline tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              7676261078
            </a>
            <span className="mt-1 text-sm font-medium text-[#111827]">Meghana · Web &amp; UX Lead</span>
            <span className="text-xs text-[#6B7280] mt-0.5">Direct Call, WhatsApp &amp; Google Pay</span>
          </div>

          <div className="flex flex-col">
            <a
              href={`tel:+91${FOUNDER_CONTACTS.jayanth.phone}`}
              className="text-2xl font-bold text-[#1E40AF] hover:underline tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              8310611317
            </a>
            <span className="mt-1 text-sm font-medium text-[#111827]">Jayanth · Local SEO Lead</span>
            <span className="text-xs text-[#6B7280] mt-0.5">Direct Call, WhatsApp &amp; Google Pay</span>
          </div>
        </div>
      </div>
    </section>
  );
}
