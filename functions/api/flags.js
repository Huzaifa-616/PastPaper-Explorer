/**
 * GET /api/flags — YOU review reports. Requires:
 *   - KV binding FLAGS (same as flag.js)
 *   - env var FLAG_ADMIN_KEY (Pages → Settings → Environment variables, encrypted)
 * Call:  curl -H "Authorization: Bearer <key>" https://thenexustools.com/api/flags
 */
const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 1), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = request.headers.get('Authorization') || '';
  if (!env.FLAG_ADMIN_KEY || auth !== `Bearer ${env.FLAG_ADMIN_KEY}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  const list = await env.FLAGS.list({ prefix: 'flag:', limit: 1000 });
  const flags = (await Promise.all(
    list.keys.map(async k => { try { return JSON.parse(await env.FLAGS.get(k.name)); } catch { return null; } })
  )).filter(Boolean);

  const counts = {};
  for (const f of flags) {
    const id = `${f.paperId} Q${f.question} [${f.topic}]`;
    counts[id] = (counts[id] || 0) + 1;
  }
  const summary = Object.entries(counts)
    .map(([report, times]) => ({ report, times }))
    .sort((a, b) => b.times - a.times);

  return json({ total: flags.length, summary, raw: flags });
}
