"""
glass.py — ONE script: translucent surfaces + liquid-glass material
===================================================================
Replaces glassy.py AND liquid_glass.py. Run this instead of either.

WHY THE BUTTONS KEPT GOING OPAQUE
---------------------------------
There are THREE surface levels, and they're used in different places:

    --surface    the big .glass-panel cards
    --surface2   THE BUTTONS. tab pills, .icon-btn, the little chips
    --surface3   raised / active states

My earlier script only normalised `surface:`. So the cards went see-through
and every button stayed at 0.8-0.9 — opaque. It looked like a theme bug
"coming back"; it was just a variable I never touched.

All three are normalised here, so no theme and no element can be the odd one
out again.

    python glass.py
    python glass.py --restore

Dials at the top.
"""
import os, re, sys, shutil

THEMES = "./src/config/themes.js"
GS     = "./src/styles/GlobalStyles.jsx"

# ── DIALS ────────────────────────────────────────────────────────────────────
A_SURFACE  = 0.12   # big cards — almost transparent. the border defines them now.
A_SURFACE2 = 0.12   # buttons, tabs, pills
A_SURFACE3 = 0.26   # raised/active — still needs to read as "on"

# THE ONE THAT MATTERS.
# blur and see-through fight each other. A symbol ~30px tall blurred by 14px
# stops being a symbol — it becomes featureless haze, no matter how
# transparent the card is. That's why the cards looked "opaque" at alpha 0.5:
# they weren't. You just couldn't SEE anything through the frosting.
# 4px keeps the glassy edge and leaves glyphs legible.
BLUR       = 0      # px. 0 = perfectly sharp (saturate-only glass).
                    #     4 = a hint of frost. 14 = symbols destroyed.
SATURATE   = 160    # % — the vibrancy. 100 = off, 180 = Apple-ish, 200 = gaudy
HIGHLIGHT  = 0.06   # lit top rim
SHADE      = 0.18   # inner bottom shade — gives the pane thickness
DEPTH      = 0.45   # outer shadow
# ─────────────────────────────────────────────────────────────────────────────

FILTER  = f"blur({BLUR}px) saturate({SATURATE}%)" if BLUR else f"saturate({SATURATE}%)"
NAV_BLUR = f"blur({BLUR + 4}px) saturate({SATURATE}%)" if BLUR else f"saturate({SATURATE}%)"

GLASS_CSS = f'''
    /* ══════════════════════════════════════════════════════════════════════
       LIQUID GLASS
       Blur alone is fog. Blur + SATURATE is glass — colours behind come
       through richer than reality, which is what the eye reads as a real
       pane. The inset highlight is its lit top rim, the inset shade gives it
       thickness, the outer shadow lifts it off the page.
       ══════════════════════════════════════════════════════════════════════ */
    .glass-panel {{
      background: var(--surface);
      backdrop-filter: {FILTER};
      -webkit-backdrop-filter: {FILTER};
      border: 1px solid var(--line2);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,{HIGHLIGHT}),
        inset 0 -1px 0 rgba(0,0,0,{SHADE}),
        0 10px 34px -14px rgba(0,0,0,{DEPTH});
    }}

    /* The buttons — same material, lighter. These are the ones that were
       stuck opaque: they're painted with --surface2. */
    .icon-btn, .nexus-select, .seg-btn {{
      backdrop-filter: {FILTER};
      -webkit-backdrop-filter: {FILTER};
      box-shadow: inset 0 1px 0 rgba(255,255,255,{HIGHLIGHT * 0.7:.3f});
    }}

    header.nav-bar {{
      backdrop-filter: {NAV_BLUR};
      -webkit-backdrop-filter: {NAV_BLUR};
      box-shadow: inset 0 -1px 0 rgba(255,255,255,0.04);
    }}

    /* backdrop-filter is GPU work, and our students are on mid-range phones.
       A dozen blurred layers stutters, so mobile keeps only the big surfaces. */
    @media (max-width: 700px), (pointer: coarse) {{
      .icon-btn, .nexus-select, .seg-btn {{
        backdrop-filter: none; -webkit-backdrop-filter: none;
      }}
      .glass-panel {{
        backdrop-filter: {FILTER};
        -webkit-backdrop-filter: {FILTER};
      }}
    }}
'''

