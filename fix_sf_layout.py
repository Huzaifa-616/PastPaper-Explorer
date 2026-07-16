"""
fix_sf_layout.py — put the source files BESIDE the paper, not on top of it
=========================================================================
The panel was rendered INSIDE the div that holds the <iframe>, so it could
only ever overlay the PDF. Your MCQSolver is a SIBLING of that div — which is
exactly why it sits beside the paper instead of covering it.

This moves SourceFileViewer to the same level. One line up the tree, and
flexbox does the rest.

    python fix_sf_layout.py
    python fix_sf_layout.py --restore
"""
import os, re, sys, shutil

EXP = "./src/pages/ExplorerPage.jsx"

if "--restore" in sys.argv[1:]:
    if os.path.isfile(EXP + ".baklay"):
        shutil.copyfile(EXP + ".baklay", EXP); print("Restored " + EXP)
    else:
        print("No backup.")
    raise SystemExit(0)

if not os.path.isfile(EXP):
    print("Run from C:\\paper-explorer"); raise SystemExit(1)

src = open(EXP, encoding="utf-8").read()
OLD = "{openSf && <SourceFileViewer file={openSf} onClose={() => setOpenSf(null)} />}"

if OLD not in src:
    print("Couldn't find the viewer line — already moved?"); raise SystemExit(0)

if not os.path.isfile(EXP + ".baklay"): shutil.copyfile(EXP, EXP + ".baklay")

# 1. lift it out of the iframe's container
src = src.replace("\n                  " + OLD, "")

# 2. drop it back in as a sibling, right where MCQSolver lives
m = re.search(r"(\n\s*)\{showMCQ && canShowMCQ && \(", src)
if m:
    indent = m.group(1)
    src = src[:m.start()] + indent + OLD + src[m.start():]
    print("Moved: the viewer is now a sibling of the PDF, beside MCQSolver.")
    print("       flexbox gives it its own column — no more overlap.")
else:
    print("Couldn't find the MCQSolver block. Move this line by hand so it's a")
    print("SIBLING of the div containing the <iframe>, not inside it:")
    print("   " + OLD)

open(EXP, "w", encoding="utf-8").write(src)
print("\nHard-refresh (Ctrl+Shift+R) — the service worker caches the old bundle.")
