/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

// Client-side session state. Real authentication happens against the backend
// (POST /api/login returns a Bearer token); this module just persists the
// resulting user and maps the backend role onto the app's two roles.
import { setAuthToken } from './api';

const STORAGE_KEY = 'brewmaster_auth';

export type Role = 'admin' | 'guest';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: Role;
}

// Admin demo credential — shown as a hint on the login page (validated by the backend).
export const DEMO_ADMIN = { email: 'admin@brewmaster.com', password: 'brew1234' };

// Guests don't authenticate with the backend; they use the public
// POST /api/guest/orders endpoint. This is their local identity.
export const GUEST_USER: AuthUser = { email: 'guest@brewmaster.com', name: 'Guest Cashier', role: 'guest' };

// Map a backend role string (e.g. "Owner", "Admin", "guest") onto our two roles.
export function mapRole(backendRole: string | undefined): Role {
  return (backendRole ?? '').toLowerCase() === 'guest' ? 'guest' : 'admin';
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.email) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name ?? 'User',
      role: parsed.role === 'guest' ? 'guest' : 'admin',
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function signIn(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
  setAuthToken(null);
}
