# Phase 24 — Library bugs: PDF links + missing file types

## BUG 1 — clicking a PDF opened The Nexus instead of the file
### The chain (a genuinely nasty silent failure)
```
const R2 = import.meta.env.VITE_R2_PUBLIC_URL?... || '';   // ← empty on Cloudflare
libraryUrl('/library/book.pdf')  →  '/library/book.pdf'    // ← relative path
GET /library/book.pdf on Pages   →  404 (the file lives in R2)
wrangler: not_found_handling = "single-page-application"   →  serves index.html
                                                          →  THE NEXUS OPENS
```
Your `.env` works locally, but **Cloudflare builds in its own environment**.
If `VITE_R2_PUBLIC_URL` isn't in the Pages dashboard build variables, the
deployed bundle has no R2 URL — and every asset silently becomes an SPA link.

### The fix (src/config/assets.js)
The bucket's PUBLIC read URL is now a hard-coded fallback. It is not a secret
(it's read-only and public by design), so there's no reason to let a missing
env var break every link. Env var still wins if set; a dev-only console warning
fires if it's absent.

**ALSO DO THIS** (belt and braces): Cloudflare dashboard → your Pages project →
Settings → Variables → add for Production **and** Preview:
    VITE_R2_PUBLIC_URL = https://pub-263db9f5fa45478587e20aa3adda45c0.r2.dev
This same bug would have been silently mangling paper PDFs and question slices
too — anything routed through assets.js.

## BUG 2 — the library only showed PDFs
Line 38 of your indexer:
```python
if item.lower().endswith(('.pdf', '.html', '.txt')):   # everything else dropped
```
Word docs, PowerPoints, images, spreadsheets, archives, ebooks — all silently
skipped. You'd upload them and they'd simply never appear.

### The fix (generate_library.py — rewritten)
- Indexes **every real file**; skips only junk (.DS_Store, Thumbs.db, ~$temp,
  .part/.crdownload, dotfiles).
- Tags each file with a `kind`: pdf / doc / slides / sheet / image / archive /
  video / audio / code / book / text / web.
- Human sizes: `812 KB`, `3.4 MB` — not `0.0 MB` for everything small.
- Prints a summary: `by type: 2 pdf, 1 image, 1 doc, 1 slides…`
- Keeps `--upload-r2`.

Verified on a mixed folder: pdf, docx, pptx, png, csv, zip all indexed;
.DS_Store skipped.

`src/components/LibrarySidebar.jsx` now shows a coloured icon per kind
(PDF red, Word indigo, PowerPoint amber, sheets green, images violet…).

## Install
1. Replace `src/config/assets.js`
2. Replace `generate_library.py`
3. Replace `src/components/LibrarySidebar.jsx`
4. Re-run:  `python generate_library.py --upload-r2`
5. Commit `public/library_db.json` and push
6. Add VITE_R2_PUBLIC_URL to the Pages dashboard (above)

## Test
- Click a library PDF → it opens the PDF (from pub-...r2.dev), not the app.
- A .docx / .pptx in the library now appears, with its own icon, and downloads.
- Network tab: the request goes to pub-...r2.dev, status 200.
