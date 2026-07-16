// ─── Asset source ─────────────────────────────────────────────────────────────
// Where PDFs and question-slice images are served from.
//
// Set VITE_R2_PUBLIC_URL in your .env to your bucket's public URL, e.g.
//   VITE_R2_PUBLIC_URL=https://pub-263db9f5fa45478587e20aa3adda45c0.r2.dev
//
// If it's unset, assets fall back to local /public (dev without R2 still works).
// Vite exposes only vars prefixed with VITE_ to the browser — this is safe;
// it's a public read URL, not a secret.

// The bucket's PUBLIC read URL. Hard-coded as a fallback on purpose:
// if VITE_R2_PUBLIC_URL is missing at BUILD time (e.g. not set in the
// Cloudflare Pages dashboard), R2 used to become '' and every asset URL
// turned into a relative path like /library/book.pdf. That file isn't on
// Pages (it lives in R2), so the SPA "not_found_handling" rule served
// index.html instead — which is why clicking a PDF opened The Nexus in a
// new tab. A public read URL is not a secret, so a literal fallback is safe
// and removes an entire class of silent breakage.
const R2_FALLBACK = 'https://pub-263db9f5fa45478587e20aa3adda45c0.r2.dev';

const R2 = (import.meta.env.VITE_R2_PUBLIC_URL || R2_FALLBACK).replace(/\/$/, '');

if (!import.meta.env.VITE_R2_PUBLIC_URL && import.meta.env.DEV) {
  console.warn('[assets] VITE_R2_PUBLIC_URL is not set — using the built-in R2 URL. ' +
               'Add it to .env (local) and to your Cloudflare Pages build variables.');
}

// PDF for a paper, e.g. papers/9702_s19_qp_11.pdf
export const paperUrl = (subject, season, year2, type, paper, variant) => {
  const file = `${subject}_${season}${year2}_${type}_${paper}${variant}.pdf`;
  return R2 ? `${R2}/papers/${file}` : `/papers/${file}`;
};

// Question-slice image, given the "img" path stored in topicals_db.json
// (which looks like "/topicals/<paper>/q3.webp").
export const sliceUrl = (imgPath) => {
  if (!imgPath) return '';
  const clean = imgPath.replace(/^\//, '');
  return R2 ? `${R2}/${clean}` : `/${clean}`;
};

// Library file (textbook / notes / formula sheet), given the "path" stored in
// library_db.json (which looks like "/library/9618/book.pdf").
export const libraryUrl = (filePath) => {
  if (!filePath) return '';
  const clean = filePath.replace(/^\//, '');
  return R2 ? `${R2}/${encodeURI(clean)}` : `/${encodeURI(clean)}`;
};

export const R2_BASE = R2;
