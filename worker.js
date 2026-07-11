/**
 * The Nexus — API Worker
 * ======================
 * Runs in front of the static site (wrangler assets). Handles:
 *
 *   POST /api/flag    — students report a misclassified question
 *                       body: { paperId, question, topic }
 *   GET  /api/flags   — YOU review all reports (requires admin key)
 *                       header:  Authorization: Bearer <FLAG_ADMIN_KEY>
 *
 * Storage: Cloudflare KV (binding: FLAGS). Free tier is far beyond what
 * flag volume will ever need.
 *
 * Setup (one time):
 *   1. wrangler kv namespace create FLAGS
 *      → paste the printed id into wrangler.jsonc kv_namespaces
 *   2. wrangler secret put FLAG_ADMIN_KEY
 *      → type a strong password (this is how you authenticate to read flags)
 */

const PAPER_ID_RE = /^\d{4}_[mws]\d{2}_qp_\d{2}\.pdf$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Student reports a wrong-topic flag ──────────────────────────────
    if (url.pathname === '/api/flag' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

      const { paperId, question, topic } = body || {};
      // strict validation — this is a public endpoint
      if (typeof paperId !== 'string' || !PAPER_ID_RE.test(paperId)) return json({ error: 'bad paperId' }, 400);
      const q = Number(question);
      if (!Number.isInteger(q) || q < 1 || q > 60) return json({ error: 'bad question' }, 400);
      if (typeof topic !== 'string' || topic.length < 2 || topic.length > 80) return json({ error: 'bad topic' }, 400);

      const key = `flag:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
      await env.FLAGS.put(key, JSON.stringify({
        paperId, question: q, topic,
        at: new Date().toISOString(),
      }), { expirationTtl: 60 * 60 * 24 * 180 }); // auto-expire after 6 months

      return json({ ok: true });
    }

    // ── You review the reports ──────────────────────────────────────────
    if (url.pathname === '/api/flags' && request.method === 'GET') {
      const auth = request.headers.get('Authorization') || '';
      if (!env.FLAG_ADMIN_KEY || auth !== `Bearer ${env.FLAG_ADMIN_KEY}`) {
        return json({ error: 'unauthorized' }, 401);
      }
      const list = await env.FLAGS.list({ prefix: 'flag:', limit: 1000 });
      const flags = await Promise.all(
        list.keys.map(async k => {
          try { return JSON.parse(await env.FLAGS.get(k.name)); } catch { return null; }
        })
      );
      // aggregate: same paper+question flagged by multiple people floats up
      const counts = {};
      for (const f of flags) {
        if (!f) continue;
        const id = `${f.paperId} Q${f.question} [${f.topic}]`;
        counts[id] = (counts[id] || 0) + 1;
      }
      const summary = Object.entries(counts)
        .map(([k, n]) => ({ report: k, times: n }))
        .sort((a, b) => b.times - a.times);

      return json({ total: flags.filter(Boolean).length, summary, raw: flags.filter(Boolean) });
    }

    // ── Everything else → the static site ───────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
