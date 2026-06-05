/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { createClient } from '@supabase/supabase-js';

// Browser Supabase client — used for persistent image uploads (Storage).
// Uses the public/publishable key, which is safe to expose to the client.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? 'product-images';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
