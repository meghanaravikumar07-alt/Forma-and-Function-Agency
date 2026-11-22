import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  isSignedIn: boolean;
}

export function Navbar({ onNavigate, isSignedIn }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="text-lg font-bold tracking-tight text-[#111827] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Form &amp; Function
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]"
        >
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('services');
            }}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Services
          </a>
          <a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('portfolio');
            }}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Portfolio
          </a>
          <a
            href="#testimonials"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('testimonials');
            }}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Testimonials
          </a>
          <a
            href="#client-portal"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('client-portal');
            }}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {isSignedIn ? 'Account Ledger' : 'Client Portal'}
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact');
            }}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: Single primary CTA + Mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('booking')}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1E3A8A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
          >
            Book a Service
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E5E7EB] text-[#111827] bg-white hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 flex flex-col gap-1"
        >
          {[
            { id: 'services', label: 'Services' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'testimonials', label: 'Testimonials' },
            { id: 'client-portal', label: isSignedIn ? 'Account Ledger' : 'Client Portal' },
            { id: 'contact', label: 'Contact & Inquiry' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="py-2.5 px-2 text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] rounded-md"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
