import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { FOUNDER_CONTACTS, SERVICE_CATALOG } from './src/shared/agencyData.ts';
import type { FounderKey, PaymentPlan } from './src/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Initialize persistent SQLite database
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'form_and_function.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    business_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    service_id TEXT NOT NULL,
    recipient_key TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    amount_paid INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    booking_status TEXT NOT NULL DEFAULT 'scheduled',
    preferred_date TEXT NOT NULL,
    recipient_key TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    txn_code TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    booking_id TEXT NOT NULL,
    booking_code TEXT NOT NULL,
    service_title TEXT NOT NULL,
    recipient_key TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_plan TEXT NOT NULL,
    amount INTEGER NOT NULL,
    utr_reference TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
  );
`);

// Security helpers
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, salt, 64);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

interface TokenPayload {
  sub: string;
  email: string;
  role: 'client' | 'admin';
  purpose: 'auth' | 'sse';
  exp: number;
}

function signToken(payload: Omit<TokenPayload, 'exp'>, ttlMs = TOKEN_TTL_MS): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + ttlMs,
  };
  const body = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token: string, expectedPurpose: 'auth' | 'sse'): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (!parsed || typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') return null;
    if (parsed.purpose !== expectedPurpose || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Validation helpers
function cleanString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function normalizePhone(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

function isValidPhone(digits: string): boolean {
  return /^\d{10,15}$/.test(digits);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function isValidFounderKey(key: unknown): key is FounderKey {
  return key === 'meghana' || key === 'jayanth';
}

function isValidPaymentPlan(plan: unknown): plan is PaymentPlan {
  return plan === 'deposit_50' || plan === 'full_100' || plan === 'balance_50';
}

function isValidUtr(utr: string): boolean {
  return /^[A-Za-z0-9]{10,24}$/.test(utr);
}

// Real-time SSE subscriber registry keyed by userId
const sseSubscribers = new Map<string, Set<Response>>();

function broadcastUserSync(userId: string, eventType: string, referenceCode?: string): void {
  const subs = sseSubscribers.get(userId);
  if (!subs || subs.size === 0) return;
  const payload = JSON.stringify({
    type: eventType,
    referenceCode: referenceCode ?? null,
    timestamp: new Date().toISOString(),
  });
  for (const res of subs) {
    res.write(`event: ledger_sync\ndata: ${payload}\n\n`);
  }
}

interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    businessName: string;
    role: 'client' | 'admin';
    createdAt: string;
  };
}

interface DbUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  password_hash: string;
  role: 'client' | 'admin';
  created_at: string;
}

function mapUserRow(row: DbUserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    businessName: row.business_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  const payload = verifyToken(token, 'auth');
  if (!payload) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  const user = db
    .prepare('SELECT id, name, email, phone, business_name, password_hash, role, created_at FROM users WHERE id = ?')
    .get(payload.sub) as DbUserRow | undefined;
  if (!user) {
    res.status(401).json({ error: 'Account not found. Please sign in again.' });
    return;
  }
  req.authUser = mapUserRow(user);
  next();
}

function optionalAuth(req: AuthenticatedRequest): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const payload = verifyToken(header.slice('Bearer '.length).trim(), 'auth');
  return payload?.sub ?? null;
}

interface DbBookingRow {
  id: string;
  booking_code: string;
  user_id: string;
  client_name: string;
  business_name: string;
  phone: string;
  email: string;
  city: string;
  service_id: string;
  service_title: string;
  total_amount: number;
  amount_paid: number;
  payment_status: string;
  booking_status: string;
  preferred_date: string;
  recipient_key: FounderKey;
  notes: string;
  created_at: string;
  updated_at: string;
}

function mapBookingRow(row: DbBookingRow) {
  return {
    id: row.id,
    bookingCode: row.booking_code,
    userId: row.user_id,
    clientName: row.client_name,
    businessName: row.business_name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    serviceId: row.service_id,
    serviceTitle: row.service_title,
    totalAmount: row.total_amount,
    amountPaid: row.amount_paid,
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    preferredDate: row.preferred_date,
    recipientKey: row.recipient_key,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface DbTransactionRow {
  id: string;
  txn_code: string;
  user_id: string;
  booking_id: string;
  booking_code: string;
  service_title: string;
  recipient_key: FounderKey;
  recipient_name: string;
  recipient_phone: string;
  payment_method: string;
  payment_plan: PaymentPlan;
  amount: number;
  utr_reference: string;
  status: string;
  created_at: string;
}

function mapTransactionRow(row: DbTransactionRow) {
  return {
    id: row.id,
    txnCode: row.txn_code,
    userId: row.user_id,
    bookingId: row.booking_id,
    bookingCode: row.booking_code,
    serviceTitle: row.service_title,
    recipientKey: row.recipient_key,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    paymentMethod: row.payment_method,
    paymentPlan: row.payment_plan,
    amount: row.amount,
    utrReference: row.utr_reference,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'form-and-function' });
  });

  // Auth routes
  app.post('/api/auth/register', (req, res) => {
    const name = cleanString(req.body?.name, 100);
    const email = cleanString(req.body?.email, 160).toLowerCase();
    const phone = normalizePhone(req.body?.phone);
    const businessName = cleanString(req.body?.businessName, 140);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!isValidPhone(phone)) {
      res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    if (businessName.length < 2) {
      res.status(400).json({ error: 'Please enter your business name.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const passwordHash = hashPassword(password);

    db.prepare(
      'INSERT INTO users (id, name, email, phone, business_name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name, email, phone, businessName, passwordHash, 'client', createdAt);

    const user = {
      id,
      name,
      email,
      phone,
      businessName,
      role: 'client' as const,
      createdAt,
    };

    const token = signToken({ sub: id, email, role: 'client', purpose: 'auth' });
    const sseToken = signToken({ sub: id, email, role: 'client', purpose: 'sse' });

    res.status(201).json({ user, token, sseToken });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = cleanString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || password.length === 0) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const row = db
      .prepare('SELECT id, name, email, phone, business_name, password_hash, role, created_at FROM users WHERE email = ?')
      .get(email) as DbUserRow | undefined;

    if (!row || !verifyPassword(password, row.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = mapUserRow(row);
    const token = signToken({ sub: user.id, email: user.email, role: user.role, purpose: 'auth' });
    const sseToken = signToken({ sub: user.id, email: user.email, role: user.role, purpose: 'sse' });

    res.json({ user, token, sseToken });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const sseToken = signToken({ sub: user.id, email: user.email, role: user.role, purpose: 'sse' });
    res.json({ user, sseToken });
  });

  // Real-time SSE stream scoped strictly to the authenticated user's sseToken
  app.get('/api/events', (req, res) => {
    const streamToken = typeof req.query.streamToken === 'string' ? req.query.streamToken : '';
    const payload = verifyToken(streamToken, 'sse');
    if (!payload) {
      res.status(401).json({ error: 'Invalid event stream token.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const userId = payload.sub;
    let userSet = sseSubscribers.get(userId);
    if (!userSet) {
      userSet = new Set();
      sseSubscribers.set(userId, userSet);
    }
    userSet.add(res);

    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'live' })}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      const currentSet = sseSubscribers.get(userId);
      if (currentSet) {
        currentSet.delete(res);
        if (currentSet.size === 0) {
          sseSubscribers.delete(userId);
        }
      }
    });
  });

  // Public / optionally authenticated inquiry submission
  app.post('/api/inquiries', (req: AuthenticatedRequest, res) => {
    const userId = optionalAuth(req);
    const name = cleanString(req.body?.name, 100);
    const businessName = cleanString(req.body?.businessName, 140);
    const phone = normalizePhone(req.body?.phone);
    const email = cleanString(req.body?.email, 160).toLowerCase();
    const city = cleanString(req.body?.city, 100);
    const serviceId = cleanString(req.body?.serviceId, 60) || 'local-launchpad';
    const recipientKey = isValidFounderKey(req.body?.recipientKey) ? req.body.recipientKey : 'meghana';
    const message = cleanString(req.body?.message, 800);
    const channel = req.body?.channel === 'whatsapp_handover' ? 'whatsapp_handover' : 'web_form';

    if (name.length < 2) {
      res.status(400).json({ error: 'Please provide your name.' });
      return;
    }
    if (!isValidPhone(phone)) {
      res.status(400).json({ error: 'Please enter a valid 10-digit phone number for callbacks.' });
      return;
    }
    if (email && !isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(
      `INSERT INTO inquiries
        (id, user_id, name, business_name, phone, email, city, service_id, recipient_key, message, channel, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      name,
      businessName || 'Local Business',
      phone,
      email || 'not-provided@client.local',
      city || 'Local Area',
      serviceId,
      recipientKey,
      message || 'Callback requested via website',
      channel,
      createdAt
    );

    res.status(201).json({
      inquiry: {
        id,
        name,
        businessName: businessName || 'Local Business',
        phone,
        email,
        city: city || 'Local Area',
        serviceId,
        recipientKey,
        message,
        channel,
        createdAt,
      },
    });
  });

  // Create service booking (authenticated user account)
  app.post('/api/bookings', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const serviceId = cleanString(req.body?.serviceId, 60);
    const service = SERVICE_CATALOG.find((item) => item.id === serviceId);
    if (!service) {
      res.status(400).json({ error: 'Please select a valid agency service package.' });
      return;
    }

    const clientName = cleanString(req.body?.clientName, 100) || user.name;
    const businessName = cleanString(req.body?.businessName, 140) || user.businessName;
    const phone = normalizePhone(req.body?.phone || user.phone);
    const email = cleanString(req.body?.email, 160).toLowerCase() || user.email;
    const city = cleanString(req.body?.city, 100);
    const preferredDate = cleanString(req.body?.preferredDate, 32);
    const recipientKey = isValidFounderKey(req.body?.recipientKey) ? req.body.recipientKey : 'meghana';
    const notes = cleanString(req.body?.notes, 1000);

    if (!isValidPhone(phone)) {
      res.status(400).json({ error: 'Please provide a valid 10-digit contact phone number.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid contact email.' });
      return;
    }
    if (city.length < 2) {
      res.status(400).json({ error: 'Please enter your city or neighborhood for local SEO targeting.' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      res.status(400).json({ error: 'Please select a valid preferred kickoff date.' });
      return;
    }

    const id = crypto.randomUUID();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingCode = `FF-${randomSuffix}`;
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO bookings (
        id, booking_code, user_id, client_name, business_name, phone, email, city,
        service_id, service_title, total_amount, amount_paid, payment_status, booking_status,
        preferred_date, recipient_key, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', 'scheduled', ?, ?, ?, ?, ?)`
    ).run(
      id,
      bookingCode,
      user.id,
      clientName,
      businessName,
      phone,
      email,
      city,
      service.id,
      service.title,
      service.priceInr,
      preferredDate,
      recipientKey,
      notes,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as unknown as DbBookingRow;
    broadcastUserSync(user.id, 'booking_created', bookingCode);

    res.status(201).json({ booking: mapBookingRow(created) });
  });

  // Fetch authenticated user's bookings and transaction logs
  app.get('/api/portal/ledger', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const bookingRows = db
      .prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC')
      .all(user.id) as unknown as DbBookingRow[];

    const txnRows = db
      .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC')
      .all(user.id) as unknown as DbTransactionRow[];

    res.json({
      bookings: bookingRows.map(mapBookingRow),
      transactions: txnRows.map(mapTransactionRow),
    });
  });

  // Submit Google Pay / UPI payment transaction for an owned booking
  app.post('/api/transactions', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const bookingId = cleanString(req.body?.bookingId, 80);
    const recipientKey = req.body?.recipientKey;
    const paymentPlan = req.body?.paymentPlan;
    const utrReference = cleanString(req.body?.utrReference, 32).toUpperCase();

    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required.' });
      return;
    }
    if (!isValidFounderKey(recipientKey)) {
      res.status(400).json({ error: 'Please choose Meghana or Jayanth as the Google Pay recipient.' });
      return;
    }
    if (!isValidPaymentPlan(paymentPlan)) {
      res.status(400).json({ error: 'Please select a valid payment plan.' });
      return;
    }
    if (!isValidUtr(utrReference)) {
      res.status(400).json({
        error: 'Enter a valid 10 to 24 character Google Pay UPI Transaction ID / UTR reference (letters and numbers only).',
      });
      return;
    }

    const booking = db
      .prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?')
      .get(bookingId, user.id) as DbBookingRow | undefined;

    if (!booking) {
      res.status(404).json({ error: 'Booking not found for this account.' });
      return;
    }

    const remaining = booking.total_amount - booking.amount_paid;
    if (remaining <= 0) {
      res.status(400).json({ error: 'This booking has already been fully settled.' });
      return;
    }

    let computedAmount = remaining;
    if (paymentPlan === 'deposit_50' && booking.amount_paid === 0) {
      computedAmount = Math.ceil(booking.total_amount * 0.5);
    } else if (paymentPlan === 'balance_50' || paymentPlan === 'full_100') {
      computedAmount = remaining;
    }

    const duplicateUtr = db
      .prepare('SELECT id FROM transactions WHERE utr_reference = ?')
      .get(utrReference) as { id: string } | undefined;

    if (duplicateUtr) {
      res.status(409).json({
        error: 'This Google Pay UTR reference has already been recorded. Check your Transaction History below.',
      });
      return;
    }

    const founder = FOUNDER_CONTACTS[recipientKey];
    const txnId = crypto.randomUUID();
    const txnCode = `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const now = new Date().toISOString();
    const nextAmountPaid = booking.amount_paid + computedAmount;
    const nextPaymentStatus = nextAmountPaid >= booking.total_amount ? 'paid_submitted' : 'partial_submitted';

    try {
      db.exec('BEGIN');
      db.prepare(
        `INSERT INTO transactions (
          id, txn_code, user_id, booking_id, booking_code, service_title,
          recipient_key, recipient_name, recipient_phone, payment_method,
          payment_plan, amount, utr_reference, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        txnId,
        txnCode,
        user.id,
        booking.id,
        booking.booking_code,
        booking.service_title,
        founder.key,
        founder.name,
        founder.phone,
        'Google Pay (UPI)',
        paymentPlan,
        computedAmount,
        utrReference,
        'Recorded',
        now
      );

      db.prepare(
        `UPDATE bookings
         SET amount_paid = ?, payment_status = ?, booking_status = ?, recipient_key = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      ).run(
        nextAmountPaid,
        nextPaymentStatus,
        'in_progress',
        founder.key,
        now,
        booking.id,
        user.id
      );

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id) as unknown as DbBookingRow;
    const createdTxn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txnId) as unknown as DbTransactionRow;

    broadcastUserSync(user.id, 'transaction_recorded', txnCode);

    res.status(201).json({
      transaction: mapTransactionRow(createdTxn),
      booking: mapBookingRow(updatedBooking),
    });
  });

  // Vite middleware in dev, static serving in production
  if (!IS_PRODUCTION) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Form and Function server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
