/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Check, CheckCircle2 } from 'lucide-react';
import { OrderKHQR, MERCHANT } from '../lib/khqr';
import { api } from '../lib/api';

interface KHQRModalProps {
  payment: OrderKHQR;
  orderId?: string | null;
  onClose: () => void;
  // Called when staff confirms the customer has paid (manual confirmation until
  // the backend exposes an md5 transaction-status check for true auto-detect).
  onPaid?: (orderId?: string | null) => void;
}

// KHQR payment dialog — shows the scannable QR for the order total, then a
// success screen once payment is confirmed.
export default function KHQRModal({ payment, orderId, onClose, onPaid }: KHQRModalProps) {
  const symbol = payment.currency === 'USD' ? '$' : '៛';
  const [paid, setPaid] = useState(false);
  const [remaining, setRemaining] = useState(() => Math.max(0, payment.expiresAt - Date.now()));

  useEffect(() => {
    if (paid) return;
    const id = setInterval(() => setRemaining(Math.max(0, payment.expiresAt - Date.now())), 1000);
    return () => clearInterval(id);
  }, [payment.expiresAt, paid]);

  // Auto-detect payment: poll the backend (Bakong check_transaction_by_md5) every
  // few seconds and flip to the success screen once paid. Stops on success,
  // expiry, unmount, or the first error (e.g. token not configured) — the manual
  // "Mark as Paid" button remains as a fallback.
  useEffect(() => {
    if (paid || !payment.md5) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      if (!active || Date.now() >= payment.expiresAt) return;
      try {
        const res = await api.checkKhqr(payment.md5);
        if (active && res.paid) {
          setPaid(true);
          onPaid?.(orderId);
          return;
        }
      } catch {
        active = false; // endpoint/token not ready — fall back to manual confirm
        return;
      }
      if (active) timer = setTimeout(poll, 3000);
    };
    timer = setTimeout(poll, 3000);
    return () => { active = false; clearTimeout(timer); };
    // onPaid/orderId are stable enough; re-polling only needs to react to paid/md5.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid, payment.md5, payment.expiresAt]);

  const expired = remaining <= 0;
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-bento-raised overflow-hidden">
        {/* KHQR red header */}
        <div className="relative bg-[#e21c23] px-5 py-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-white text-2xl font-extrabold tracking-tight">KHQR</span>
        </div>

        {/* Merchant + amount */}
        <div className="px-6 pt-5 pb-3 text-center border-b border-dashed border-outline-variant/40">
          <p className="text-sm font-semibold text-on-surface-variant truncate">{MERCHANT.name}</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">
            {symbol}{payment.amount.toFixed(2)}
          </p>
        </div>

        {paid ? (
          /* ----- Success screen ----- */
          <>
            <div className="px-6 py-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg font-extrabold text-primary">Payment received</p>
              <p className="text-sm text-on-surface-variant mt-1">
                {symbol}{payment.amount.toFixed(2)} confirmed{orderId ? ` · Order #${orderId}` : ''}
              </p>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary-container font-bold text-sm py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </div>
          </>
        ) : (
          /* ----- QR + confirm screen ----- */
          <>
            <div className="px-6 py-6 flex flex-col items-center">
              <div className={`relative p-3 rounded-2xl bg-white border border-outline-variant/30 ${expired ? 'opacity-30' : ''}`}>
                <QRCodeSVG value={payment.qr} size={216} level="M" marginSize={0} />
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded bg-[#e21c23] text-white text-[10px] font-extrabold">KHQR</span>
                </span>
              </div>

              {expired ? (
                <p className="mt-4 text-sm font-bold text-error">QR expired — close and place again.</p>
              ) : (
                <p className="mt-4 text-xs text-on-surface-variant">
                  Scan with any Bakong-supported app · expires in{' '}
                  <span className="font-bold text-primary tabular-nums">{mm}:{ss.toString().padStart(2, '0')}</span>
                </p>
              )}
              {orderId && (
                <p className="mt-1 text-[11px] text-on-surface-variant/70">Order #{orderId}</p>
              )}
              <p className="mt-3 text-[11px] text-on-surface-variant/60">Waiting for payment…</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
