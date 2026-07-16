# Phase 26 — FIX: papers show "0 of 0"

## Diagnosis — read from YOUR repo, not guessed

`src/pages/ExplorerPage.jsx`
    line  92:  return paperUrl(subject, season, ...)
               → now returns  https://pub-...r2.dev/papers/x.pdf
    line  97:  `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(url)}`
    line 278:  <iframe src={viewerSrc} />

`public/pdf-viewer/web/viewer.mjs` (581 KB, your file) contains:

    HOSTED_VIEWER_ORIGINS = new Set(["null","http://mozilla.github.io","https://mozilla.github.io"]);
    ...
    if (HOSTED_VIEWER_ORIGINS.has(viewerOrigin)) return;
    const fileOrigin = URL.parse(file, window.location)?.origin;
    if (fileOrigin === viewerOrigin) return;
    const ex = new Error("file origin does not match viewer's");   // ← your papers die here

The viewer is served from thenexustools.com. The `file=` you hand it is now on
pub-...r2.dev. Different origin → the check fires → **0 of 0**.

**This was my fault.** In phase 24 I hard-coded the R2 URL into assets.js so a
missing env var couldn't break library links. Library links are plain <a href>
so they were fine — but papers go through PDF.js's viewer, which refuses
cross-origin files. And you'd just .gitignored public/papers, so the old
same-origin route was gone too. Both closed at once.

You confirmed the R2 URL opens fine in a browser, so the files are there. It
is purely this check.

## STEP 1 — patch the viewer
    python patch_pdf_viewer.py

Adds your origins to HOSTED_VIEWER_ORIGINS, so `.has(viewerOrigin)` returns
true for thenexustools.com and validateFileURL returns before the comparison.
Backs up to viewer.mjs.bak first.

**Tested against YOUR ACTUAL viewer.mjs** (downloaded from your repo):
  ✓ patched:      new Set([..., "https://thenexustools.com", "http://localhost:5173", ...])
  ✓ still parses as a valid ES module (node --check)
  ✓ idempotent — running twice does nothing
  ✓ python patch_pdf_viewer.py --restore  puts it back

My first version FAILED on your file — your PDF.js is newer than I assumed
(a `Set`, and it doesn't `throw`). Fixed and re-tested on the real thing.

## STEP 2 — CORS on the bucket
Dashboard → R2 → **nexus-storage** → Settings → CORS Policy → paste `r2-cors.json`.

Not optional: PDF.js fetches the PDF with XHR and streams pages using **Range
requests**. Without `Content-Range` / `Accept-Ranges` in ExposeHeaders it
cannot read them, and you'd still get a broken viewer even after Step 1.

## STEP 3 — deploy
    git add .
    git commit -m "allow the PDF viewer to load papers from R2"
    git push origin main

## Test
1. Open a paper → renders, correct page count.
2. DevTools → Network → the .pdf goes to pub-...r2.dev with **200** or **206**.
   206 = range streaming working, not an error.
3. Library PDFs still open (plain links — unaffected).

## Note
If you ever re-vendor a newer PDF.js, re-run this — a fresh build brings the
check back.
