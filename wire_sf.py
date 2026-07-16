"""
wire_sf.py — CS Paper 4 source files in the Nexus
=================================================
  src/config/assets.js       -> + sfUrl()
  src/hooks/useDatabases.js  -> loads /sf_db.json alongside the others
  src/pages/ExplorerPage.jsx -> a SOURCE FILES dropdown that appears ONLY for
                                9618 Paper 4, + the viewer panel

Copy this in first:  src/components/SourceFileViewer.jsx

    python wire_sf.py
    python wire_sf.py --restore
Safe to run twice.
"""
import os, re, sys, shutil

ASSETS = "./src/config/assets.js"
DB     = "./src/hooks/useDatabases.js"
EXP    = "./src/pages/ExplorerPage.jsx"
TARGETS = [ASSETS, DB, EXP]

def backup(p):
    if not os.path.isfile(p + ".baksf"): shutil.copyfile(p, p + ".baksf")

def restore():
    n = 0
    for p in TARGETS:
        if os.path.isfile(p + ".baksf"):
            shutil.copyfile(p + ".baksf", p); print("  restored " + p); n += 1
    print(f"\nRestored {n} file(s)."); return n > 0

def patch_assets():
    src = open(ASSETS, encoding="utf-8").read()
    if "sfUrl" in src:
        print("  assets.js already has sfUrl"); return True
    backup(ASSETS)
    src += """
/** CS Paper 4 source files (Blue.txt, TheData.txt...). Same R2 base as
 *  everything else — paths come straight out of sf_db.json. */
export const sfUrl = (filePath) => {
  if (!filePath) return '';
  return `${R2}/${encodeURI(filePath.replace(/^\\//, ''))}`;
};
"""
    open(ASSETS, "w", encoding="utf-8").write(src)
    print("  assets.js  + sfUrl()")
    return True

def patch_db():
    src = open(DB, encoding="utf-8").read()
    if "sfDb" in src:
        print("  useDatabases.js already loads sf_db"); return True
    backup(DB)
    src = src.replace("const cache = { topicals: undefined, library: undefined };",
                      "const cache = { topicals: undefined, library: undefined, sf: undefined };")
    src = src.replace("  const [libraryDb, setLibraryDb] = useState(cache.library ?? []);",
                      "  const [libraryDb, setLibraryDb] = useState(cache.library ?? []);\n  const [sfDb, setSfDb] = useState(cache.sf ?? null);")
    # add the fetch next to the others
    m = re.search(r"(load\('library',\s*'[^']*'\)\.then\(\w+\s*=>\s*\{[^}]*\}\);)", src)
    if m:
        src = src[:m.end()] + "\n    load('sf', '/sf_db.json').then(d => { if (alive) setSfDb(d); });" + src[m.end():]
    else:
        m2 = re.search(r"(useEffect\(\(\) => \{\s*let alive = true;)", src)
        if m2:
            src = src[:m2.end()] + "\n    load('sf', '/sf_db.json').then(d => { if (alive) setSfDb(d); });" + src[m2.end():]
    src = re.sub(r"return \{ topicalDb, libraryDb \};", "return { topicalDb, libraryDb, sfDb };", src)
    open(DB, "w", encoding="utf-8").write(src)
    print("  useDatabases.js  + sfDb")
    return True

def patch_explorer():
    src = open(EXP, encoding="utf-8").read()
    if "SourceFileViewer" in src:
        print("  ExplorerPage already has the viewer"); return True
    backup(EXP)

    # imports
    imports = list(re.finditer(r"^import .*?;$", src, re.M))
    src = (src[:imports[-1].end()]
           + "\nimport SourceFileViewer from '../components/SourceFileViewer';"
           + src[imports[-1].end():])

    # sfDb from the hook
    m = re.search(r"const \{ ([^}]*) \} = useDatabases\(\);", src)
    if m and "sfDb" not in m.group(1):
        src = src[:m.start(1)] + m.group(1).strip() + ", sfDb" + src[m.end(1):]

    # state + the derived list — placed right before the viewer URL memo
    anchor = re.search(r"(\n  const activeFileUrl = useMemo)", src)
    block = '''
  /* ── CS Paper 4 source files ──────────────────────────────────────────
     The nav already knows subject/season/year/paper/variant, and that IS the
     folder name (9618_s25_sf_42). So we never ask the student which folder —
     only which file. The dropdown is absent for everything else. */
  const [openSf, setOpenSf] = useState(null);
  const sfFiles = useMemo(() => {
    if (!sfDb || subject !== '9618' || paper !== '4') return [];
    const key = `${subject}_${season}${year.slice(2)}_sf_${paper}${variant}`;
    return sfDb[key]?.files || [];
  }, [sfDb, subject, season, year, paper, variant]);
  useEffect(() => { setOpenSf(null); }, [subject, season, year, paper, variant]);
'''
    if anchor:
        src = src[:anchor.start()] + block + src[anchor.start():]

    # the dropdown, inside the tools wrapper
    tools = re.search(r'(<div className="nav-tools-wrap"[^>]*>)', src)
    if tools:
        dd = '''
              {sfFiles.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:4 }}>Source Files</span>
                  <select className="nexus-select" value={openSf?.name || ''}
                    onChange={(e) => setOpenSf(sfFiles.find(f => f.name === e.target.value) || null)}>
                    <option value="">{sfFiles.length} file{sfFiles.length === 1 ? '' : 's'}…</option>
                    {sfFiles.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
              )}
'''
        src = src[:tools.end()] + dd + src[tools.end():]
    else:
        print("  ! couldn't find .nav-tools-wrap — add the dropdown by hand")

    # the panel, inside the viewer container (which is position:relative)
    ifr = re.search(r"(<iframe src=\{viewerSrc\}[^/]*/>)", src)
    if ifr:
        src = src[:ifr.end()] + "\n                  {openSf && <SourceFileViewer file={openSf} onClose={() => setOpenSf(null)} />}" + src[ifr.end():]

    open(EXP, "w", encoding="utf-8").write(src)
    print("  ExplorerPage.jsx  + SOURCE FILES dropdown + viewer")
    return True

def main():
    if "--restore" in sys.argv[1:]: sys.exit(0 if restore() else 1)
    if not os.path.isfile("./src/components/SourceFileViewer.jsx"):
        print("Copy this in first:\n   src/components/SourceFileViewer.jsx"); sys.exit(1)
    for p in TARGETS:
        if not os.path.isfile(p): print("MISSING " + p); sys.exit(1)
    print("Wiring Paper 4 source files...\n")
    ok = patch_assets() and patch_db() and patch_explorer()
    if ok:
        print("\nDone.\n")
        print("Test:")
        print("  python generate_sf.py --upload-r2   (if you haven't)")
        print("  npm run dev -> 9618 / Summer / 2025 / Paper 4 / Variant 2")
        print("  A SOURCE FILES dropdown appears next to Topicals/Library.")
        print("  Pick Blue.txt -> it opens beside the paper, with Copy.")
        print("  Switch to Physics -> the dropdown is gone.")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
