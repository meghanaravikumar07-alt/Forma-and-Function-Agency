import { useCallback, useEffect, useState } from 'react';
import { BookingAndPaymentSection } from './components/BookingAndPaymentSection.tsx';
import { ClientPortalSection } from './components/ClientPortalSection.tsx';
import { Footer } from './components/Footer.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { InquiryAndContactSection } from './components/InquiryAndContactSection.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PortfolioSection } from './components/PortfolioSection.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { WhatsAppWidget } from './components/WhatsAppWidget.tsx';
import { SERVICE_CATALOG } from './shared/agencyData.ts';
import type { BookingRecord, TransactionRecord, UserProfile } from './types.ts';

export default function App() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(SERVICE_CATALOG[0].id);

  // Security: authToken & sseToken live strictly in React memory (never localStorage/sessionStorage)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [sseToken, setSseToken] = useState<string | null>(null);

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const fetchLedger = useCallback(async (token: string) => {
    setLoadingLedger(true);
    try {
      const response = await fetch('/api/portal/ledger', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setBookings(data.bookings || []);
      setTransactions(data.transactions || []);
    } catch {
      // Keep existing state on transient network hiccup
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  const handleAuthenticated = useCallback(
    (nextUser: UserProfile, nextToken: string, nextSseToken: string) => {
      setUser(nextUser);
      setAuthToken(nextToken);
      setSseToken(nextSseToken);
      void fetchLedger(nextToken);
    },
    [fetchLedger]
  );

  const handleSignOut = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    setSseToken(null);
    setBookings([]);
    setTransactions([]);
    setIsLiveConnected(false);
  }, []);

  // Real-time Server-Sent Events subscription scoped to authenticated user's sseToken
  useEffect(() => {
    if (!authToken || !sseToken) {
      setIsLiveConnected(false);
      return;
    }

    const source = new EventSource(
      `/api/events?streamToken=${encodeURIComponent(sseToken)}`
    );

    source.addEventListener('connected', () => {
      setIsLiveConnected(true);
    });

    source.addEventListener('ledger_sync', () => {
      void fetchLedger(authToken);
    });

    source.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      source.close();
      setIsLiveConnected(false);
    };
  }, [authToken, sseToken, fetchLedger]);

  const handleSelectServiceForBooking = useCallback(
    (serviceId: string) => {
      setSelectedServiceId(serviceId);
      scrollToSection('booking');
    },
    [scrollToSection]
  );

  const handleBookingCreated = useCallback((newBooking: BookingRecord) => {
    setBookings((prev) => [newBooking, ...prev.filter((b) => b.id !== newBooking.id)]);
  }, []);

  const handleTransactionRecorded = useCallback(
    (newTxn: TransactionRecord, updatedBooking: BookingRecord) => {
      setTransactions((prev) => [newTxn, ...prev.filter((t) => t.id !== newTxn.id)]);
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#111827]">
      <Navbar onNavigate={scrollToSection} isSignedIn={Boolean(user)} />

      <main className="flex-1">
        <HeroSection
          onBookClick={() => scrollToSection('booking')}
          onPortfolioClick={() => scrollToSection('portfolio')}
        />

        <ServicesSection
          selectedServiceId={selectedServiceId}
          onSelectServiceForBooking={handleSelectServiceForBooking}
        />

        <PortfolioSection onBookSimilar={handleSelectServiceForBooking} />

        <TestimonialsSection />

        <BookingAndPaymentSection
          selectedServiceId={selectedServiceId}
          onSelectServiceId={setSelectedServiceId}
          user={user}
          authToken={authToken}
          onAuthenticated={handleAuthenticated}
          onBookingCreated={handleBookingCreated}
          onTransactionRecorded={handleTransactionRecorded}
        />

        <ClientPortalSection
          user={user}
          authToken={authToken}
          bookings={bookings}
          transactions={transactions}
          loadingLedger={loadingLedger}
          isLiveConnected={isLiveConnected}
          onAuthenticated={handleAuthenticated}
          onSignOut={handleSignOut}
          onRefreshLedger={() => {
            if (authToken) void fetchLedger(authToken);
          }}
          onTransactionRecorded={handleTransactionRecorded}
        />

        <InquiryAndContactSection authToken={authToken} />
      </main>

      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
