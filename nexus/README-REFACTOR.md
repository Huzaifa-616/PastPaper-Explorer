# The Nexus — Phase 1 Refactor: Monolith → Modules + Real URLs

## What this is
Your 1,875-line `App.jsx` split into a clean architecture, with react-router
wired in so every paper, topic list, and library view has a shareable URL.
Verified: `vite build` passes, ESLint reports zero undefined identifiers.

## New structure
```
src/
  main.jsx                  ← now wraps App in <BrowserRouter>
  App.jsx                   ← 95 lines: routes + wiring only
  index.css
  config/
    constants.js            ← SUBJECTS, YEARS, SEASONS, MCQ config, subjectName()
    syllabus.js             ← SYLLABUS_STRUCTURE
    answerKeys.js           ← MCQ_ANSWER_KEYS (to be auto-generated in Phase 3)
  hooks/
    useTheme.js             ← dark mode + localStorage
    useDatabases.js         ← topicals/library JSON, cached per session
    useMcqSession.js        ← MCQ answers now PERSIST in localStorage ★
  components/
    DynamicLogo.jsx  NexusSelect.jsx  ContactModal.jsx
    TopicalsSidebar.jsx  LibrarySidebar.jsx  MCQSolver.jsx
  styles/
    GlobalStyles.jsx        ← rendered once in App, not per page
  pages/
    HubPage.jsx             ← was StartupScreen
    ExplorerPage.jsx        ← the workspace, now driven by the URL
    TopicalsPage.jsx        ← was FullTopicalsPage
    LibraryPage.jsx         ← was FullLibraryPage
    IndexerPage.jsx         ← was TopicalIndexer (now at /indexer)
```

## The URLs you now have
| Route | What it shows |
|---|---|
| `/` | Hub |
| `/papers` | Empty workspace (`?subject=9702` pre-selects) |
| `/papers/9702/s23/qp/12` | Physics Summer-23 QP variant 12, loaded |
| `/papers/9702/s23/qp/12?page=5` | Same, opened at page 5 (topical jumps use this) |
| `/topicals` · `/topicals/9618` | Topicals dashboard |
| `/library` · `/library/9701` | Library dashboard |
| `/indexer` | Admin indexer tool |

Students can now paste paper links straight into WhatsApp groups; browser
back/forward works; Google can index every paper page. QP↔MS toggle while
viewing updates the URL too.

## Behavior upgrades included free
- **MCQ progress persists.** Bubbled answers survive refresh/revisit
  (`localStorage` key `nexusMcqSessions`, each entry timestamped — this is
  the data foundation for the future "weakest topics" feature).
- **Page titles** now reflect the loaded paper (good for history + SEO).
- **GlobalStyles deduplicated** — one <style> tag, always mounted.

## How to install
1. **Back up / commit** your current state first: `git add -A && git commit -m "pre-refactor"`
2. Delete from `src/`: `App.jsx`, `oldcode3.jsx`, `olddesign.jsx`,
   `redesign2_0.jsx`, `finalCode.jsx`, `current_final.jsx`,
   `TopicalIndexer.jsx`, `PdfViewer.jsx` (unused), `interpreter.js` (unused for now).
   Git history keeps them forever — the working tree shouldn't.
3. Copy this `src/` folder in, replacing yours.
4. Copy `public/_redirects` into your `public/` folder.
5. `npm run dev` and click through everything.

## Cloudflare SPA fallback (IMPORTANT)
Deep links like `/papers/9702/s23/qp/12` must serve `index.html`:
- **Cloudflare Pages:** the included `public/_redirects` (`/* /index.html 200`) handles it.
- **Wrangler Workers assets:** add to your wrangler config instead:
  ```jsonc
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
  ```

## Cleanup you can also do now
- `npm uninstall react-pdf` — you render via the PDF.js iframe; react-pdf is dead weight.

## Known pre-existing quirks (left as-is on purpose, flag for later)
- Random hub logo uses Math.random in render (React 19 lint complains; harmless).
- Answer keys still hardcoded — Phase 3 auto-extracts them from mark schemes.
