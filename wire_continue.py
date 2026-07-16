"""
wire_continue.py — surface the student's own data on the hub
============================================================
1. src/utils/performance.js  -> + studentSnapshot()
2. src/pages/HubPage.jsx     -> renders <ContinueStrip /> above the hero,
                                and fixes the "acess notes" typo

Copy this in first:  src/components/ContinueStrip.jsx

    python wire_continue.py
    python wire_continue.py --restore
Safe to run twice. Backs up to .bak.
"""
import os, re, sys, shutil

PERF = "./src/utils/performance.js"
HUB  = "./src/pages/HubPage.jsx"
ADDON = "./_snapshot_addon.js"
TARGETS = [PERF, HUB]

def backup(p):
    if not os.path.isfile(p + ".bak"): shutil.copyfile(p, p + ".bak")

def restore():
    n = 0
    for p in TARGETS:
        if os.path.isfile(p + ".bak"):
            shutil.copyfile(p + ".bak", p); print("  restored " + p); n += 1
    print(f"\nRestored {n} file(s)."); return n > 0

def patch_perf():
    if not os.path.isfile(PERF): print("  MISSING " + PERF); return False
    src = open(PERF, encoding="utf-8").read()
    if "studentSnapshot" in src:
        print("  performance.js already has studentSnapshot"); return True
    if not os.path.isfile(ADDON):
        print("  MISSING " + ADDON + " (ships beside this script)"); return False
    backup(PERF)
    open(PERF, "a", encoding="utf-8").write(open(ADDON, encoding="utf-8").read())
    print("  performance.js  + studentSnapshot()")
    return True

def patch_hub():
    if not os.path.isfile(HUB): print("  MISSING " + HUB); return False
    src = open(HUB, encoding="utf-8").read()
    backup(HUB)
    changed = []

    # the typo that's been live for weeks
    if "acess notes" in src:
        src = src.replace("acess notes", "access notes")
        changed.append("fixed 'acess' typo")

    if "ContinueStrip" not in src:
        imports = list(re.finditer(r"^import .*?;$", src, re.M))
        if not imports: print("  no imports found in HubPage"); return False
        at = imports[-1].end()
        src = src[:at] + "\nimport ContinueStrip from '../components/ContinueStrip';" + src[at:]

        # Render it AFTER the tools grid — i.e. below the Topical Database
        # featured card, which is the last item in that grid.
        m = re.search(r"\n      </main>", src)
        if not m:
            print("  couldn't find </main> — add <ContinueStrip /> by hand")
        else:
            src = src[:m.start()] + "\n\n        <ContinueStrip />\n      </main>" + src[m.end():]
            changed.append("+ <ContinueStrip /> below the Topical Database card")

    open(HUB, "w", encoding="utf-8").write(src)
    print("  HubPage.jsx  " + (", ".join(changed) if changed else "already done"))
    return True

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    if not os.path.isfile("./src/components/ContinueStrip.jsx"):
        print("Copy this in first:\n   src/components/ContinueStrip.jsx"); sys.exit(1)
    print("Wiring the student's own data into the hub...\n")
    ok = patch_perf() and patch_hub()
    if ok:
        print("\nDone.\n")
        print("IMPORTANT: HubPage must have `topicalDb` available. If the console")
        print("says topicalDb is not defined, add this near the top of HubPage:")
        print("    const { topicalDb } = useDatabases();")
        print("    import { useDatabases } from '../hooks/useDatabases';")
        print("\nTest:")
        print("  npm run dev -> solve a few MCQs on a paper -> go back to /")
        print("  You should see CONTINUE with your paper + progress + weak topics.")
        print("  Open an incognito window -> the hub looks exactly as it did.")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
