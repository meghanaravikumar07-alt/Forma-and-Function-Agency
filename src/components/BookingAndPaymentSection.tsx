import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Phone } from 'lucide-react';
import {
  FOUNDER_CONTACTS,
  SERVICE_CATALOG,
  formatInr,
} from '../shared/agencyData.ts';
import type {
  BookingRecord,
  FounderKey,
  TransactionRecord,
  UserProfile,
} from '../types.ts';
import { AuthInlineCard } from './AuthInlineCard.tsx';
import { GooglePayCheckoutPanel } from './GooglePayCheckoutPanel.tsx';

interface BookingAndPaymentSectionProps {
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  user: UserProfile | null;
  authToken: string | null;
  onAuthenticated: (user: UserProfile, token: string, sseToken: string) => void;
  onBookingCreated: (booking: BookingRecord) => void;
  onTransactionRecorded: (txn: TransactionRecord, updatedBooking: BookingRecord) => void;
}

function getDefaultKickoffDate(): string {
  const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
  return date.toISOString().slice(0, 10);
}

export function BookingAndPaymentSection({
  selectedServiceId,
  onSelectServiceId,
  user,
  authToken,
  onAuthenticated,
  onBookingCreated,
  onTransactionRecorded,
}: BookingAndPaymentSectionProps) {
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [preferredDate, setPreferredDate] = useState(getDefaultKickoffDate);
  const [recipientKey, setRecipientKey] = useState<FounderKey>('meghana');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [confirmedTxn, setConfirmedTxn] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    if (user) {
      setClientName((prev) => prev || user.name);
      setBusinessName((prev) => prev || user.businessName);
      setPhone((prev) => prev || user.phone);
      setEmail((prev) => prev || user.email);
    }
  }, [user]);

  const selectedService =
    SERVICE_CATALOG.find((item) => item.id === selectedServiceId) ?? SERVICE_CATALOG[0];

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          clientName,
          businessName,
          phone,
          email,
          city,
          preferredDate,
          recipientKey,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Could not create booking. Please review your details.');
        return;
      }

      setConfirmedTxn(null);
      setActiveBooking(data.booking);
      onBookingCreated(data.booking);
    } catch {
      setErrorMsg('Network error while saving booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left summary column */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#1E40AF] mb-2">
                Service Booking &amp; Google Pay Checkout
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance">
                Reserve your kickoff slot and settle directly via UPI
              </h2>
              <p className="mt-3 text-sm text-[#4B5563] leading-relaxed">
                Every booking creates a tracked project record in your Client Portal and lets you
                pay 50% deposit or full settlement directly to Meghana or Jayanth via Google Pay.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E5E7EB] space-y-4">
              <div>
                <span className="text-xs text-[#6B7280]">Selected Service Package</span>
                <h3 className="text-base font-bold text-[#111827] mt-0.5">
                  {selectedService.title}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className="text-xl font-bold text-[#1E40AF] tabular-nums"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatInr(selectedService.priceInr)}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    ({selectedService.turnaround})
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] space-y-2 text-xs text-[#4B5563]">
                <div className="flex items-center justify-between">
                  <span>50% Kickoff Deposit</span>
                  <span className="font-semibold text-[#111827] tabular-nums">
                    {formatInr(Math.ceil(selectedService.priceInr * 0.5))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Direct Google Pay Numbers</span>
                  <span className="font-medium text-[#111827]">Meghana / Jayanth</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#E5E7EB] space-y-2.5 text-xs text-[#4B5563]">
              <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#1E40AF]" aria-hidden="true" />
                <span>Direct Founder Lines</span>
              </p>
              <p className="tabular-nums">
                Meghana (Web &amp; UX):{' '}
                <a href="tel:+917676261078" className="font-semibold text-[#111827] hover:underline">
                  7676261078
                </a>
              </p>
              <p className="tabular-nums">
                Jayanth (Local SEO):{' '}
                <a href="tel:+918310611317" className="font-semibold text-[#111827] hover:underline">
                  8310611317
                </a>
              </p>
            </div>
          </div>

          {/* Right interactive booking / auth / checkout column */}
          <div className="lg:col-span-8">
            {!user || !authToken ? (
              <AuthInlineCard
                title="Step 1 · Create or Sign In to Your Client Account"
                subtitle="Your account securely stores your service booking, Google Pay UTR receipts, and real-time project ledger."
                onAuthenticated={onAuthenticated}
              />
            ) : confirmedTxn ? (
              <div className="bg-white rounded-xl border border-[#BBF7D0] p-6 sm:p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#047857] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">
                      Payment Recorded in Your Transaction History
                    </h3>
                    <p className="text-sm text-[#4B5563] mt-1">
                      Transaction <span className="font-mono font-semibold">{confirmedTxn.txnCode}</span>{' '}
                      for <span className="font-semibold">{formatInr(confirmedTxn.amount)}</span> to{' '}
                      {confirmedTxn.recipientName} ({confirmedTxn.recipientPhone}) has been saved.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#FAFAF9] border border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#6B7280] block">Booking Code</span>
                    <span className="font-mono font-semibold text-[#111827]">
                      {confirmedTxn.bookingCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block">UTR Reference</span>
                    <span className="font-mono font-semibold text-[#111827]">
                      {confirmedTxn.utrReference}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block">Recipient</span>
                    <span className="font-semibold text-[#111827]">
                      {confirmedTxn.recipientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block">Status</span>
                    <span className="font-semibold text-[#047857]">{confirmedTxn.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#client-portal"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] rounded-lg transition-colors"
                  >
                    View Full Transaction Ledger
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedTxn(null);
                      setActiveBooking(null);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-[#111827] border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                  >
                    Book Another Service
                  </button>
                </div>
              </div>
            ) : activeBooking ? (
              <GooglePayCheckoutPanel
                booking={activeBooking}
                authToken={authToken}
                onPaymentRecorded={(txn, updatedBooking) => {
                  setConfirmedTxn(txn);
                  setActiveBooking(updatedBooking);
                  onTransactionRecorded(txn, updatedBooking);
                }}
                onClose={() => setActiveBooking(null)}
              />
            ) : (
              <form
                onSubmit={handleCreateBooking}
                className="bg-[#FAFAF9] rounded-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-5"
              >
                <div className="pb-4 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#111827]">
                      Step 2 · Configure Service Booking
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Signed in as {user.name} ({user.email})
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#4B5563]">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Next step: Google Pay QR / UPI</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="booking-service"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Service Package
                    </label>
                    <select
                      id="booking-service"
                      value={selectedService.id}
                      onChange={(e) => onSelectServiceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      {SERVICE_CATALOG.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.indexLabel} {service.title} — {formatInr(service.priceInr)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-name"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Contact Name
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Phone Number (Inquiries &amp; Updates)
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-business"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Business Name
                    </label>
                    <input
                      id="booking-business"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-city"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Target City / Neighborhood
                    </label>
                    <input
                      id="booking-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Indiranagar, Bengaluru"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-date"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Preferred Kickoff Date
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-founder"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Preferred Lead &amp; Google Pay Recipient
                    </label>
                    <select
                      id="booking-founder"
                      value={recipientKey}
                      onChange={(e) => setRecipientKey(e.target.value as FounderKey)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option value="meghana">
                        Meghana ({FOUNDER_CONTACTS.meghana.phone}) — Web &amp; UX
                      </option>
                      <option value="jayanth">
                        Jayanth ({FOUNDER_CONTACTS.jayanth.phone}) — Local SEO
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="booking-notes"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Website URL &amp; Local Ranking Goals (Optional)
                    </label>
                    <textarea
                      id="booking-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share your current website (if any), top local services, or target neighborhood keywords..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                    {errorMsg}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-[#6B7280]">
                    Total Package: <strong className="text-[#111827]">{formatInr(selectedService.priceInr)}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                  >
                    {submitting ? 'Creating Booking...' : 'Create Booking & Proceed to Google Pay'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
