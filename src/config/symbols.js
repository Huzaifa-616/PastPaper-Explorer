/**
 * The Nexus — Symbol vocabulary
 * =============================
 * The actual notation a CAIE A-Level student meets across the six subjects.
 * Not icons *about* a subject — the real glyphs from the papers themselves.
 *
 * Each entry: [glyph, subjectKey, weight]
 *   weight 3 = iconic (π, Σ, ∫) — appears often
 *   weight 2 = common
 *   weight 1 = deep cut — the rare ones that make a student go "wait, that's
 *              the Boltzmann constant" the third time they look
 */

export const SUBJECT_HUE = {
  math:    'var(--accent)',              // 9709
  fmath:   'var(--violet, #a78bfa)',     // 9231
  physics: 'var(--amber)',               // 9702
  chem:    'var(--rose)',                // 9701
  bio:     'var(--green)',               // 9700
  cs:      'var(--teal)',                // 9618
};

export const SYMBOLS = [
  // ── Mathematics (9709) ─────────────────────────────────────────────
  ['π', 'math', 3], ['Σ', 'math', 3], ['∫', 'math', 3], ['∞', 'math', 3],
  ['√', 'math', 3], ['θ', 'math', 3], ['Δ', 'math', 3], ['∂', 'math', 2],
  ['≈', 'math', 2], ['≠', 'math', 2], ['≤', 'math', 2], ['≥', 'math', 2],
  ['±', 'math', 2], ['∴', 'math', 2], ['∵', 'math', 1], ['∝', 'math', 2],
  ['∏', 'math', 2], ['ƒ(x)', 'math', 3], ['dy/dx', 'math', 3], ['∮', 'math', 1],
  ['lim', 'math', 2], ['sin', 'math', 2], ['cos', 'math', 2], ['tan', 'math', 2],
  ['log', 'math', 2], ['ln', 'math', 2], ['eˣ', 'math', 2], ['x²', 'math', 3],
  ['∑ⁿ', 'math', 1], ['n!', 'math', 2], ['ⁿCᵣ', 'math', 2], ['ⁿPᵣ', 'math', 1],
  ['μ', 'math', 2], ['σ²', 'math', 2], ['x̄', 'math', 2], ['∈', 'math', 1],
  ['∅', 'math', 1], ['∪', 'math', 1], ['∩', 'math', 1], ['⇒', 'math', 2],

  // ── Further Mathematics (9231) ─────────────────────────────────────
  ['ℂ', 'fmath', 2], ['ℝ', 'fmath', 2], ['ℤ', 'fmath', 1], ['ℕ', 'fmath', 1],
  ['∇', 'fmath', 2], ['⊗', 'fmath', 1], ['eⁱᶿ', 'fmath', 2], ['|z|', 'fmath', 2],
  ['arg z', 'fmath', 1], ['z*', 'fmath', 1], ['det', 'fmath', 2], ['M⁻¹', 'fmath', 2],
  ['λI', 'fmath', 1], ['sinh', 'fmath', 1], ['cosh', 'fmath', 1], ['tanh', 'fmath', 1],
  ['∬', 'fmath', 1], ['r·θ', 'fmath', 1], ['a×b', 'fmath', 2], ['a·b', 'fmath', 2],

  // ── Physics (9702) ─────────────────────────────────────────────────
  ['ε₀', 'physics', 3], ['μ₀', 'physics', 2], ['λ', 'physics', 3], ['ν', 'physics', 2],
  ['ω', 'physics', 3], ['α', 'physics', 2], ['β', 'physics', 2], ['γ', 'physics', 2],
  ['Ω', 'physics', 3], ['Φ', 'physics', 2], ['ρ', 'physics', 2], ['τ', 'physics', 2],
  ['ħ', 'physics', 2], ['E=mc²', 'physics', 3], ['F=ma', 'physics', 3],
  ['pV=nRT', 'physics', 2], ['½mv²', 'physics', 2], ['mgh', 'physics', 2],
  ['V=IR', 'physics', 3], ['GMm/r²', 'physics', 2], ['kQq/r²', 'physics', 1],
  ['hf', 'physics', 2], ['c', 'physics', 2], ['g', 'physics', 2], ['N', 'physics', 1],
  ['J', 'physics', 1], ['W', 'physics', 1], ['Hz', 'physics', 1], ['Pa', 'physics', 1],
  ['Wb', 'physics', 1], ['°C', 'physics', 1], ['Δp', 'physics', 2], ['Δx', 'physics', 1],
  ['B', 'physics', 1], ['⁶⁰Co', 'physics', 1], ['²³⁵U', 'physics', 1],
  ['α→', 'physics', 1], ['e⁻', 'physics', 2], ['ν̄', 'physics', 1], ['½t', 'physics', 1],

  // ── Chemistry (9701) ───────────────────────────────────────────────
  ['⇌', 'chem', 3], ['ΔH', 'chem', 3], ['ΔG', 'chem', 2], ['ΔS', 'chem', 2],
  ['Kc', 'chem', 2], ['Kp', 'chem', 2], ['Ka', 'chem', 2], ['Kw', 'chem', 2],
  ['pH', 'chem', 3], ['pKa', 'chem', 2], ['[H⁺]', 'chem', 2], ['mol', 'chem', 3],
  ['H₂O', 'chem', 3], ['CO₂', 'chem', 3], ['NH₃', 'chem', 2], ['CH₄', 'chem', 2],
  ['H₂SO₄', 'chem', 2], ['NaCl', 'chem', 2], ['O₂', 'chem', 2], ['N₂', 'chem', 1],
  ['C₆H₆', 'chem', 2], ['OH⁻', 'chem', 2], ['E°', 'chem', 2], ['ΔH꜀', 'chem', 1],
  ['Eₐ', 'chem', 2], ['→', 'chem', 2], ['°', 'chem', 1], ['sp³', 'chem', 1],
  ['δ⁺', 'chem', 2], ['δ⁻', 'chem', 2], ['Mᵣ', 'chem', 2], ['Aᵣ', 'chem', 1],
  ['cm³', 'chem', 1], ['dm³', 'chem', 1], ['kJ', 'chem', 1], ['Nₐ', 'chem', 2],

  // ── Biology (9700) ─────────────────────────────────────────────────
  ['DNA', 'bio', 3], ['RNA', 'bio', 2], ['ATP', 'bio', 3], ['ADP', 'bio', 2],
  ['mRNA', 'bio', 2], ['tRNA', 'bio', 1], ['NADH', 'bio', 2], ['CO₂', 'bio', 2],
  ['O₂', 'bio', 2], ['C₆H₁₂O₆', 'bio', 2], ['A–T', 'bio', 2], ['G–C', 'bio', 2],
  ['F₁', 'bio', 2], ['F₂', 'bio', 2], ['XX', 'bio', 2], ['XY', 'bio', 2],
  ['♂', 'bio', 1], ['♀', 'bio', 1], ['µm', 'bio', 2], ['nm', 'bio', 1],
  ['Ψ', 'bio', 2], ['Ψₛ', 'bio', 1], ['×400', 'bio', 1], ['3′', 'bio', 1],
  ['5′', 'bio', 1], ['n→2n', 'bio', 1], ['χ²', 'bio', 2],

  // ── Computer Science (9618) ────────────────────────────────────────
  ['0b1010', 'cs', 2], ['0xFF', 'cs', 2], ['&&', 'cs', 2], ['||', 'cs', 2],
  ['!=', 'cs', 2], ['==', 'cs', 2], ['<>', 'cs', 2], ['←', 'cs', 3],
  ['⊕', 'cs', 2], ['¬', 'cs', 2], ['∧', 'cs', 2], ['∨', 'cs', 2],
  ['{}', 'cs', 2], ['[]', 'cs', 2], ['//', 'cs', 1], ['λx', 'cs', 1],
  ['O(n)', 'cs', 3], ['O(1)', 'cs', 2], ['O(n²)', 'cs', 2], ['O(log n)', 'cs', 2],
  ['≫', 'cs', 1], ['≪', 'cs', 1], ['NULL', 'cs', 1], ['MOD', 'cs', 2],
  ['DIV', 'cs', 2], ['1010', 'cs', 2], ['SQL', 'cs', 1], ['TCP', 'cs', 1],
  ['&', 'cs', 1], ['%', 'cs', 1], ['2ⁿ', 'cs', 1], ['⌈n⌉', 'cs', 1],
];

/** Flattened by weight, so iconic glyphs surface more often than deep cuts. */
export const WEIGHTED_SYMBOLS = SYMBOLS.flatMap(([g, s, w]) =>
  Array.from({ length: w }, () => ({ glyph: g, subject: s }))
);

export const SYMBOL_COUNT = SYMBOLS.length;
