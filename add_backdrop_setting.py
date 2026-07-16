"""
add_backdrop_setting.py — wire the 4-mode dashboard backdrop picker
==================================================================
Patches three files (each backed up to .bak):
  src/hooks/useSettings.js        -> `backdrop: 'falling'` default + change event
  src/components/SettingsModal.jsx-> a 4-way picker (Off / Symbols / Torch / Papers)
  src/pages/HubPage.jsx           -> renders <SymbolField />

Copy these NEW files in first:
  src/config/symbols.js
  src/config/paperCodes.js
  src/components/SymbolField.jsx

    python add_backdrop_setting.py
    python add_backdrop_setting.py --restore
Safe to run twice.
"""
import os, re, sys, shutil

SETTINGS = "./src/hooks/useSettings.js"
MODAL    = "./src/components/SettingsModal.jsx"
HUB      = "./src/pages/HubPage.jsx"
TARGETS  = [SETTINGS, MODAL, HUB]

def backup(p):
    if not os.path.isfile(p + ".bak"): shutil.copyfile(p, p + ".bak")

def restore():
    n = 0
    for p in TARGETS:
        if os.path.isfile(p + ".bak"):
            shutil.copyfile(p + ".bak", p); print("  restored " + p); n += 1
    print(f"\nRestored {n} file(s)."); return n > 0

def patch_settings():
    if not os.path.isfile(SETTINGS): print("  MISSING " + SETTINGS); return False
    src = open(SETTINGS, encoding="utf-8").read()
    backup(SETTINGS)
    changed = False
    if "backdrop" not in src:
        m = re.search(r"(const DEFAULTS = \{[^}]*)(\})", src)
        if not m: print("  couldn't find DEFAULTS"); return False
        src = src[:m.end(1)] + ", backdrop: 'falling' " + src[m.start(2):]
        changed = True
    if "nexus-settings" not in src:
        ev = re.search(r"(try \{ localStorage\.setItem\(KEY, JSON\.stringify\(settings\)\); \} catch \{ /\* ignore \*/ \})", src)
        if ev:
            src = src[:ev.end()] + "\n    window.dispatchEvent(new CustomEvent('nexus-settings', { detail: settings }));" + src[ev.end():]
            changed = True
    open(SETTINGS, "w", encoding="utf-8").write(src)
    print("  useSettings.js  " + ("+ backdrop + change event" if changed else "already done"))
    return True

MODAL_BLOCK = '''

        <Section label="Dashboard backdrop">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { id: 'off',     name: 'Off',      desc: 'A still page.' },
              { id: 'falling', name: 'Symbols',  desc: 'Notation drifting down.' },
              { id: 'torch',   name: 'Torchlight', desc: 'Revealed by your cursor.' },
              { id: 'papers',  name: 'Paper wall', desc: 'A grid of paper codes.' },
            ].map(o => {
              const on = (settings.backdrop || 'falling') === o.id;
              return (
                <button key={o.id} onClick={() => setSetting('backdrop', o.id)}
                  style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: on ? 'var(--surface3)' : 'transparent',
                    border: on ? '1px solid var(--accent)' : '1px solid var(--line2)',
                    transition: 'all .15s',
                  }}>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700,
                                 color: on ? 'var(--text)' : 'var(--text2)' }}>{o.name}</span>
                  <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text3)', marginTop: 2 }}>{o.desc}</span>
                </button>
              );
            })}
          </div>
        </Section>'''

def patch_modal():
    if not os.path.isfile(MODAL): print("  MISSING " + MODAL); return False
    src = open(MODAL, encoding="utf-8").read()
    if "Dashboard backdrop" in src:
        print("  SettingsModal.jsx already has the picker"); return True
    backup(MODAL)
    # remove the old boolean toggle if the earlier script added it
    old = re.search(r'\n\n        <Section label="Ambient symbols">.*?</Section>', src, re.S)
    if old:
        src = src[:old.start()] + src[old.end():]
        print("  SettingsModal.jsx  - old on/off toggle")
    m = re.search(r'<Section label="Text size">.*?</Section>', src, re.S)
    if not m: print("  couldn't find the 'Text size' Section"); return False
    src = src[:m.end()] + MODAL_BLOCK + src[m.end():]
    open(MODAL, "w", encoding="utf-8").write(src)
    print("  SettingsModal.jsx  + 4-way backdrop picker")
    return True

def patch_hub():
    if not os.path.isfile(HUB): print("  MISSING " + HUB); return False
    src = open(HUB, encoding="utf-8").read()
    if "SymbolField" in src:
        print("  HubPage.jsx already renders SymbolField"); return True
    backup(HUB)
    imports = list(re.finditer(r"^import .*?;$", src, re.M))
    if not imports: print("  no imports found in HubPage"); return False
    at = imports[-1].end()
    src = src[:at] + "\nimport SymbolField from '../components/SymbolField';" + src[at:]
    m = re.search(r"(return \(\s*\n\s*<div[^>]*>)", src)
    if not m:
        open(HUB, "w", encoding="utf-8").write(src)
        print("  add <SymbolField /> to HubPage's root <div> by hand"); return True
    src = src[:m.end()] + "\n      <SymbolField />" + src[m.end():]
    open(HUB, "w", encoding="utf-8").write(src)
    print("  HubPage.jsx  + <SymbolField />")
    return True

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    need = [p for p in ["./src/config/symbols.js", "./src/config/paperCodes.js",
                        "./src/components/SymbolField.jsx"] if not os.path.isfile(p)]
    if need:
        print("Copy these in first:")
        for p in need: print("   " + p)
        sys.exit(1)
    print("Wiring the backdrop picker...\n")
    ok = patch_settings() and patch_modal() and patch_hub()
    if ok:
        print("\nDone.\n\nTest:  npm run dev  ->  gear -> Dashboard backdrop")
        print("  Off / Symbols / Torchlight / Paper wall — switches instantly.")
        print('\n  git add . && git commit -m "dashboard backdrop options" && git push origin main')
        print("\nUndo:  python add_backdrop_setting.py --restore")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
