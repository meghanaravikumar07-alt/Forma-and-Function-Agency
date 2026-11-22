import { useState } from 'react';
import { Lock } from 'lucide-react';
import type { UserProfile } from '../types.ts';

interface AuthInlineCardProps {
  title?: string;
  subtitle?: string;
  onAuthenticated: (user: UserProfile, token: string, sseToken: string) => void;
}

export function AuthInlineCard({
  title = 'Client Account Sign In',
  subtitle = 'Access your service bookings, Google Pay checkout, and verified transaction history logs.',
  onAuthenticated,
}: AuthInlineCardProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? { name, businessName, phone, email, password }
          : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please check your details.');
        return;
      }

      onAuthenticated(data.user, data.token, data.sseToken);
    } catch {
      setErrorMsg('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-xl font-bold text-[#111827]">{title}</h3>
          <p className="text-sm text-[#4B5563] mt-1">{subtitle}</p>
        </div>

        <div className="inline-flex p-1 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB] shrink-0 self-start">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Sign In
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="auth-name" className="block text-xs font-semibold text-[#374151] mb-1.5">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label
                htmlFor="auth-business"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Local Business Name
              </label>
              <input
                id="auth-business"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sharma Dental Care"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label htmlFor="auth-phone" className="block text-xs font-semibold text-[#374151] mb-1.5">
                Phone Number (WhatsApp &amp; Calls)
              </label>
              <input
                id="auth-phone"
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
              <label htmlFor="auth-email-reg" className="block text-xs font-semibold text-[#374151] mb-1.5">
                Work Email
              </label>
              <input
                id="auth-email-reg"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <label htmlFor="auth-email-login" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email-login"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-password" className="block text-xs font-semibold text-[#374151] mb-1.5">
            Password {mode === 'register' && <span className="font-normal text-[#6B7280]">(min 8 characters)</span>}
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
          />
        </div>

        {errorMsg && (
          <p role="alert" className="text-xs font-medium text-[#B91C1C]">
            {errorMsg}
          </p>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Encrypted session · Scoped to your business account</span>
          </span>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            {loading
              ? 'Please wait...'
              : mode === 'register'
                ? 'Create Client Account'
                : 'Sign In to Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
