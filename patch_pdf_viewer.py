"""
patch_pdf_viewer.py — let the bundled PDF.js viewer open papers from R2
======================================================================

WHY THIS EXISTS
---------------
PdfViewer.jsx loads papers through the vendored PDF.js viewer:

    /pdf-viewer/web/viewer.html?file=<url>

viewer.js contains a hard origin check:

    if (origin !== viewerOrigin && protocol !== "blob:")
        throw new Error("file origin does not match viewer's");

That check exists to stop Mozilla's PUBLIC demo viewer being abused as an
open proxy for arbitrary URLs. On a self-hosted copy of the viewer it is not
protecting you from anything — but it does mean that the moment paper URLs
moved from "/papers/x.pdf" (same origin) to R2 (different origin), every
paper silently became "0 of 0".

This script adds your own origins to the viewer's allow-list, which makes
validateFileURL() return early and permit the R2 URL.

USAGE
-----
    python patch_pdf_viewer.py
    python patch_pdf_viewer.py --origins https://thenexustools.com http://localhost:5173
    python patch_pdf_viewer.py --restore      # undo, from the .bak

Safe to run twice — it detects an existing patch and does nothing.
"""

import os
import re
import sys
import shutil

DEFAULT_ORIGINS = [
    "https://thenexustools.com",
    "http://localhost:5173",
    "http://localhost:4173",
]

# Where the vendored viewer usually lives. First match wins.
CANDIDATES = [
    "./public/pdf-viewer/web/viewer.mjs",   # PDF.js v4+
    "./public/pdf-viewer/web/viewer.js",    # PDF.js v2 / v3
    "./public/pdf-viewer/build/viewer.mjs",
    "./public/pdf-viewer/build/viewer.js",
]

MARKER = "/* nexus-patched */"


def find_viewer():
    for path in CANDIDATES:
        if os.path.isfile(path):
            return path
    # last resort: walk public/ looking for a viewer file
    for root, _dirs, files in os.walk("./public"):
        for f in files:
            if f in ("viewer.mjs", "viewer.js"):
                return os.path.join(root, f)
    return None


def restore(path):
    bak = path + ".bak"
    if not os.path.isfile(bak):
        print(f"No backup found at {bak} — nothing to restore.")
        return False
    shutil.copyfile(bak, path)
    print(f"Restored {path} from {bak}")
    return True


def patch(path, origins):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        src = f.read()

    if MARKER in src:
        print("Already patched — nothing to do.")
        print("   (run with --restore first if you want to re-apply)")
        return True

    bak = path + ".bak"
    if not os.path.isfile(bak):
        shutil.copyfile(path, bak)
        print(f"Backup written: {bak}")

    # ── Strategy 1: extend HOSTED_VIEWER_ORIGINS ────────────────────────────
    # Matches both readable and minified array literals.
    m = re.search(r"(HOSTED_VIEWER_ORIGINS\s*=\s*(?:new\s+Set\(\s*)?\[)([^\]]*)(\])", src)
    if m:
        existing = m.group(2)
        additions = ", ".join(f'"{o}"' for o in origins if f'"{o}"' not in existing)
        if not additions:
            print("Your origins are already in HOSTED_VIEWER_ORIGINS.")
            return True
        new_array = f"{m.group(1)}{existing.rstrip().rstrip(',')}, {additions}{m.group(3)} {MARKER}"
        src = src[:m.start()] + new_array + src[m.end():]
        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
        print("Patched via HOSTED_VIEWER_ORIGINS (the clean way).")
        print("   added: " + ", ".join(origins))
        return True

    # ── Strategy 2: neutralise the throw in validateFileURL ─────────────────
    # Only used if the array isn't found (heavily minified builds).
    # Newer PDF.js builds don't throw here — they do:
    #     const ex = new Error("file origin does not match viewer's");
    #     PDFViewerApplication._documentError(...)
    # Older ones do `throw new Error(...)`. Handle both by making the
    # *origin comparison* always succeed instead of touching the error path.
    cmp_re = re.compile(r"(if\s*\(\s*fileOrigin\s*===\s*viewerOrigin\s*\)\s*\{)")
    throw_re = re.compile(
        r"throw\s+new\s+Error\(\s*[\"'`]file origin does not match viewer'?s?[\"'`]\s*\)"
    )
    if cmp_re.search(src):
        src = cmp_re.sub(r"if (true) { /* nexus: cross-origin PDFs allowed */", src, count=1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(src + f"\n{MARKER}\n")
        print("Patched via the fileOrigin comparison (newer PDF.js).")
        return True
    if throw_re.search(src):
        src = throw_re.sub(f'console.warn("[nexus] cross-origin PDF allowed") {MARKER}', src)
        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
        print("Patched via the origin-check throw (fallback path).")
        print("   HOSTED_VIEWER_ORIGINS wasn't found — likely a minified build.")
        return True

    print("Could not find the origin check in this file.")
    print("   The viewer may be a build I don't recognise.")
    print(f"   Open {path} and search for: file origin does not match")
    return False


def main():
    args = sys.argv[1:]

    if "--restore" in args:
        path = find_viewer()
        if not path:
            print("Couldn't find the PDF.js viewer under ./public")
            sys.exit(1)
        sys.exit(0 if restore(path) else 1)

    origins = list(DEFAULT_ORIGINS)
    if "--origins" in args:
        i = args.index("--origins")
        given = [a for a in args[i + 1:] if not a.startswith("--")]
        if given:
            origins = given

    path = find_viewer()
    if not path:
        print("Couldn't find the PDF.js viewer.")
        print("   Looked for viewer.mjs / viewer.js under ./public/pdf-viewer/")
        print("   Run this from your project root (C:\\paper-explorer).")
        sys.exit(1)

    print(f"Viewer found: {path}\n")
    ok = patch(path, origins)

    if ok:
        print("\nNext:")
        print("  1. Add the CORS policy to your R2 bucket (see r2-cors.json)")
        print("  2. Confirm the papers are actually in R2:")
        print("     python r2_upload.py")
        print("  3. git add . && git commit -m \"allow cross-origin PDFs\" && git push origin main")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
