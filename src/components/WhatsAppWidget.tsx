import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { FOUNDER_CONTACTS, buildWhatsAppUrl } from '../shared/agencyData.ts';
import type { FounderKey } from '../types.ts';

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [founderKey, setFounderKey] = useState<FounderKey>('meghana');
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');

  const selectedFounder = FOUNDER_CONTACTS[founderKey];

  const handleLaunchWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const composed = `Hi ${selectedFounder.name}, I'm reaching out from Form and Function${
      businessName.trim() ? ` for ${businessName.trim()}` : ''
    }. ${message.trim() || 'I would like to discuss a website and local SEO project.'}`;
    const url = buildWhatsAppUrl(selectedFounder.whatsappDigits, composed);
    window.location.assign(url);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div
          role="dialog"
          aria-label="WhatsApp quick chat"
          className="mb-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-[#E5E7EB] shadow-lg p-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">WhatsApp Instant Chat</h3>
              <p className="text-[11px] text-[#6B7280]">
                Direct line to Meghana &amp; Jayanth
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close WhatsApp chat"
              className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleLaunchWhatsApp} className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {(['meghana', 'jayanth'] as FounderKey[]).map((key) => {
                const f = FOUNDER_CONTACTS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFounderKey(key)}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      founderKey === key
                        ? 'border-[#047857] bg-[#ECFDF5]'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-[#111827]">{f.name}</span>
                    <span
                      className="block text-[11px] text-[#4B5563] tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {f.phone}
                    </span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name (optional)"
              aria-label="Your business name"
              className="w-full px-3 py-2 text-xs bg-[#FAFAF9] border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#047857]"
            />

            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${selectedFounder.name}...`}
              aria-label="WhatsApp message"
              className="w-full px-3 py-2 text-xs bg-[#FAFAF9] border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#047857]"
            />

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Start WhatsApp Chat</span>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open WhatsApp instant chat"
        aria-expanded={open}
        className="w-12 h-12 rounded-full bg-[#047857] hover:bg-[#065F46] text-white shadow-md inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#047857] focus-visible:ring-offset-2"
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>
    </div>
  );
}
