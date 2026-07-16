"""
liquid_glass.py — a slight liquid-glass pass, site-wide
=======================================================
The trick isn't blur. It's blur + SATURATE.

Blur alone gives you fog. Apple's "vibrancy" is `backdrop-filter: blur() saturate()`
— the saturation boost makes colours behind the panel bleed through RICHER than
they really are, which is what your eye reads as glass instead of frosting.
Add a hairline highlight along the top edge (a real pane catches light there)
and a soft shadow underneath, and it lifts off the page.

Kept deliberately slight: saturate 150%, a 6% highlight. Enough to feel, not
enough to notice.

    python liquid_glass.py
    python liquid_glass.py --restore

Dials are the constants below.
"""
import os, re, sys, shutil

GS = "./src/styles/GlobalStyles.jsx"

BLUR      = 14     # px — frost
SATURATE  = 150    # % — the vibrancy. 100 = off, 180 = Apple-ish, 200 = gaudy
HIGHLIGHT = 0.06   # top edge, 0–1. the lit rim of the glass
SHADE     = 0.18   # bottom inner shade — gives the pane thickness
DEPTH     = 0.45   # outer shadow strength

GLASS_CSS = f'''
    /* ══════════════════════════════════════════════════════════════════════
       LIQUID GLASS
       blur alone = fog. blur + saturate = glass: colours behind come through
       richer than reality, which is what the eye reads as a real pane. The
       inset highlight is the lit top rim; the inset shade underneath gives it
       thickness; the outer shadow lifts it off the page.
       ══════════════════════════════════════════════════════════════════════ */
    .glass-panel {{
      background: var(--surface);
      backdrop-filter: blur({BLUR}px) saturate({SATURATE}%);
      -webkit-backdrop-filter: blur({BLUR}px) saturate({SATURATE}%);
      border: 1px solid var(--line2);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,{HIGHLIGHT}),
        inset 0 -1px 0 rgba(0,0,0,{SHADE}),
        0 10px 34px -14px rgba(0,0,0,{DEPTH});
    }}

    /* Small chrome gets a lighter version of the same material. */
    .icon-btn, .nexus-select, .seg-btn {{
      backdrop-filter: blur(8px) saturate(140%);
      -webkit-backdrop-filter: blur(8px) saturate(140%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,{HIGHLIGHT * 0.7:.3f});
    }}

    /* The nav is a sheet of glass the page slides under. */
    header.nav-bar {{
      backdrop-filter: blur(18px) saturate({SATURATE}%);
      -webkit-backdrop-filter: blur(18px) saturate({SATURATE}%);
      box-shadow: inset 0 -1px 0 rgba(255,255,255,0.04);
    }}

    /* backdrop-filter is GPU work. A mid-range phone with a dozen of them
       stutters, and our students are ON mid-range phones — so the small
       chrome drops its blur there and keeps only the big surfaces. */
    @media (max-width: 700px), (pointer: coarse) {{
      .icon-btn, .nexus-select, .seg-btn {{
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }}
      .glass-panel {{
        backdrop-filter: blur(10px) saturate(130%);
        -webkit-backdrop-filter: blur(10px) saturate(130%);
      }}
    }}
'''

def restore():
    if os.path.isfile(GS + ".bakl"):
        shutil.copyfile(GS + ".bakl", GS)
        print("Restored " + GS); return True
    print("No backup found."); return False

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    if not os.path.isfile(GS):
        print("Run from C:\\paper-explorer"); sys.exit(1)

    src = open(GS, encoding="utf-8").read()
    if "LIQUID GLASS" in src:
        print("Already applied. Undo first: python liquid_glass.py --restore"); sys.exit(0)

    if not os.path.isfile(GS + ".bakl"): shutil.copyfile(GS, GS + ".bakl")

    # Replace the old flat .glass-panel rule so we don't fight it
    old = re.search(r"\n\s*\.glass-panel \{[^}]*\}", src)
    if old:
        src = src[:old.start()] + src[old.end():]
        print("  removed the old flat .glass-panel rule")

    m = list(re.finditer(r"`\}</style>", src))
    if not m:
        print("  couldn't find the end of the style block"); sys.exit(1)
    src = src[:m[-1].start()] + GLASS_CSS + src[m[-1].start():]
    open(GS, "w", encoding="utf-8").write(src)

    print(f"Applied: blur {BLUR}px · saturate {SATURATE}% · highlight {HIGHLIGHT}")
    print("  .glass-panel, .icon-btn, .nexus-select, .seg-btn, header.nav-bar")
    print("  (mobile keeps only the big surfaces — backdrop-filter is GPU work)")
    print("\nToo much? Edit SATURATE / BLUR / HIGHLIGHT at the top and re-run")
    print("(after --restore). Undo: python liquid_glass.py --restore")

if __name__ == "__main__":
    main()
