import React, { useRef, useEffect, useState } from 'react';
import { WEIGHTED_SYMBOLS, SUBJECT_HUE } from '../config/symbols';
import { PAPER_CODES } from '../config/paperCodes';
import { getSetting } from '../hooks/useSettings';

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD BACKDROP — four modes, chosen in Settings
   ═══════════════════════════════════════════════════════════════════════════
     off      Nothing. The plain dashboard. A still page is a valid choice —
              no effect beats a mediocre effect.
     falling  A-Level notation drifting down, coloured by subject.
     torch    Notation sits STILL and nearly invisible (~1.8%); your cursor
              REVEALS it and it fades back — chalk on a dark wall found by
              torchlight. Zero ambient motion: nothing competes with the
              headline until you move.
     papers   A rigid GRID of real paper codes (9702/12, 9618/13...), also
              revealed by the cursor. A grid reads as intent; random scatter
              reads as accident. Says "we have everything" without a counter.

   torch/papers idle at 0% CPU — the draw stops once the cursor settles and
   the glow has faded. They only cost anything while you're moving.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── TUNING ─────────────────────────────────────────────────────────────── */
// falling
const FALL_COUNT_DESKTOP = 42;
const FALL_COUNT_MOBILE  = 20;
const FALL_OPACITY_MIN   = 0.09;
const FALL_OPACITY_MAX   = 0.20;
const FALL_SIZE_MIN      = 15;
const FALL_SIZE_MAX      = 42;
const FALL_SPEED_MIN     = 15;    // px/sec
const FALL_SPEED_MAX     = 40;
const FALL_SWAY_WIDTH    = 6;
const FALL_SWAY_SPEED    = 0.5;
const CURSOR_RADIUS      = 160;
const CURSOR_GLOW        = 0.34;
const CURSOR_PUSH        = 28;

// torch / papers (reveal-by-light)
const REVEAL_RADIUS      = 190;   // the beam
const REVEAL_REST        = 0.018; // opacity at rest — nearly invisible
const REVEAL_PEAK        = 0.42;  // opacity at the centre of the beam
const TORCH_DENSITY      = 105;
const TORCH_SIZE_MIN     = 16;
const TORCH_SIZE_MAX     = 34;
const PAPER_CELL_W       = 128;   // grid pitch
const PAPER_CELL_H       = 46;
const PAPER_SIZE         = 14;

/* Presets for `falling` — copy a row over the numbers above:
     FEEL       COUNT   OPACITY        SPEED
     Whisper    26/12   0.035 / 0.09   7  / 22
     Ambient    42/20   0.09  / 0.20   7  / 22
     Current    42/20   0.09  / 0.20   15 / 40
     Present    60/28   0.14  / 0.28   20 / 50
     Bold       80/36   0.20  / 0.38   30 / 70
   Speed is the dial that turns "atmospheric" into "screensaver" — push count
   and opacity first. Perf isn't the limit: 90 glyphs is ~0.5ms of a 16.7ms frame.
*/

/* ── COLOUR ──────────────────────────────────────────────────────────────
   MONOCHROME = true   every glyph is one colour (--text). Restrained, and
                       the thing that most separates "designed" from "toy":
                       six colours drifting at once reads as a sticker sheet.
   MONOCHROME = false  colour-coded per subject (teal CS, amber Physics,
                       rose Chemistry, green Biology, indigo Maths, violet FM).

   Uses your theme's --text, NOT #fff — hard-coded white would be invisible on
   the Daylight and Sepia themes. This stays legible on all six.
   ───────────────────────────────────────────────────────────────────────── */
const MONOCHROME = true;
const INK_VAR    = '--text';    // try '--text2' for a softer grey, or '--accent'

const DEFAULT_MODE = 'falling';

