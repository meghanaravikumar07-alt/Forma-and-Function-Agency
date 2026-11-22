import { useState } from 'react';
import { CreditCard, LogOut, Printer, RefreshCw, Search, X } from 'lucide-react';
import { formatInr } from '../shared/agencyData.ts';
import type { BookingRecord, TransactionRecord, UserProfile } from '../types.ts';
import { AuthInlineCard } from './AuthInlineCard.tsx';
import { GooglePayCheckoutPanel } from './GooglePayCheckoutPanel.tsx';

interface ClientPortalSectionProps {
  user: UserProfile | null;
  authToken: string | null;
  bookings: BookingRecord[];
  transactions: TransactionRecord[];
  loadingLedger: boolean;
  isLiveConnected: boolean;
  onAuthenticated: (user: UserProfile, token: string, sseToken: string) => void;
  onSignOut: () => void;
  onRefreshLedger: () => void;
  onTransactionRecorded: (txn: TransactionRecord, updatedBooking: BookingRecord) => void;
}

function formatPaymentStatusLabel(status: BookingRecord['paymentStatus']): string {
  switch (status) {
    case 'pending':
      return 'Awaiting Payment';
    case 'partial_submitted':
      return '50% Deposit Logged';
    case 'paid_submitted':
      return 'Full Payment Logged';
    case 'verified':
      return 'Verified';
    default:
      return status;
  }
}

