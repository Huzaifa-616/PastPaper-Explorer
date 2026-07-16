"""
add_symbol_field.py — wire the ambient symbol field into the app
================================================================

Adds three things, surgically:

  1. src/hooks/useSettings.js   -> a `symbolField: true` default, so the
                                   setting persists like theme / font size.
  2. src/components/SettingsModal.jsx
                                -> an "Ambient symbols" ON/OFF switch, in the
                                   same <Section> style as the others.
  3. src/pages/HubPage.jsx      -> renders <SymbolField enabled={...} />

The two NEW files (src/config/symbols.js and src/components/SymbolField.jsx)
come from the zip — copy those in first.

    python add_symbol_field.py
    python add_symbol_field.py --restore

Safe to run twice. Every touched file is backed up to <file>.bak.
"""

import os
import re
import sys
import shutil

SETTINGS = "./src/hooks/useSettings.js"
MODAL = "./src/components/SettingsModal.jsx"
HUB = "./src/pages/HubPage.jsx"
TARGETS = [SETTINGS, MODAL, HUB]


def backup(path):
    bak = path + ".bak"
    if not os.path.isfile(bak):
        shutil.copyfile(path, bak)


def restore():
    n = 0
    for path in TARGETS:
        bak = path + ".bak"
        if os.path.isfile(bak):
            shutil.copyfile(bak, path)
            print(f"  restored {path}")
            n += 1
    print(f"\nRestored {n} file(s).")
    return n > 0


def patch_settings():
    if not os.path.isfile(SETTINGS):
        print(f"  MISSING {SETTINGS}")
        return False
    src = open(SETTINGS, encoding="utf-8").read()
    if "symbolField" in src:
        print("  useSettings.js already has symbolField — skipping")
        return True

    m = re.search(r"(const DEFAULTS = \{[^}]*)(\})", src)
    if not m:
        print("  couldn't find the DEFAULTS object in useSettings.js")
        return False
    backup(SETTINGS)
    src = src[:m.end(1)] + ", symbolField: true " + src[m.start(2):]

    # Announce changes so components that own a setting (SymbolField) can react.
    # Needed because settings persist in an effect (after render), so reading
    # localStorage during render returns a stale value right after a toggle.
    ev = re.search(r"(try \{ localStorage\.setItem\(KEY, JSON\.stringify\(settings\)\); \} catch \{ /\* ignore \*/ \})", src)
    if ev and "nexus-settings" not in src:
        src = (src[:ev.end()]
               + "\n    window.dispatchEvent(new CustomEvent('nexus-settings', { detail: settings }));"
               + src[ev.end():])
        print("  useSettings.js  + symbolField: true, + change event")
    else:
        print("  useSettings.js  + symbolField: true")

    open(SETTINGS, "w", encoding="utf-8").write(src)
    return True


def patch_modal():
    if not os.path.isfile(MODAL):
        print(f"  MISSING {MODAL}")
        return False
    src = open(MODAL, encoding="utf-8").read()
    if "Ambient symbols" in src:
        print("  SettingsModal.jsx already has the toggle — skipping")
        return True

    # Insert a new Section immediately after the "Text size" Section closes.
    m = re.search(r'<Section label="Text size">.*?</Section>', src, re.S)
    if not m:
        print("  couldn't find the 'Text size' Section in SettingsModal.jsx")
        return False

    block = '''

        <Section label="Ambient symbols">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSetting('symbolField', !settings.symbolField)}
              aria-pressed={!!settings.symbolField}
              style={{
                width: 44, height: 26, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
                border: '1px solid var(--line2)', padding: 3,
                background: settings.symbolField ? 'var(--accent)' : 'var(--surface3)',
                transition: 'background .2s',
              }}
            >
              <span style={{
                display: 'block', width: 18, height: 18, borderRadius: '50%',
                background: settings.symbolField ? '#fff' : 'var(--text3)',
                transform: settings.symbolField ? 'translateX(18px)' : 'translateX(0)',
                transition: 'transform .2s cubic-bezier(.34,1.56,.64,1), background .2s',
              }} />
            </button>
            <span style={{ fontSize: 12.5, color: 'var(--text3)', lineHeight: 1.5 }}>
              Drifting A-Level notation behind the dashboard. Turn it off for a
              still background.
            </span>
          </div>
        </Section>'''

    backup(MODAL)
    src = src[:m.end()] + block + src[m.end():]
    open(MODAL, "w", encoding="utf-8").write(src)
    print("  SettingsModal.jsx  + 'Ambient symbols' switch")
    return True


def patch_hub():
    if not os.path.isfile(HUB):
        print(f"  MISSING {HUB}")
        return False
    src = open(HUB, encoding="utf-8").read()
    if "SymbolField" in src:
        print("  HubPage.jsx already renders SymbolField — skipping")
        return True

    backup(HUB)

    # import after the last existing import line
    imports = list(re.finditer(r"^import .*?;$", src, re.M))
    if not imports:
        print("  couldn't find imports in HubPage.jsx")
        return False
    at = imports[-1].end()
    src = src[:at] + "\nimport SymbolField from '../components/SymbolField';" + src[at:]

    # render it as the first child of the page's outermost element
    m = re.search(r"(return \(\s*\n\s*<div[^>]*>)", src)
    if not m:
        print("  couldn't find the root <div> of HubPage — add it by hand:")
        print("      <SymbolField />")
        open(HUB, "w", encoding="utf-8").write(src)
        return True

    src = src[:m.end()] + "\n      <SymbolField />" + src[m.end():]
    open(HUB, "w", encoding="utf-8").write(src)
    print("  HubPage.jsx  + <SymbolField />")
    return True


def main():
    if "--restore" in sys.argv[1:]:
        sys.exit(0 if restore() else 1)

    missing = [p for p in ["./src/config/symbols.js", "./src/components/SymbolField.jsx"]
               if not os.path.isfile(p)]
    if missing:
        print("Copy these from the zip first:")
        for p in missing:
            print("   " + p)
        sys.exit(1)

    print("Wiring the symbol field...\n")
    ok = patch_settings() and patch_modal() and patch_hub()

    if ok:
        print("\nDone.\n")
        print("Test:")
        print("  npm run dev  ->  the hub. Wait ~5s and look BEHIND the text.")
        print("  Move the mouse near a glyph — it brightens and eases away.")
        print("  Gear -> Ambient symbols -> off -> the canvas unmounts entirely.")
        print("\nThen:")
        print('  git add . && git commit -m "ambient symbol field" && git push origin main')
        print("\nUndo:  python add_symbol_field.py --restore")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
