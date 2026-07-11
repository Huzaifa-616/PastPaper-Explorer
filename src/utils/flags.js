// ─── Flag reporting ──────────────────────────────────────────────────────────
// Sends a "wrong topic" report to the API Worker. Fire-and-forget:
// localStorage remains the local "already flagged" marker; the POST gets the
// report to YOU. In dev (no worker running) the fetch fails silently — the
// student experience is identical either way.

export function sendFlag(paperId, question, topic) {
  try {
    fetch('/api/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId, question, topic }),
      keepalive: true, // survives navigation
    }).catch(() => { /* offline or dev — the local marker still shows "reported" */ });
  } catch { /* ignore */ }
}