const SymbolField = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  /* Owns its own setting. useSettings persists in an effect (AFTER render), so
     reading localStorage during render would be stale the instant the user
     changes it — seed once, then listen for the change event. */
  const [mode, setMode] = useState(() => {
    const m = getSetting('backdrop');
    if (m) return m;
    return getSetting('symbolField') === false ? 'off' : DEFAULT_MODE;  // migrate old boolean
  });

  useEffect(() => {
    const onChange = (e) => {
      const d = e.detail || {};
      if (d.backdrop) setMode(d.backdrop);
    };
    window.addEventListener('nexus-settings', onChange);
    return () => window.removeEventListener('nexus-settings', onChange);
  }, []);

  useEffect(() => {
    if (mode === 'off') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const coarse = window.matchMedia?.('(pointer: coarse)').matches;

    // Canvas can't read var() — resolve theme colours, re-resolve on change.
    let palette = {};
    let ink = '#94a3b8';
    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      palette = Object.fromEntries(
        Object.entries(SUBJECT_HUE).map(([k, v]) => {
          const name = v.match(/var\((--[\w-]+)/)?.[1];
          const fb = v.match(/,\s*(#[0-9a-fA-F]{3,8})\s*\)/)?.[1];
          return [k, (name ? cs.getPropertyValue(name).trim() : '') || fb || '#94a3b8'];
        })
      );
      ink = cs.getPropertyValue(INK_VAR).trim() || '#f8fafc';
    };
    readPalette();

    let w = 0, h = 0, dpr = 1;
    let parts = [];
    let mx = -1e4, my = -1e4;
    let needsDraw = true;

    const pickSymbol = () => WEIGHTED_SYMBOLS[(Math.random() * WEIGHTED_SYMBOLS.length) | 0];

    const spawnFalling = (seeded) => {
      const s = pickSymbol();
      return {
        glyph: s.glyph, subject: s.subject,
        x: Math.random() * w,
        y: seeded ? Math.random() * h : -40 - Math.random() * 120,
        size: FALL_SIZE_MIN + Math.random() * (FALL_SIZE_MAX - FALL_SIZE_MIN),
        vy: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
        drift: (Math.random() - 0.5) * FALL_SWAY_WIDTH,
        phase: Math.random() * Math.PI * 2,
        base: FALL_OPACITY_MIN + Math.random() * (FALL_OPACITY_MAX - FALL_OPACITY_MIN),
        glow: 0, ox: 0, oy: 0,
      };
    };

    const buildTorch = () => Array.from({ length: TORCH_DENSITY }, () => {
      const s = pickSymbol();
      return {
        glyph: s.glyph, subject: s.subject,
        x: Math.random() * w, y: Math.random() * h,
        size: TORCH_SIZE_MIN + Math.random() * (TORCH_SIZE_MAX - TORCH_SIZE_MIN),
        rot: (Math.random() - 0.5) * 0.18,
        glow: 0,
      };
    });

    const buildPapers = () => {
      const out = [];
      const cols = Math.ceil(w / PAPER_CELL_W) + 1;
      const rows = Math.ceil(h / PAPER_CELL_H) + 1;
      let i = (Math.random() * PAPER_CODES.length) | 0;
      for (let r = 0; r < rows; r++) {
        const off = (r % 2) * (PAPER_CELL_W / 2);   // stagger — a wall, not a spreadsheet
        for (let c = 0; c < cols; c++) {
          const p = PAPER_CODES[i++ % PAPER_CODES.length];
          out.push({
            glyph: p.glyph, subject: p.subject,
            x: c * PAPER_CELL_W + off + 10,
            y: r * PAPER_CELL_H + 22,
            size: PAPER_SIZE, rot: 0, glow: 0,
          });
        }
      }
      return out;
    };

    const rebuild = () => {
      if (mode === 'falling') {
        const n = coarse ? FALL_COUNT_MOBILE : FALL_COUNT_DESKTOP;
        parts = Array.from({ length: n }, () => spawnFalling(true));
      } else if (mode === 'torch') parts = buildTorch();
      else parts = buildPapers();
    };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
      needsDraw = true;
    };

    const onMove = (e) => { mx = e.clientX; my = e.clientY; needsDraw = true; };
    const onLeave = () => { mx = -1e4; my = -1e4; needsDraw = true; };
    if (!coarse) {
      addEventListener('pointermove', onMove, { passive: true });
      addEventListener('pointerleave', onLeave, { passive: true });
    }

    resize();

    let last = performance.now();
    let running = true;

    const drawFalling = (dt) => {
      for (const p of parts) {
        p.y += p.vy * dt;
        p.phase += dt * FALL_SWAY_SPEED;
        p.x += Math.sin(p.phase) * p.drift * dt;

        let tG = 0, pX = 0, pY = 0;
        if (mx > -1e3) {
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_RADIUS * CURSOR_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / CURSOR_RADIUS;
            tG = f * CURSOR_GLOW;
            pX = (dx / d) * f * CURSOR_PUSH;
            pY = (dy / d) * f * CURSOR_PUSH;
          }
        }
        p.glow += (tG - p.glow) * 0.10;
        p.ox += (pX - p.ox) * 0.08;
        p.oy += (pY - p.oy) * 0.08;

        if (p.y - p.size > h + 40) Object.assign(p, spawnFalling(false));

        const a = p.base + p.glow;
        if (a <= 0.004) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = MONOCHROME ? ink : (palette[p.subject] || ink);
        ctx.font = `500 ${p.size}px "Outfit", system-ui, sans-serif`;
        ctx.fillText(p.glyph, p.x + p.ox, p.y + p.oy);
      }
    };

    /* Reveal modes: nothing moves. Redraw only while a glow is still easing;
       once everything settles we stop drawing and idle at 0% CPU. */
    const drawReveal = (isPapers) => {
      let settling = false;
      const r2 = REVEAL_RADIUS * REVEAL_RADIUS;
      for (const p of parts) {
        let t = 0;
        if (mx > -1e3) {
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const f = 1 - Math.sqrt(d2) / REVEAL_RADIUS;
            t = f * f * (REVEAL_PEAK - REVEAL_REST);   // f² — soft falloff
          }
        }
        p.glow += (t - p.glow) * 0.16;
        if (Math.abs(p.glow - t) > 0.0015) settling = true;

        const a = REVEAL_REST + p.glow;
        if (a <= 0.004) continue;
        ctx.globalAlpha = a;
        // In colour mode: monochrome at rest, blooming into the subject's
        // colour only when the beam hits it — colour as a reward for looking.
        ctx.fillStyle = MONOCHROME ? ink
          : (p.glow > 0.06 ? (palette[p.subject] || ink) : ink);
        ctx.font = isPapers
          ? `500 ${p.size}px "Roboto Mono", ui-monospace, monospace`
          : `500 ${p.size}px "Outfit", system-ui, sans-serif`;
        if (p.rot) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillText(p.glyph, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(p.glyph, p.x, p.y);
        }
      }
      return settling;
    };

    const frame = (now) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const animating = mode === 'falling';
      if (!animating && !needsDraw) {
        rafRef.current = requestAnimationFrame(frame);
        return;   // idle — no clear, no draw, no cost
      }

      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = mode === 'papers' ? 'left' : 'center';
      ctx.textBaseline = 'middle';

      if (animating) drawFalling(dt);
      else needsDraw = drawReveal(mode === 'papers');

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(rafRef.current); }
      else if (!running) { running = true; last = performance.now(); needsDraw = true; rafRef.current = requestAnimationFrame(frame); }
    };
    document.addEventListener('visibilitychange', onVis);
    addEventListener('resize', resize);

    const obs = new MutationObserver(() => { readPalette(); needsDraw = true; });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerleave', onLeave);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      obs.disconnect();
    };
  }, [mode]);

  if (mode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
};

export default SymbolField;
