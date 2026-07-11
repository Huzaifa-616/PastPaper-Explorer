# Phase 10 — Settings: Themes, Text Size, Default Subject

## What you get
A gear button (bottom-left, on every page) opens a Settings modal with:

1. **Theme gallery — 6 themes**, each a full palette with a live preview swatch:
   - Midnight (your original dark) · Daylight (your original light)
   - AMOLED (true black — saves battery on OLED phones)
   - Ocean (deep blue) · Forest (dark green) · Sepia (warm paper-like light)
   Existing users see zero change: Midnight/Daylight stay the defaults, and the
   old dark/light choice migrates automatically from the legacy storage key.
   The Sun/Moon toggle still works everywhere — it flips between Daylight and
   the user's CHOSEN dark theme (e.g. Ocean), not always Midnight.

2. **Text size** — Small / Default / Large / XL. Scales the entire interface.
   (Why `zoom`: the app styles in inline px, so rem-based scaling wouldn't do
   anything. `zoom` on #root scales px layouts cleanly; supported in all modern
   browsers incl. Firefox 126+.)

3. **Default subject** — pre-selects a subject when opening the paper
   workspace. "None — ask every time" is the default.

All choices persist per device in localStorage (`nexusSettings`).

## Files (all drop-in)
| File | Where | What |
|---|---|---|
| src/config/themes.js | NEW | 6 theme palettes + font scales |
| src/hooks/useSettings.js | NEW | Settings state, persistence, legacy migration |
| src/components/SettingsModal.jsx | NEW | The modal UI |
| src/styles/GlobalStyles.jsx | REPLACE | Theme-object driven (backward compatible) |
| src/App.jsx | REPLACE | Mounts modal + gear launcher, uses useSettings |
| src/pages/ExplorerPage.jsx | REPLACE | Reads the default subject |

`src/hooks/useTheme.js` is now unused — safe to delete (GlobalStyles keeps a
fallback so old `dark` props still work).

## Adding your own theme later
Add ONE object to THEMES in src/config/themes.js with the 16 color values —
it appears in the gallery automatically. That's the whole procedure.

## Test checklist
1. `npm run dev` → gear bottom-left → modal opens.
2. Click each theme — whole app recolors instantly; survives refresh.
3. Pick Ocean, hit the Sun/Moon toggle twice — you return to Ocean, not Midnight.
4. Text size XL — everything scales up; Default restores.
5. Set default subject → open Papers from hub → pre-selected.
6. Reset to defaults works.
