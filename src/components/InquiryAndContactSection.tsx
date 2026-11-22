import { useState } from 'react';
import { Check, CheckCircle2, Copy, MessageSquare, Phone } from 'lucide-react';
import {
  FOUNDER_CONTACTS,
  SERVICE_CATALOG,
  buildWhatsAppUrl,
} from '../shared/agencyData.ts';
import type { FounderKey } from '../types.ts';

interface InquiryAndContactSectionProps {
  authToken: string | null;
}

export function InquiryAndContactSection({ authToken }: InquiryAndContactSectionProps) {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [serviceId, setServiceId] = useState(SERVICE_CATALOG[0].id);
  const [recipientKey, setRecipientKey] = useState<FounderKey>('meghana');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<{
    name: string;
    phone: string;
    recipientKey: FounderKey;
    whatsappUrl: string;
  } | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyNumber = async (num: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopiedPhone(num);
      setTimeout(() => setCopiedPhone(null), 1800);
    } catch {
      setCopiedPhone(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          businessName,
          phone,
          email,
          city,
          serviceId,
          recipientKey,
          message,
          channel: 'web_form',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Please verify your phone number and details.');
        return;
      }

      const founder = FOUNDER_CONTACTS[recipientKey];
      const serviceTitle =
        SERVICE_CATALOG.find((s) => s.id === serviceId)?.title ?? 'Website & Local SEO';

      const waUrl = buildWhatsAppUrl(
        founder.whatsappDigits,
        `Hi ${founder.name}, I'm ${name} from ${businessName || 'my business'} (${city || 'Local'}). Phone: ${phone}. I'm interested in ${serviceTitle}. ${message}`
      );

      setSubmittedRecord({
        name,
        phone,
        recipientKey,
        whatsappUrl: waUrl,
      });

      setName('');
      setBusinessName('');
      setPhone('');
      setEmail('');
      setCity('');
      setMessage('');
    } catch {
      setErrorMsg('Network error submitting inquiry. Please call or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Direct Founder Lines & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#1E40AF] mb-2">
                Direct Client Inquiries
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance">
                Speak directly with Meghana or Jayanth
              </h2>
              <p className="mt-3 text-sm text-[#4B5563] leading-relaxed">
                Leave your phone number for a same-day callback, or message either founder directly
                on WhatsApp for instant project and SEO guidance.
              </p>
            </div>

            <div className="space-y-4">
              {(['meghana', 'jayanth'] as FounderKey[]).map((key) => {
                const founder = FOUNDER_CONTACTS[key];
                const waDirect = buildWhatsAppUrl(
                  founder.whatsappDigits,
                  `Hi ${founder.name}, I'd like to discuss a website and local SEO strategy for my local business.`
                );

                return (
                  <div
                    key={founder.key}
                    className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E5E7EB]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#111827]">{founder.name}</h3>
                        <p className="text-xs text-[#4B5563]">{founder.role}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(founder.phone)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#111827] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] cursor-pointer"
                      >
                        {copiedPhone === founder.phone ? (
                          <>
                            <Check className="w-3 h-3 text-[#047857]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{founder.phone}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="mt-2.5 text-xs text-[#6B7280]">{founder.specialty}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <a
                        href={`tel:+91${founder.phone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#111827] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1E40AF]" aria-hidden="true" />
                        <span>Call {founder.phone}</span>
                      </a>

                      <a
                        href={waDirect}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#047857] hover:bg-[#065F46] rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>WhatsApp {founder.name}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Phone Number Inquiry Form */}
          <div className="lg:col-span-7">
            {submittedRecord ? (
              <div className="bg-[#FAFAF9] rounded-xl border border-[#BBF7D0] p-6 sm:p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#047857] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">
                      Callback Request Received
                    </h3>
                    <p className="text-sm text-[#4B5563] mt-1">
                      Thank you, {submittedRecord.name}. We have logged your phone number (
                      <span className="font-mono font-semibold">{submittedRecord.phone}</span>) for{' '}
                      {FOUNDER_CONTACTS[submittedRecord.recipientKey].name}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={submittedRecord.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>Continue Instant Chat on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSubmittedRecord(null)}
                    className="px-4 py-2.5 text-sm font-medium text-[#111827] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#FAFAF9] rounded-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-4"
              >
                <div className="pb-4 border-b border-[#E5E7EB]">
                  <h3 className="text-lg font-bold text-[#111827]">
                    Request a Free Local SEO &amp; Website Consultation
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Include your phone number for a quick callback or WhatsApp follow-up.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="inquiry-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-phone"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Phone Number (Required)
                    </label>
                    <input
                      id="inquiry-phone"
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
                      htmlFor="inquiry-business"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Business Name
                    </label>
                    <input
                      id="inquiry-business"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Clinic, store, restaurant, etc."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-city"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      City / Locality
                    </label>
                    <input
                      id="inquiry-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Koramangala, Bengaluru"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Email Address (Optional)
                    </label>
                    <input
                      id="inquiry-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-recipient"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Route Inquiry To
                    </label>
                    <select
                      id="inquiry-recipient"
                      value={recipientKey}
                      onChange={(e) => setRecipientKey(e.target.value as FounderKey)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option value="meghana">Meghana (7676261078) — Website &amp; UX</option>
                      <option value="jayanth">Jayanth (8310611317) — Local SEO</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="inquiry-service"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Service Needed
                    </label>
                    <select
                      id="inquiry-service"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      {SERVICE_CATALOG.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="inquiry-message"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      How Can We Help?
                    </label>
                    <textarea
                      id="inquiry-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your business and what local searches you want to rank for..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-medium text-[#B91C1C]">
                    {errorMsg}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                  >
                    {submitting ? 'Sending Inquiry...' : 'Request Callback & WhatsApp Link'}
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