def restore():
    n = 0
    for p in (THEMES, GS):
        for suffix in (".bakg", ".bakl", ".bakglass"):
            if os.path.isfile(p + suffix):
                shutil.copyfile(p + suffix, p); print("  restored " + p); n += 1
                break
    print(f"\nRestored {n} file(s)."); return n > 0

def set_alpha(src, name, alpha):
    """Rewrite `name: 'rgba(r, g, b, a)'` -> the same colour at `alpha`.
       \b in the PATTERN stops `surface` matching inside `surface2`; the
       replacement must use the plain name, not the pattern."""
    was = []
    def sub(m):
        was.append(m.group(2))
        return f"{name}: 'rgba({m.group(1)}, {alpha})'"
    pattern = r"\b" + re.escape(name) + r":\s*'rgba\(\s*([\d\s,]+?)\s*,\s*([\d.]+)\s*\)'"
    return re.sub(pattern, sub, src), was

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    if not os.path.isfile(THEMES):
        print("Run from C:\\paper-explorer"); sys.exit(1)

    # ── 1. all three surface levels, all six themes ──
    if not os.path.isfile(THEMES + ".bakglass"): shutil.copyfile(THEMES, THEMES + ".bakglass")
    src = open(THEMES, encoding="utf-8").read()

    print("Normalising surfaces across every theme:\n")
    for name, alpha in (("surface", A_SURFACE), ("surface2", A_SURFACE2), ("surface3", A_SURFACE3)):
        # the \b stops `surface` matching `surface2`
        src2, was = set_alpha(src, name, alpha)
        src = src2
        label = "  --" + name + (" (BUTTONS)" if name == "surface2" else "")
        print(f"{label:24} {len(was)} themes -> {alpha}    was: {', '.join(was)}")
    open(THEMES, "w", encoding="utf-8").write(src)

    # ── 2. the material ──
    if not os.path.isfile(GS): print("\nMISSING " + GS); sys.exit(1)
    if not os.path.isfile(GS + ".bakglass"): shutil.copyfile(GS, GS + ".bakglass")
    g = open(GS, encoding="utf-8").read()

    # strip any previous attempt so we never stack two materials
    g = re.sub(r"\n\s*/\* ═+\n\s*LIQUID GLASS.*?(?=\n    /\*|\n  `\}</style>)", "\n", g, flags=re.S)
    old = re.search(r"\n\s*\.glass-panel \{[^}]*\}", g)
    if old: g = g[:old.start()] + g[old.end():]

    m = list(re.finditer(r"`\}</style>", g))
    g = g[:m[-1].start()] + GLASS_CSS + g[m[-1].start():]
    open(GS, "w", encoding="utf-8").write(g)

    print(f"\nMaterial: blur {BLUR}px · saturate {SATURATE}% · highlight {HIGHLIGHT}")
    print("\n  Cards are now almost transparent — their BORDER defines them, not")
    print("  their fill. Blur is off, so symbols behind them stay sharp. The")
    print("  glass is now saturate + the lit rim + the depth shadow, which is")
    print("  most of what sold it anyway.")
    print("\n  If text gets hard to read (esp. Daylight/Sepia), raise A_SURFACE.")
    print("\nHard-refresh (Ctrl+Shift+R) — the service worker will serve you the")
    print("old CSS otherwise, and it'll look like nothing changed.")
    print("\nToo see-through? Raise the A_* numbers at the top and re-run.")
    print("Undo:  python glass.py --restore")

if __name__ == "__main__":
    main()
