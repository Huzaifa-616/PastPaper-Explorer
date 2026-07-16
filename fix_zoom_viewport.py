"""
fix_zoom_viewport.py — kill the black bar at the bottom of the page
===================================================================

THE BUG
-------
src/styles/GlobalStyles.jsx line ~46:

    #root { zoom: ${fontScale}; }

CSS `zoom` scales the rendered element — but `vh` units are measured against
the RAW viewport and are completely unaffected by zoom. So any page that says
`height: 100vh` inside #root gets mis-sized the moment fontScale != 1:

    Text size "Small" (0.875) on an 855px viewport:
        page asks for 100vh          = 855px
        #root renders it at 0.875    = 748px
        leftover                     = 107px of <body> showing through
                                       -> and body's background is var(--bg)
                                       -> A BLACK BAR AT THE BOTTOM.

    Text size "Large" (1.125): the opposite — the page overflows past the
    bottom of the window instead.

Only "Default" (1) ever looked right.

THE FIX
-------
Define a viewport variable that cancels out the zoom, and use it instead of
100vh:

    :root { --app-h: calc(100vh / <fontScale>); }
    #root { zoom: <fontScale>; }

    855 / 0.875 = 977  ->  zoomed by 0.875  ->  855  ✓ exact fit at any scale.

It also switches to 100dvh where supported, which fixes the same class of gap
on mobile browsers (where 100vh wrongly includes the area behind the URL bar).

USAGE
-----
    python fix_zoom_viewport.py
    python fix_zoom_viewport.py --restore

Safe to run twice. Backs every file up to <file>.bak first.
"""

import os
import re
import sys
import shutil

GLOBAL_STYLES = "./src/styles/GlobalStyles.jsx"
PAGES_DIR = "./src/pages"
MARKER = "--app-h"

# The variable block injected just before the #root zoom rule.
VAR_BLOCK = """    /* Viewport units that survive the #root zoom.
       CSS zoom scales rendering, but vh is measured against the raw viewport
       and ignores zoom -- so height:100vh inside a zoomed #root renders at
       100vh * fontScale, leaving a gap (or overflowing). Dividing by the
       scale first makes it land exactly. The dvh variant also fixes the
       mobile URL-bar gap. Use var(--app-h) instead of 100vh everywhere. */
    :root {
      --app-h: calc(100vh / ${fontScale});
      --app-w: calc(100vw / ${fontScale});
    }
    @supports (height: 100dvh) {
      :root { --app-h: calc(100dvh / ${fontScale}); }
    }

"""

def backup(path):
    bak = path + ".bak"
    if not os.path.isfile(bak):
        shutil.copyfile(path, bak)
    return bak


def restore_all():
    n = 0
    targets = [GLOBAL_STYLES] + [
        os.path.join(PAGES_DIR, f) for f in os.listdir(PAGES_DIR)
    ] if os.path.isdir(PAGES_DIR) else [GLOBAL_STYLES]
    for path in targets:
        bak = path + ".bak"
        if os.path.isfile(bak):
            shutil.copyfile(bak, path)
            print(f"  restored {path}")
            n += 1
    print(f"\nRestored {n} file(s).")
    return n > 0


def patch_global_styles():
    if not os.path.isfile(GLOBAL_STYLES):
        print(f"Not found: {GLOBAL_STYLES}")
        print("   Run this from your project root (C:\\paper-explorer).")
        return False

    with open(GLOBAL_STYLES, "r", encoding="utf-8") as f:
        src = f.read()

    if MARKER in src:
        print("GlobalStyles.jsx already has --app-h — skipping.")
        return True

    m = re.search(r"[ \t]*#root\s*\{\s*zoom:\s*\$\{fontScale\};?\s*\}", src)
    if not m:
        print("Couldn't find the `#root { zoom: ${fontScale}; }` rule.")
        print(f"   Open {GLOBAL_STYLES} and look for it — it may have been edited.")
        return False

    backup(GLOBAL_STYLES)
    src = src[:m.start()] + VAR_BLOCK + src[m.start():]

    with open(GLOBAL_STYLES, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"Patched {GLOBAL_STYLES}")
    print("   + :root { --app-h: calc(100vh / ${fontScale}) }")
    print("   + 100dvh variant for mobile")
    return True


def patch_pages():
    if not os.path.isdir(PAGES_DIR):
        print(f"Not found: {PAGES_DIR}")
        return 0

    total = 0
    for name in sorted(os.listdir(PAGES_DIR)):
        if not name.endswith(".jsx"):
            continue
        path = os.path.join(PAGES_DIR, name)
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()

        # Two shapes to catch:
        #   1. JSX style values:      height: '100vh'
        #   2. raw CSS in template literals:  min-height:100vh;
        quoted = re.findall(r"(['\"`])100vh\1", src)
        raw = re.findall(r"(?:min-|max-)?height\s*:\s*100vh", src)
        hits = len(quoted) + len(raw)
        if hits == 0:
            continue

        backup(path)
        src = re.sub(r"(['\"`])100vh\1", "'var(--app-h)'", src)
        src = re.sub(r"((?:min-|max-)?height\s*:\s*)100vh", r"\1var(--app-h)", src)
        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"   {name}: {hits} × 100vh -> var(--app-h)")
        total += hits
    return total


def main():
    if "--restore" in sys.argv[1:]:
        sys.exit(0 if restore_all() else 1)

    print("Fixing the zoom/viewport mismatch...\n")

    if not patch_global_styles():
        sys.exit(1)

    print("\nUpdating pages:")
    n = patch_pages()
    if n == 0:
        print("   (no 100vh found — already done?)")

    print(f"\nDone. {n} viewport height(s) now respect the font-size setting.")
    print("\nTest:")
    print("  npm run dev  ->  Settings -> Text size -> Small / Large / XL")
    print("  The layout should fit exactly at every size — no black bar,")
    print("  no overflow.")
    print("\nThen:")
    print('  git add . && git commit -m "fix viewport height under UI zoom" && git push origin main')
    print("\nUndo any time:  python fix_zoom_viewport.py --restore")


if __name__ == "__main__":
    main()
