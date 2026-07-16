"""
calm_hub.py — less intimidating (#4) + less cold (#3)
=====================================================
  src/utils/performance.js -> + mostStudiedSubject()
  src/pages/HubPage.jsx    -> tabs default to the subject you actually study;
                              the SEO block stops shouting; more breathing room

    python calm_hub.py
    python calm_hub.py --restore
Safe to run twice.
"""
import os, re, sys, shutil

PERF = "./src/utils/performance.js"
HUB  = "./src/pages/HubPage.jsx"
TARGETS = [PERF, HUB]

def backup(p):
    if not os.path.isfile(p + ".bak3"): shutil.copyfile(p, p + ".bak3")

def restore():
    n = 0
    for p in TARGETS:
        if os.path.isfile(p + ".bak3"):
            shutil.copyfile(p + ".bak3", p); print("  restored " + p); n += 1
    print(f"\nRestored {n} file(s)."); return n > 0

INFER_FN = '''

/** The subject this student actually studies, inferred from their own answers.
 *  `settings.defaultSubject` only helps students who opened Settings — almost
 *  nobody does. This asks nothing and is right for anyone who's used the app:
 *  40 bubbled Physics answers means the hub should open on Physics. */
export function mostStudiedSubject() {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {};
    const counts = {};
    for (const [key, sess] of Object.entries(sessions)) {
      const subject = key.split('_')[0];
      const n = Array.isArray(sess?.choices) ? sess.choices.filter(Boolean).length : 0;
      if (n > 0) counts[subject] = (counts[subject] || 0) + n;
    }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : null;
  } catch { return null; }
}
'''

def patch_perf():
    if not os.path.isfile(PERF): print("  MISSING " + PERF); return False
    src = open(PERF, encoding="utf-8").read()
    if "mostStudiedSubject" in src:
        print("  performance.js already has mostStudiedSubject"); return True
    backup(PERF)
    open(PERF, "a", encoding="utf-8").write(INFER_FN)
    print("  performance.js  + mostStudiedSubject()")
    return True

def patch_hub():
    if not os.path.isfile(HUB): print("  MISSING " + HUB); return False
    src = open(HUB, encoding="utf-8").read()
    backup(HUB)
    changed = []

    # ── #4a: the tabs open on the subject they actually study ──────────────
    if "mostStudiedSubject" not in src:
        m = re.search(r"import \{ ([^}]*) \} from '\.\./utils/performance';", src)
        if m:   # merge into the existing performance import
            names = m.group(1).strip()
            if "mostStudiedSubject" not in names:
                src = src[:m.start(1)] + names + ", mostStudiedSubject" + src[m.end(1):]
        else:
            imports = list(re.finditer(r"^import .*?;$", src, re.M))
            src = src[:imports[-1].end()] + "\nimport { mostStudiedSubject } from '../utils/performance';" + src[imports[-1].end():]

        anchor = "try { const s = JSON.parse(localStorage.getItem('nexusSettings')); if (s?.defaultSubject) return s.defaultSubject; } catch { /* ignore */ }"
        if anchor in src:
            src = src.replace(anchor, anchor +
                "\n    // Nobody opens Settings. Infer it from what they actually answer.\n"
                "    const studied = mostStudiedSubject();\n"
                "    if (studied) return studied;")
            changed.append("tabs open on your own subject")

    # ── #4b: the SEO block stops competing with the tools ──────────────────
    seo_panel = "<div style={{ padding: 24, borderRadius: 20, background: 'var(--surface2)', border: '1px solid var(--line2)' }}>"
    if seo_panel in src:
        src = src.replace(seo_panel,
            "<div style={{ padding: '20px 4px', borderTop: '1px solid var(--line)', opacity: 0.72 }}>")
        changed.append("SEO block demoted to footer")
    src = src.replace(
        "<h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>About The Nexus",
        "<h2 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, letterSpacing: '0.04em' }}>About The Nexus")
    src = src.replace(
        "<p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>",
        "<p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 12, maxWidth: 760 }}>")

    # ── #3: breathing room. Cold is usually density, not colour. ───────────
    n = src.count("padding:28")
    src = src.replace("padding:28", "padding:32")
    if n: changed.append(f"{n} cards given more air")
    src = src.replace("style={{ textAlign:'center', marginBottom:48 }}",
                      "style={{ textAlign:'center', marginBottom:60, maxWidth:680 }}")
    src = src.replace("borderRadius:100, border:'1px solid var(--line2)', marginBottom:48",
                      "borderRadius:100, border:'1px solid var(--line2)', marginBottom:60")
    src = src.replace("padding:'0 20px', zIndex:10", "padding:'32px 20px', zIndex:10")

    open(HUB, "w", encoding="utf-8").write(src)
    print("  HubPage.jsx  " + (", ".join(changed) if changed else "already done"))
    return True

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    print("Calming the dashboard...\n")
    ok = patch_perf() and patch_hub()
    if ok:
        print("\nDone.\n")
        print("Test:")
        print("  Answer some 9702 MCQs -> reload '/' -> it opens on Physics,")
        print("  without you ever touching Settings.")
        print("  Scroll to the bottom -> the SEO text is quiet footer copy now,")
        print("  not a panel competing with your tools. Google still reads it.")
        print("\nUndo:  python calm_hub.py --restore")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