export function ClientPortalSection({
  user,
  authToken,
  bookings,
  transactions,
  loadingLedger,
  isLiveConnected,
  onAuthenticated,
  onSignOut,
  onRefreshLedger,
  onTransactionRecorded,
}: ClientPortalSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'meghana' | 'jayanth'>('all');
  const [settlingBooking, setSettlingBooking] = useState<BookingRecord | null>(null);
  const [receiptTxn, setReceiptTxn] = useState<TransactionRecord | null>(null);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesRecipient =
      recipientFilter === 'all' || txn.recipientKey === recipientFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      txn.txnCode.toLowerCase().includes(q) ||
      txn.bookingCode.toLowerCase().includes(q) ||
      txn.utrReference.toLowerCase().includes(q) ||
      txn.serviceTitle.toLowerCase().includes(q);
    return matchesRecipient && matchesSearch;
  });

  const totalSettled = transactions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section id="client-portal" className="py-16 sm:py-20 border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-[#1E40AF] mb-2">
              Client Account &amp; Transaction History Ledger
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111827] text-balance">
              Real-time booking status and Google Pay transaction logs
            </h2>
          </div>

          {user && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRefreshLedger}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#111827] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? 'animate-spin' : ''}`} />
                <span>Sync Ledger</span>
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#4B5563] bg-white border border-[#D1D5DB] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {!user || !authToken ? (
          <AuthInlineCard
            title="Sign In to View Your Transaction History"
            subtitle="Every client account stores private booking timelines, remaining balances, and timestamped Google Pay UTR transaction logs."
            onAuthenticated={onAuthenticated}
          />
        ) : (
          <div className="space-y-8">
            {/* Account Summary Strip */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <span className="text-xs text-[#6B7280] block">Account Holder</span>
                <span className="text-base font-bold text-[#111827]">{user.name}</span>
                <span className="text-xs text-[#4B5563] block mt-0.5">{user.businessName}</span>
              </div>

              <div>
                <span className="text-xs text-[#6B7280] block">Registered Phone &amp; Email</span>
                <span
                  className="text-sm font-semibold text-[#111827] tabular-nums block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {user.phone}
                </span>
                <span className="text-xs text-[#4B5563] block truncate">{user.email}</span>
              </div>

              <div>
                <span className="text-xs text-[#6B7280] block">Active Bookings</span>
                <span
                  className="text-2xl font-bold text-[#111827] tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {bookings.length}
                </span>
                <span className="text-xs text-[#6B7280] block">
                  {isLiveConnected ? 'Real-time sync active' : 'Database synced'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#6B7280] block">Total Logged via Google Pay</span>
                <span
                  className="text-2xl font-bold text-[#1E40AF] tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatInr(totalSettled)}
                </span>
                <span className="text-xs text-[#6B7280] block tabular-nums">
                  {transactions.length} recorded transaction{transactions.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Inline Balance Payment Panel when user clicks "Pay Balance" */}
            {settlingBooking && (
              <GooglePayCheckoutPanel
                booking={settlingBooking}
                authToken={authToken}
                onPaymentRecorded={(txn, updatedBooking) => {
                  setSettlingBooking(null);
                  onTransactionRecorded(txn, updatedBooking);
                }}
                onClose={() => setSettlingBooking(null)}
              />
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-bold text-[#111827] mb-4">Your Service Bookings</h3>

              {bookings.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#6B7280]">
                  No service bookings yet.{' '}
                  <a href="#booking" className="font-semibold text-[#1E40AF] hover:underline">
                    Reserve a package above
                  </a>{' '}
                  to get started.
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {bookings.map((booking) => {
                    const balanceDue = Math.max(0, booking.totalAmount - booking.amountPaid);
                    return (
                      <div
                        key={booking.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                            <span className="font-mono font-semibold text-[#111827]">
                              {booking.bookingCode}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Kickoff {booking.preferredDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>{booking.city}</span>
                          </div>
                          <h4 className="text-base font-bold text-[#111827] mt-1">
                            {booking.serviceTitle}
                          </h4>
                          <p className="text-xs text-[#4B5563] mt-0.5 tabular-nums">
                            Paid {formatInr(booking.amountPaid)} of {formatInr(booking.totalAmount)}
                            <span aria-hidden="true" className="mx-2">
                              ·
                            </span>
                            Status: {formatPaymentStatusLabel(booking.paymentStatus)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {balanceDue > 0 ? (
                            <button
                              type="button"
                              onClick={() => setSettlingBooking(booking)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] rounded-lg transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" aria-hidden="true" />
                              <span>Pay {formatInr(balanceDue)} via Google Pay</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-[#047857]">
                              Settled in Full
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transaction History Logs Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    Transaction History Log
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Immutable payment log of Google Pay UPI transfers tied to your account
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search TXN, UTR, or code..."
                      aria-label="Search transaction history"
                      className="pl-8 pr-3 py-1.5 text-xs bg-[#FAFAF9] border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div className="inline-flex p-1 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB]">
                    {(
                      [
                        { key: 'all', label: 'All' },
                        { key: 'meghana', label: 'Meghana' },
                        { key: 'jayanth', label: 'Jayanth' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setRecipientFilter(tab.key)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          recipientFilter === tab.key
                            ? 'bg-white text-[#111827] shadow-sm'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#6B7280] border-t border-[#E5E7EB]">
                  {transactions.length === 0
                    ? 'No transactions recorded on this account yet. Complete a service booking and submit your Google Pay UTR reference to log your first payment.'
                    : 'No transactions match your current filter.'}
                </div>
              ) : (
                <div className="overflow-x-auto border-t border-[#E5E7EB]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280]">
                        <th className="py-3 pr-4">Transaction ID</th>
                        <th className="py-3 px-4">Date &amp; Time</th>
                        <th className="py-3 px-4">Service &amp; Booking</th>
                        <th className="py-3 px-4">Google Pay Recipient</th>
                        <th className="py-3 px-4">UTR Reference</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 pl-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] text-xs sm:text-sm">
                      {filteredTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-[#FAFAF9]">
                          <td
                            className="py-3.5 pr-4 font-medium text-[#111827] tabular-nums whitespace-nowrap"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {txn.txnCode}
                          </td>
                          <td className="py-3.5 px-4 text-[#4B5563] tabular-nums whitespace-nowrap">
                            {new Date(txn.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-[#111827] block">
                              {txn.serviceTitle}
                            </span>
                            <span className="text-xs text-[#6B7280] font-mono">
                              {txn.bookingCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#1F2937] whitespace-nowrap">
                            {txn.recipientName} ({txn.recipientPhone})
                          </td>
                          <td
                            className="py-3.5 px-4 text-[#1F2937] tabular-nums whitespace-nowrap"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {txn.utrReference}
                          </td>
                          <td
                            className="py-3.5 px-4 text-right font-semibold text-[#111827] tabular-nums whitespace-nowrap"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {formatInr(txn.amount)}
                          </td>
                          <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setReceiptTxn(txn)}
                              className="text-xs font-semibold text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptTxn && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setReceiptTxn(null)}
        >
          <div
            className="bg-white rounded-xl border border-[#E5E7EB] max-w-md w-full p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div>
                <p className="text-xs text-[#6B7280]">Form and Function · Payment Receipt</p>
                <h3
                  id="receipt-title"
                  className="text-lg font-bold text-[#111827] mt-0.5 tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {receiptTxn.txnCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptTxn(null)}
                aria-label="Close receipt"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Service</dt>
                <dd className="font-medium text-[#111827] text-right">{receiptTxn.serviceTitle}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Booking Reference</dt>
                <dd className="font-mono text-[#111827]">{receiptTxn.bookingCode}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Paid To (Google Pay)</dt>
                <dd className="font-medium text-[#111827]">
                  {receiptTxn.recipientName} · {receiptTxn.recipientPhone}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">UPI / UTR Reference</dt>
                <dd className="font-mono font-medium text-[#111827]">{receiptTxn.utrReference}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Timestamp</dt>
                <dd className="text-[#111827] tabular-nums">
                  {new Date(receiptTxn.createdAt).toLocaleString('en-IN')}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-[#E5E7EB]">
                <dt className="font-semibold text-[#111827]">Amount Recorded</dt>
                <dd
                  className="font-bold text-lg text-[#1E40AF] tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatInr(receiptTxn.amount)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#111827] hover:bg-[#1F2937] rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
