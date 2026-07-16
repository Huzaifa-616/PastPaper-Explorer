# Phase 27 — the black bar at the bottom

## The cause (found in YOUR code, with exact math)

`src/styles/GlobalStyles.jsx` line 46:

    #root { zoom: ${fontScale}; }

CSS `zoom` scales how an element RENDERS. But `vh` is measured against the raw
viewport and is completely unaffected by zoom. So every page that says
`height: 100vh` gets mis-sized the moment your text size isn't "Default".

`src/config/themes.js`:

    FONT_SCALES = [
      { id: 0.875, label: 'Small'   },   <- you have this one selected
      { id: 1,     label: 'Default' },
      { id: 1.125, label: 'Large'   },
      { id: 1.25,  label: 'XL'      },
    ]

The arithmetic on your screenshot:

    viewport                       855px
    ExplorerPage asks 100vh    =   855px
    #root renders it at 0.875  =   748px
    ---------------------------------------
    leftover                       107px   <- body showing through
                                            body background = var(--bg) = BLACK

Your screenshot: the iframe stops at ~750 and black runs to ~855. That is the
107px, exactly. At "Large" (1.125) you'd get the opposite — content spilling
past the bottom of the window. Only "Default" ever looked right.

Nothing was wrong with ExplorerPage's flex chain. I checked it line by line
(100vh -> flex:1 -> flex:1 -> height:100%) and it is correct — the container
it lives in was simply the wrong size.

## The fix
A viewport variable that cancels the zoom out:

    :root { --app-h: calc(100vh / ${fontScale}); }
    #root { zoom: ${fontScale}; }

    855 / 0.875 = 977  ->  rendered at 0.875  ->  855   exact fit, any scale.

It also emits a `100dvh` variant behind `@supports`, which fixes the same
class of gap on mobile (where 100vh wrongly counts the space behind the URL
bar) — that's why you saw it on your phone too.

Then every `100vh` in `src/pages/` becomes `var(--app-h)`.

## Run it
    cd C:\paper-explorer
    python fix_zoom_viewport.py

    git add .
    git commit -m "fix viewport height under UI zoom"
    git push origin main

Undo any time:  `python fix_zoom_viewport.py --restore`  (every file is
backed up to .bak first).

## Tested against YOUR real files (pulled from your repo)
    GlobalStyles.jsx   + :root { --app-h ... } + dvh variant
    ExplorerPage.jsx   1 x 100vh -> var(--app-h)
    HubPage.jsx        1 x
    IndexerPage.jsx    3 x
    LibraryPage.jsx    1 x   (raw CSS inside a template literal)
    TopicalsPage.jsx   1 x
    -> 7 total, and all 6 files still compile (esbuild).

Two bugs I hit while building this, both caught by testing rather than
shipped to you:
  * my first regex only matched quoted values ('100vh') and silently skipped
    LibraryPage, whose 100vh is raw CSS inside a template literal;
  * my injected comment used backticks, which terminated the surrounding JS
    template literal and broke GlobalStyles.jsx.

## Test after running
    npm run dev  ->  Settings (gear, bottom-left) -> Text size
    Switch between Small / Default / Large / XL.
    The layout should fit the window exactly at every size:
    no black bar, no overflow. Check a paper, the hub, and the library.
