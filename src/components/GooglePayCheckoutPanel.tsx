import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  FOUNDER_CONTACTS,
  buildUpiDeepLink,
  formatInr,
} from '../shared/agencyData.ts';
import type { BookingRecord, FounderKey, PaymentPlan, TransactionRecord } from '../types.ts';

interface GooglePayCheckoutPanelProps {
  booking: BookingRecord;
  authToken: string;
  onPaymentRecorded: (transaction: TransactionRecord, updatedBooking: BookingRecord) => void;
  onClose?: () => void;
}

export function GooglePayCheckoutPanel({
  booking,
  authToken,
  onPaymentRecorded,
  onClose,
}: GooglePayCheckoutPanelProps) {
  const remainingAmount = Math.max(0, booking.totalAmount - booking.amountPaid);
  const canPayDeposit = booking.amountPaid === 0;

  const [recipientKey, setRecipientKey] = useState<FounderKey>(booking.recipientKey);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>(
    canPayDeposit ? 'deposit_50' : 'balance_50'
  );
  const [utrReference, setUtrReference] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<'phone' | 'amount' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const payableAmount =
    paymentPlan === 'deposit_50' && canPayDeposit
      ? Math.ceil(booking.totalAmount * 0.5)
      : remainingAmount;

  const activeFounder = FOUNDER_CONTACTS[recipientKey];
  const upiUri = buildUpiDeepLink(recipientKey, payableAmount, booking.bookingCode);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiUri, {
      width: 220,
      margin: 2,
      color: { dark: '#111827', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [upiUri]);

  const handleCopy = async (text: string, field: 'phone' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanedUtr = utrReference.trim().toUpperCase();
    if (!/^[A-Z0-9]{10,24}$/.test(cleanedUtr)) {
      setErrorMsg(
        'Enter a valid 10 to 24 character Google Pay UPI Transaction ID / UTR (numbers and letters only).'
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          recipientKey,
          paymentPlan,
          utrReference: cleanedUtr,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Could not record payment. Please check your UTR reference.');
        return;
      }

      setUtrReference('');
      onPaymentRecorded(data.transaction, data.booking);
    } catch {
      setErrorMsg('Network error while recording payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (remainingAmount <= 0) {
    return (
      <div className="p-6 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#14532D]">
        <p className="text-sm font-semibold">Booking {booking.bookingCode} is fully paid.</p>
        <p className="text-xs mt-1">
          View your receipt and complete transaction history in the Client Portal below.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <p className="text-xs font-medium text-[#1E40AF] mb-1">
            Direct Google Pay / UPI Checkout
          </p>
          <h3 className="text-xl font-bold text-[#111827]">
            Pay for {booking.serviceTitle} ({booking.bookingCode})
          </h3>
          <p className="text-xs text-[#6B7280] mt-1 tabular-nums">
            Total Package: {formatInr(booking.totalAmount)}
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            Paid so far: {formatInr(booking.amountPaid)}
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            Remaining: {formatInr(remainingAmount)}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-[#4B5563] hover:text-[#111827] underline underline-offset-4 cursor-pointer"
          >
            Back to Booking
          </button>
        )}
      </div>

      {/* Step 1: Payment Plan & Recipient Selector */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <span className="block text-xs font-semibold text-[#374151] mb-2">
              1. Select Payment Option
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {canPayDeposit ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPaymentPlan('deposit_50')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentPlan === 'deposit_50'
                        ? 'border-[#1E40AF] bg-[#EFF6FF]'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <span className="block text-xs font-medium text-[#4B5563]">
                      50% Kickoff Deposit
                    </span>
                    <span
                      className="block text-base font-bold text-[#111827] tabular-nums mt-0.5"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatInr(Math.ceil(booking.totalAmount * 0.5))}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan('full_100')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentPlan === 'full_100'
                        ? 'border-[#1E40AF] bg-[#EFF6FF]'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <span className="block text-xs font-medium text-[#4B5563]">
                      100% Full Payment
                    </span>
                    <span
                      className="block text-base font-bold text-[#111827] tabular-nums mt-0.5"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatInr(remainingAmount)}
                    </span>
                  </button>
                </>
              ) : (
                <div className="sm:col-span-2 p-3 rounded-lg border border-[#1E40AF] bg-[#EFF6FF]">
                  <span className="block text-xs font-medium text-[#4B5563]">
                    Remaining Balance Settlement
                  </span>
                  <span
                    className="block text-base font-bold text-[#111827] tabular-nums mt-0.5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatInr(remainingAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#374151] mb-2">
              2. Choose Agency Google Pay Number
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['meghana', 'jayanth'] as FounderKey[]).map((key) => {
                const founder = FOUNDER_CONTACTS[key];
                const isSelected = recipientKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRecipientKey(key)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#1E40AF] bg-[#EFF6FF]'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[#111827]">
                      {founder.name}
                    </span>
                    <span
                      className="block text-xs text-[#4B5563] tabular-nums mt-0.5"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {founder.phone}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct copyable Google Pay details */}
          <div className="p-4 rounded-lg bg-[#FAFAF9] border border-[#E5E7EB] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-xs text-[#6B7280]">
                  Google Pay Phone Number ({activeFounder.name})
                </span>
                <span
                  className="text-base font-bold text-[#111827] tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {activeFounder.phone}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(activeFounder.phone, 'phone')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] cursor-pointer"
              >
                {copiedField === 'phone' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy No.</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E5E7EB]">
              <div>
                <span className="block text-xs text-[#6B7280]">Exact Amount Due</span>
                <span
                  className="text-base font-bold text-[#1E40AF] tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatInr(payableAmount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(payableAmount), 'amount')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] cursor-pointer"
              >
                {copiedField === 'amount' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy INR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Scannable QR + Direct App Launch + UTR Confirmation */}
        <div className="flex flex-col justify-between bg-[#FAFAF9] rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-[#374151] mb-3">
              Scan with Google Pay / Any UPI App
            </span>

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Google Pay UPI QR Code for ${activeFounder.name} (${activeFounder.phone})`}
                className="w-44 h-44 rounded-lg border border-[#E5E7EB] bg-white p-2"
              />
            ) : (
              <div className="w-44 h-44 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center text-xs text-[#6B7280]">
                Generating QR...
              </div>
            )}

            <a
              href={upiUri}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#111827] hover:bg-[#1F2937] rounded-lg transition-colors"
            >
              <span>Open Google Pay / UPI App</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
            <p className="mt-2 text-[11px] text-[#6B7280]">
              Or send directly inside Google Pay to mobile number{' '}
              <span className="font-semibold text-[#111827] tabular-nums">
                {activeFounder.phone}
              </span>{' '}
              ({activeFounder.name})
            </p>
          </div>

          <form onSubmit={handleSubmitUtr} className="mt-5 pt-4 border-t border-[#E5E7EB] space-y-3">
            <label
              htmlFor={`utr-${booking.id}`}
              className="block text-xs font-semibold text-[#111827]"
            >
              3. Enter Google Pay UPI Transaction ID / UTR to Log Receipt
            </label>
            <input
              id={`utr-${booking.id}`}
              type="text"
              required
              value={utrReference}
              onChange={(e) => setUtrReference(e.target.value)}
              placeholder="e.g. 432718920145"
              maxLength={24}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
              style={{ fontFamily: 'var(--font-mono)' }}
            />

            {errorMsg && (
              <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Recording Transaction...' : 'Confirm & Log Google Pay Payment'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
