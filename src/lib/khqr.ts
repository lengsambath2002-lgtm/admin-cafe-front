/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

// Generates a KHQR (Bakong) payment string for an order total, using the
// bakong-khqr SDK. Demo merchant values are used for now — swap MERCHANT_* for
// your real Bakong account when going live.
import pkg from 'bakong-khqr';

// The package is CommonJS; grab the named exports off the default import.
const { BakongKHQR, khqrData, IndividualInfo } = pkg as unknown as {
  BakongKHQR: new () => { generateIndividual: (info: unknown) => KHQRResult };
  khqrData: { currency: { usd: number; khr: number } };
  IndividualInfo: new (
    bakongAccountId: string,
    merchantName: string,
    merchantCity: string,
    optionalData?: Record<string, unknown>,
  ) => unknown;
};

interface KHQRResult {
  status?: { code?: number; errorCode?: number | null; message?: string | null };
  data?: { qr?: string; md5?: string };
}

// --- Demo merchant config (placeholder — replace with real Bakong details) ---
export const MERCHANT = {
  bakongAccountId: 'john_smith@devb',
  name: 'Brewmaster Cafe',
  city: 'PHNOM PENH',
  storeLabel: 'Brewmaster',
  terminalLabel: 'POS-1',
};

// How long a generated payment QR stays valid (dynamic KHQR requires an expiry).
const QR_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface OrderKHQR {
  qr: string;
  md5: string;
  amount: number;
  currency: 'USD' | 'KHR';
  expiresAt: number;
}

// Builds a KHQR for the given amount (in USD by default). Throws with the SDK's
// message if generation fails.
export function generateOrderKHQR(
  amount: number,
  opts?: { currency?: 'USD' | 'KHR'; billNumber?: string },
): OrderKHQR {
  const currency = opts?.currency ?? 'USD';
  const expiresAt = Date.now() + QR_TTL_MS;

  const optionalData: Record<string, unknown> = {
    currency: currency === 'USD' ? khqrData.currency.usd : khqrData.currency.khr,
    // Round to 2 decimals — KHQR rejects amounts like 4.31999999999.
    amount: Math.round(amount * 100) / 100,
    storeLabel: MERCHANT.storeLabel,
    terminalLabel: MERCHANT.terminalLabel,
    expirationTimestamp: expiresAt,
  };
  if (opts?.billNumber) optionalData.billNumber = opts.billNumber;

  const info = new IndividualInfo(MERCHANT.bakongAccountId, MERCHANT.name, MERCHANT.city, optionalData);
  const result = new BakongKHQR().generateIndividual(info);

  if (result?.status?.code !== 0 || !result.data?.qr) {
    throw new Error(result?.status?.message || 'Failed to generate KHQR');
  }
  return { qr: result.data.qr, md5: result.data.md5 ?? '', amount, currency, expiresAt };
}
