/**
 * Real CAIE paper codes — the "paper wall" backdrop vocabulary.
 * Students think in these: "I was doing 9702/12". Rendering the actual codes
 * says "we have everything" without a counter shouting a number at anyone.
 */
const SUBJECTS = [
  ['9618', 'cs',      ['11','12','13','21','22','23','31','32','33','41','42','43']],
  ['9702', 'physics', ['11','12','13','21','22','23','31','32','33','41','42','43','51','52','53']],
  ['9701', 'chem',    ['11','12','13','21','22','23','31','32','33','41','42','43','51','52','53']],
  ['9700', 'bio',     ['11','12','13','21','22','23','31','32','33','41','42','43','51','52','53']],
  ['9709', 'math',    ['11','12','13','21','22','23','31','32','33','41','42','43','51','52','53','61','62','63']],
  ['9231', 'fmath',   ['11','12','13','21','22','23','31','32','33','41','42','43']],
];

export const PAPER_CODES = SUBJECTS.flatMap(([code, subject, variants]) =>
  variants.map(v => ({ glyph: `${code}/${v}`, subject }))
);
