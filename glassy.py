"""
glassy.py — make the cards see-through on EVERY theme
=====================================================
Cards are painted by `.glass-panel { background: var(--surface); }`.
Each theme picked its own alpha by eye, long before there was anything behind
the cards worth seeing:

    midnight  0.6     ocean   0.65    forest  0.7
    daylight  0.8     amoled  0.85    sepia   0.85

So how much of the symbol field bleeds through depends entirely on which
theme you're using. This normalises them all to one value.

    python glassy.py            # ALPHA below, applied to every theme
    python glassy.py 0.45       # or pass your own
    python glassy.py --restore

Tune ALPHA and BLUR until it looks right — Vite hot-reloads instantly.
"""
import os, re, sys, shutil

THEMES = "./src/config/themes.js"
GS     = "./src/styles/GlobalStyles.jsx"

ALPHA = 0.50   # card fill opacity. lower = more see-through. 0.6 was midnight.
BLUR  = 10     # px. was 24 — a heavy blur smears faint symbols into nothing.

def restore():
    n = 0
    for p in (THEMES, GS):
        if os.path.isfile(p + ".bakg"):
            shutil.copyfile(p + ".bakg", p); print("  restored " + p); n += 1
    print(f"\nRestored {n} file(s)."); return n > 0

def main():
    args = sys.argv[1:]
    if "--restore" in args: sys.exit(0 if restore() else 1)

    alpha = ALPHA
    for a in args:
        try: alpha = float(a); break
        except ValueError: pass

    if not os.path.isfile(THEMES):
        print("Run from C:\\paper-explorer"); sys.exit(1)

    # ── 1. every theme's --surface gets the same alpha ──
    if not os.path.isfile(THEMES + ".bakg"): shutil.copyfile(THEMES, THEMES + ".bakg")
    src = open(THEMES, encoding="utf-8").read()

    hits = []
    def swap(m):
        hits.append(m.group(2))
        return f"{m.group(1)}rgba({m.group(3)}, {alpha})'"
    src = re.sub(r"(surface:\s*')rgba\(([^)]*?,\s*([\d.]+))\)'",
                 lambda m: (hits.append(m.group(3)) or
                            f"{m.group(1)}rgba({m.group(2).rsplit(',', 1)[0].strip()}, {alpha})'"),
                 src)
    open(THEMES, "w", encoding="utf-8").write(src)
    print(f"themes.js: {len(hits)} themes -> surface alpha {alpha}")
    print(f"  was: {', '.join(hits)}")

    # ── 2. lighter blur, so faint glyphs survive the frosting ──
    if os.path.isfile(GS):
        if not os.path.isfile(GS + ".bakg"): shutil.copyfile(GS, GS + ".bakg")
        g = open(GS, encoding="utf-8").read()
        before = g
        g = g.replace("backdrop-filter: blur(24px);", f"backdrop-filter: blur({BLUR}px);")
        g = g.replace("-webkit-backdrop-filter: blur(24px);", f"-webkit-backdrop-filter: blur({BLUR}px);")
        if g != before:
            open(GS, "w", encoding="utf-8").write(g)
            print(f"GlobalStyles.jsx: .glass-panel blur 24px -> {BLUR}px")
            print("  (a 24px blur smears a 15%-opacity glyph into nothing)")

    print("\nToo see-through? Run it again with a higher number:")
    print("    python glassy.py 0.6")
    print("Undo:  python glassy.py --restore")

if __name__ == "__main__":
    main()
