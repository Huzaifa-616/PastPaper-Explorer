# Phase 9 — PWA + Offline

Turns The Nexus into an installable app that works offline. Students can add it
to their home screen, and any paper/topic they've opened stays available with
no connection — the "it worked when my internet died" feature.

## What's included & where it goes
| File | Where | Notes |
|---|---|---|
| `vite.config.js` | project root | Adds vite-plugin-pwa with tuned caching. Replace yours. |
| `index.html` | project root | Adds theme-color + iOS PWA meta tags. Replace yours. |
| `src/App.jsx` | src/ | Mounts <PWAStatus/>. Replace yours. |
| `src/components/PWAStatus.jsx` | src/components/ | Offline pill + "update available" prompt. New file. |
| `public/icons/*.png` | public/icons/ | App icons (192, 512, 512-maskable). See note below. |

## One install step
```
npm install -D vite-plugin-pwa
```
(That's the only new dependency. Everything else is config.)

## Then
```
npm run build
npm run preview   # PWA only works in build/preview, NOT in `npm run dev`
```
Open the preview URL, and in Chrome DevTools → Application tab you should see:
- Manifest: "The Nexus" with icons
- Service Workers: one active worker
- An install icon (⊕) appears in the address bar → click to install as an app.

## The caching strategy (why it's built this way)
Your content splits into two kinds, cached oppositely on purpose:
- **App shell + databases → network-first.** Always tries fresh so new papers
  appear, falls back to cache when offline.
- **Papers, slices, library PDFs from R2 → cache-first.** Immutable once made,
  so once a student opens a paper it's saved and reopens instantly, offline.
  Papers are capped at 60 cached (storage stays sane); slices at 3000.

Result: a student opens papers on wifi, then on the bus with no signal, those
exact papers still open. Fresh content needs connection; seen content doesn't.

## IMPORTANT — the icons
I generated placeholder icons (a layers mark on your #0d0d0d brand color) so the
manifest isn't broken. I could NOT visually verify them this session, so please
LOOK at public/icons/icon-512.png before shipping. If you want your real logo:
just replace the three PNGs (192, 512, and a 512 "maskable" with padding around
the mark) — keep the same filenames and it all works.

## After deploy
- PWA requires HTTPS (your Cloudflare deploy already is — good).
- Test install on an actual phone: open the site in mobile Chrome/Safari →
  "Add to Home Screen" → it launches fullscreen like a native app.
- iOS is fussier: it uses the apple-touch-icon and apple-mobile-web-app tags
  (already added to index.html). Safari → Share → Add to Home Screen.

## Deliberately NOT cached
- The PDF.js viewer route (/pdf-viewer/) loads normally — it manages its own
  fetching and shouldn't be intercepted by the SW navigation fallback.
