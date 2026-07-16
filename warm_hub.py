"""
warm_hub.py — make the dashboard welcoming
==========================================
Patches:
  src/utils/performance.js  -> + hasStudyHistory()  (cheap, no topicalDb needed)
  src/pages/HubPage.jsx     -> "Welcome back" for returning students,
                               human copy everywhere, drops the two
                               "In Development" badges, more breathing room

    python warm_hub.py
    python warm_hub.py --restore
Safe to run twice.
"""
import os, re, sys, shutil

PERF = "./src/utils/performance.js"
HUB  = "./src/pages/HubPage.jsx"
TARGETS = [PERF, HUB]

def backup(p):
    if not os.path.isfile(p + ".bak2"): shutil.copyfile(p, p + ".bak2")

def restore():
    n = 0
    for p in TARGETS:
        if os.path.isfile(p + ".bak2"):
            shutil.copyfile(p + ".bak2", p); print("  restored " + p); n += 1
    print(f"\nRestored {n} file(s)."); return n > 0

HISTORY_FN = '''

/** Cheap check: has this student answered anything before? Used by the hub to
 *  greet returning students without needing the topical database loaded. */
export function hasStudyHistory() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {};
    return Object.values(s).some(x => Array.isArray(x?.choices) && x.choices.some(Boolean));
  } catch { return false; }
}
'''

def patch_perf():
    if not os.path.isfile(PERF): print("  MISSING " + PERF); return False
    src = open(PERF, encoding="utf-8").read()
    if "hasStudyHistory" in src:
        print("  performance.js already has hasStudyHistory"); return True
    backup(PERF)
    open(PERF, "a", encoding="utf-8").write(HISTORY_FN)
    print("  performance.js  + hasStudyHistory()")
    return True

# ── every copy change, old -> new ────────────────────────────────────────────
COPY = [
    # Hero — the big one. "high-performance workspace engineered for" is how
    # you describe a database to a CTO, not how you tell a classmate about
    # the thing you made.
    ("From Prep to Perfection",
     "{returning ? 'Welcome back.' : 'Everything for your A-Levels.'}"),

    ("A high-performance workspace engineered for Cambridge A-Level students. Search topics, extract papers, and acess notes.",
     "{returning ? 'Pick up where you left off — or start something new.' : 'Past papers, topical questions, notes and a code lab. Free, no account, no ads — built by a student who needed it too.'}"),
    ("A high-performance workspace engineered for Cambridge A-Level students. Search topics, extract papers, and access notes.",
     "{returning ? 'Pick up where you left off — or start something new.' : 'Past papers, topical questions, notes and a code lab. Free, no account, no ads — built by a student who needed it too.'}"),

    # Cards
    ("Search, filter, and load papers instantly with a built-in fast PDF engine.",
     "Every paper with its mark scheme, side by side. Opens in a second — and works offline."),

    ("Write, compile, and run code entirely in your browser. Built for 9618.",
     "Python and Cambridge pseudocode that really run, with a debugger that shows you every variable, step by step."),

    # "repository" — students don't have repositories.
    ("Access textbooks, revision notes, and formula sheets directly from your repository.",
     "Textbooks, your teachers' notes, formula sheets — all in one place, all free."),

    ("Don't just scan years—target your weaknesses. Dive into a massive database of past paper questions strictly indexed by the official syllabus structure.",
     "Tap a topic and see every question ever asked on it — cut from the real papers and sorted by the official syllabus. Stop scanning whole years for the one thing you're stuck on."),
]

def patch_hub():
    if not os.path.isfile(HUB): print("  MISSING " + HUB); return False
    src = open(HUB, encoding="utf-8").read()
    backup(HUB)
    changed = []

    # 1. import + the returning flag
    if "hasStudyHistory" not in src:
        imports = list(re.finditer(r"^import .*?;$", src, re.M))
        src = src[:imports[-1].end()] + "\nimport { hasStudyHistory } from '../utils/performance';" + src[imports[-1].end():]
        m = re.search(r"(const StartupScreen = \([^)]*\) => \{)", src)
        if m:
            src = src[:m.end()] + "\n  const returning = hasStudyHistory();" + src[m.end():]
            changed.append("+ Welcome back")

    # 2. copy
    n = 0
    for old, new in COPY:
        if old in src:
            src = src.replace(old, new); n += 1
    if n: changed.append(f"{n} lines of copy rewritten")

    # 3. the two "In Development" badges — both features WORK. Telling students
    #    they're unfinished is the opposite of welcoming.
    before = src
    src = re.sub(r"\s*<span style=\{\{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'rgba\(251, 191, 36, 0\.1\)'[^}]*\}\}>In Development</span>", "", src)
    if src != before: changed.append("dropped 'In Development' badges")

    # 4. breathing room — the hero was tight against the tabs
    src = src.replace("style={{ textAlign:'center', marginBottom:48 }}",
                      "style={{ textAlign:'center', marginBottom:56, maxWidth:680 }}")

    open(HUB, "w", encoding="utf-8").write(src)
    print("  HubPage.jsx  " + (", ".join(changed) if changed else "already done"))
    return True

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    print("Warming up the dashboard...\n")
    ok = patch_perf() and patch_hub()
    if ok:
        print("\nDone.\n")
        print("Test:")
        print("  npm run dev -> '/' in incognito  -> 'Everything for your A-Levels.'")
        print("  Solve a few MCQs, come back      -> 'Welcome back.'")
        print("\nUndo:  python warm_hub.py --restore")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
