/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Neutral inline placeholder (4:3) shown when a product/category image fails to
// load — avoids the browser's broken-image icon on cards.
const PLACEHOLDER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 48'><rect width='64' height='48' fill='#ededed'/><circle cx='22' cy='17' r='5' fill='#c4c4c4'/><path d='M8 42 L26 24 L37 35 L45 27 L58 42 Z' fill='#c4c4c4'/></svg>";
export const IMAGE_FALLBACK = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`;

// onError handler — swaps a broken image for the placeholder (once, no loop).
export function onImageError(e: { currentTarget: HTMLImageElement }): void {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.src = IMAGE_FALLBACK;
}
