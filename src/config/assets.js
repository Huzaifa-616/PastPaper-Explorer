// ─── Asset source ─────────────────────────────────────────────────────────────
// Where PDFs and question-slice images are served from.
//
// Set VITE_R2_PUBLIC_URL in your .env to your bucket's public URL, e.g.
//   VITE_R2_PUBLIC_URL=https://pub-263db9f5fa45478587e20aa3adda45c0.r2.dev
//
// If it's unset, assets fall back to local /public (dev without R2 still works).
// Vite exposes only vars prefixed with VITE_ to the browser — this is safe;
// it's a public read URL, not a secret.

const R2 = import.meta.env.VITE_R2_PUBLIC_URL?.replace(/\/$/, '') || '';

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
