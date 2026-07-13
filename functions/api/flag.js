/**
 * POST /api/flag — students report a misclassified question.
 * Cloudflare Pages Function. Requires a KV binding named FLAGS
 * (Pages project → Settings → Bindings → KV namespace).
 */
const PAPER_ID_RE = /^\d{4}_[mws]\d{2}_qp_\d{2}\.pdf$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  const { paperId, question, topic } = body || {};
  if (typeof paperId !== 'string' || !PAPER_ID_RE.test(paperId)) return json({ error: 'bad paperId' }, 400);
  const q = Number(question);
  if (!Number.isInteger(q) || q < 1 || q > 60) return json({ error: 'bad question' }, 400);
  if (typeof topic !== 'string' || topic.length < 2 || topic.length > 80) return json({ error: 'bad topic' }, 400);

  const key = `flag:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
  await env.FLAGS.put(key, JSON.stringify({
    paperId, question: q, topic, at: new Date().toISOString(),
  }), { expirationTtl: 60 * 60 * 24 * 180 });

  return json({ ok: true });
}
