
/* ═══════════════════════════════════════════════════════════════════════════
   studentSnapshot — everything the hub needs to greet a returning student.
   ═══════════════════════════════════════════════════════════════════════════
   All of this was ALREADY being recorded; nothing on the front door ever read
   it. No backend, no accounts — it's their own device telling them about
   themselves.
   ═══════════════════════════════════════════════════════════════════════════ */
export function studentSnapshot(topicalDb) {
  let sessions = {};
  try { sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {}; } catch { /* none */ }

  const keys = Object.keys(sessions);
  if (keys.length === 0) return { hasHistory: false };

  /* Recent papers. Object key order is insertion order for string keys, so the
     last key added is the most recently started paper. Not a timestamp, but
     honest — and it costs nothing. */
  const recent = keys.slice(-4).reverse().map((k) => {
    const [subject, session, paper, variant] = k.split('_');
    const choices = sessions[k]?.choices || [];
    const answered = choices.filter(Boolean).length;
    return {
      key: k, subject, session, paper, variant,
      answered,
      total: choices.length || 40,
      href: `/papers/${subject}/${session}/qp/${paper}${variant}`,
    };
  }).filter(r => r.subject && r.answered > 0);

  /* Weakest topics ACROSS every subject they've touched. Subjects are derived
     from the session keys themselves, so this needs no config to stay in sync. */
  const subjects = [...new Set(keys.map(k => k.split('_')[0]))];
  const weakest = subjects
    .flatMap(s => computeTopicStats(topicalDb, s).map(t => ({ ...t, subject: s })))
    .filter(t => t.accuracy < 80)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted)
    .slice(0, 3);

  /* Overall totals, for the one honest line of encouragement. */
  let answered = 0, correct = 0;
  for (const [k, sess] of Object.entries(sessions)) {
    const key = MCQ_ANSWER_KEYS[k];
    const choices = sess?.choices;
    if (!Array.isArray(choices)) continue;
    for (let i = 0; i < choices.length; i++) {
      if (!choices[i]) continue;
      answered += 1;
      if (key && choices[i] === key[i]) correct += 1;
    }
  }

  return {
    hasHistory: recent.length > 0,
    recent,
    weakest,
    answered,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
  };
}
