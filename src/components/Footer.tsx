import { FOUNDER_CONTACTS } from '../shared/agencyData.ts';

export function Footer() {
  return (
    <footer className="bg-[#FAFAF9] py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
          <div>
            <span
              className="text-lg font-bold tracking-tight text-[#111827]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Form &amp; Function
            </span>
            <p className="text-xs text-[#6B7280] mt-1">
              Local Business Web Design &amp; Local Search Optimization Agency
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#4B5563]">
            <a href="#services" className="hover:text-[#111827] hover:underline underline-offset-4">
              Services
            </a>
            <a href="#portfolio" className="hover:text-[#111827] hover:underline underline-offset-4">
              Portfolio
            </a>
            <a href="#testimonials" className="hover:text-[#111827] hover:underline underline-offset-4">
              Testimonials
            </a>
            <a href="#booking" className="hover:text-[#111827] hover:underline underline-offset-4">
              Book Service
            </a>
            <a href="#client-portal" className="hover:text-[#111827] hover:underline underline-offset-4">
              Client Portal
            </a>
            <a href="#contact" className="hover:text-[#111827] hover:underline underline-offset-4">
              Contact
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>© {new Date().getFullYear()} Form and Function. All rights reserved.</p>
          <p className="tabular-nums">
            Meghana:{' '}
            <a href={`tel:+91${FOUNDER_CONTACTS.meghana.phone}`} className="text-[#111827] hover:underline">
              {FOUNDER_CONTACTS.meghana.phone}
            </a>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            Jayanth:{' '}
            <a href={`tel:+91${FOUNDER_CONTACTS.jayanth.phone}`} className="text-[#111827] hover:underline">
              {FOUNDER_CONTACTS.jayanth.phone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
