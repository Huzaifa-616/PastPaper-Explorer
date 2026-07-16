// ─── Performance Engine ───────────────────────────────────────────────────────
// Cross-references three data sources that already exist:
//   1. MCQ sessions   (localStorage 'nexusMcqSessions' — every bubbled answer)
//   2. Answer keys    (MCQ_ANSWER_KEYS — auto-extracted from mark schemes)
//   3. Topical map    (topicals_db — which topic each question belongs to)
// ...to produce per-topic accuracy, powering the "weakest topics" feature.

import { MCQ_ANSWER_KEYS } from '../config/answerKeys';

const SESSIONS_KEY = 'nexusMcqSessions';

// Session key '9702_s19_1_1'  →  paper filename '9702_s19_qp_11.pdf'
function sessionKeyToPaperId(key) {
  const p = key.split('_');
  if (p.length !== 4) return null;
  return `${p[0]}_${p[1]}_qp_${p[2]}${p[3]}.pdf`;
}

// Build { '<paper_id>|<questionNum>': topicName } for one subject's MCQ paper.
function buildQuestionTopicMap(topicalDb, subjectCode) {
  const map = {};
  const papers = topicalDb?.[subjectCode];
  if (!papers) return map;
  for (const pNum of Object.keys(papers)) {
    const topics = papers[pNum]?.topics || {};
    for (const [topic, entries] of Object.entries(topics)) {
      for (const e of entries) {
        if (e.paper_id && e.question != null) map[`${e.paper_id}|${e.question}`] = topic;
      }
    }
  }
  return map;
}

/**
 * Returns per-topic stats for a subject:
 *   [{ topic, attempted, correct, wrong, accuracy }]  sorted weakest-first.
 * Only counts questions that were answered AND have a known answer key AND
 * a known topic. minAttempts filters out topics with too little data to judge.
 */
export function computeTopicStats(topicalDb, subjectCode, { minAttempts = 2 } = {}) {
  let sessions = {};
  try { sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {}; } catch { /* none */ }

  const qTopic = buildQuestionTopicMap(topicalDb, subjectCode);
  if (Object.keys(qTopic).length === 0) return [];

  const stats = {}; // topic -> {attempted, correct}

  for (const [sessKey, sess] of Object.entries(sessions)) {
    if (!sessKey.startsWith(subjectCode + '_')) continue;
    const key = MCQ_ANSWER_KEYS[sessKey];
    const choices = sess?.choices;
    if (!key || !Array.isArray(choices)) continue;
    const paperId = sessionKeyToPaperId(sessKey);
    if (!paperId) continue;

    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const answer = key[i];
      if (!choice || !answer) continue;            // unanswered or withdrawn Q
      const topic = qTopic[`${paperId}|${i + 1}`];
      if (!topic) continue;                         // question not in topical map
      stats[topic] = stats[topic] || { attempted: 0, correct: 0 };
      stats[topic].attempted += 1;
      if (choice === answer) stats[topic].correct += 1;
    }
  }

  return Object.entries(stats)
    .map(([topic, s]) => ({
      topic,
      attempted: s.attempted,
      correct: s.correct,
      wrong: s.attempted - s.correct,
      accuracy: Math.round((s.correct / s.attempted) * 100),
    }))
    .filter(s => s.attempted >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted);
}

// Convenience: the N weakest topics that are genuinely weak (< 80% accuracy).
export function weakestTopics(topicalDb, subjectCode, n = 3) {
  return computeTopicStats(topicalDb, subjectCode)
    .filter(s => s.accuracy < 80)
    .slice(0, n);
}

// Overall attempt count for a subject — lets the UI know if there's any data.
export function totalAttempts(topicalDb, subjectCode) {
  return computeTopicStats(topicalDb, subjectCode, { minAttempts: 1 })
    .reduce((n, s) => n + s.attempted, 0);
}
