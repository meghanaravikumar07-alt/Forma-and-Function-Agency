import { ArrowUpRight, Check, MessageSquare } from 'lucide-react';
import {
  FOUNDER_CONTACTS,
  SERVICE_CATALOG,
  buildWhatsAppUrl,
  formatInr,
} from '../shared/agencyData.ts';

interface ServicesSectionProps {
  selectedServiceId: string;
  onSelectServiceForBooking: (serviceId: string) => void;
}

export function ServicesSection({
  selectedServiceId,
  onSelectServiceForBooking,
}: ServicesSectionProps) {
  return (
    <section id="services" className="py-16 sm:py-20 border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-[#1E40AF] mb-2">
              Services &amp; Fixed-Scope Packages
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111827] text-balance">
              Built for local search visibility and immediate customer inquiries
            </h2>
          </div>
          <p className="text-sm text-[#4B5563] max-w-sm leading-relaxed">
            Transparent pricing in INR with a 50% kickoff deposit option via direct Google Pay to
            Meghana or Jayanth.
          </p>
        </div>

        {/* Asymmetric bento-style grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {SERVICE_CATALOG.map((service, index) => {
            const isSelected = service.id === selectedServiceId;
            const colSpanClass = index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5';
            const assignedFounder =
              service.id === 'local-seo-sprint' || service.id === 'speed-audit'
                ? FOUNDER_CONTACTS.jayanth
                : FOUNDER_CONTACTS.meghana;

            const waLink = buildWhatsAppUrl(
              assignedFounder.whatsappDigits,
              `Hi ${assignedFounder.name}, I would like to inquire about "${service.title}" (${formatInr(service.priceInr)}) from Form and Function.`
            );

            return (
              <article
                key={service.id}
                className={`${colSpanClass} bg-white rounded-xl border p-6 sm:p-8 flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-[#1E40AF] ring-1 ring-[#1E40AF]/20'
                    : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-[#F3F4F6]">
                    <div>
                      <p className="text-xs text-[#6B7280] mb-1">
                        {service.turnaround}
                        <span aria-hidden="true" className="mx-2">
                          ·
                        </span>
                        {service.billingCycle}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#111827]">
                        {service.indexLabel} {service.title}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span
                        className="text-2xl font-bold text-[#111827] tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {formatInr(service.priceInr)}
                      </span>
                      <p className="text-xs text-[#6B7280] tabular-nums">
                        {service.billingCycle === 'Monthly' ? 'per month' : 'fixed project'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                    {service.summary}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-[#1F2937]">
                        <Check
                          className="w-4 h-4 text-[#1E40AF] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-[#F3F4F6] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#6B7280]">{service.recommendedFor}</span>

                  <div className="flex items-center gap-3">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#111827] border border-[#D1D5DB] rounded-lg hover:bg-[#F3F4F6] transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#047857]" aria-hidden="true" />
                      <span>Ask {assignedFounder.name}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onSelectServiceForBooking(service.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1E3A8A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Book Package</span>
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
