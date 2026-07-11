# Phase 12 — Flag Loop + Growth Pack

Two things: (1) the flag button finally reaches YOU, (2) Google can find you.

═══════════════════════════════════════════
PART 1 — THE FLAG LOOP (correction engine)
═══════════════════════════════════════════

## The gap this closes
Until now, "wrong topic?" flags saved to the STUDENT's localStorage and died
there — you never saw them. Now they POST to a tiny API on your existing
Cloudflare deploy and land in KV storage you can review.

## Files
| File | Where | What |
|---|---|---|
| worker.js | project root | The API (POST /api/flag, GET /api/flags) |
| wrangler.jsonc | project root | Adds main + KV binding + /api/* routing |
| src/utils/flags.js | NEW | Frontend: fire-and-forget POST |
| src/components/TopicalsSidebar.jsx | replace | Sidebar flag → API |
| src/pages/TopicalsPage.jsx | replace | Full page gets a ⚑ on every question row (it had NONE before) |

## One-time setup (two commands)
```
wrangler kv namespace create FLAGS
```
→ it prints an id. Paste it into wrangler.jsonc where it says
PASTE_YOUR_KV_NAMESPACE_ID_HERE.
```
wrangler secret put FLAG_ADMIN_KEY
```
→ type a strong password. This is how YOU authenticate to read flags.

Then deploy as usual. Dev note: in `npm run dev` there's no worker, so flags
fail silently (by design) — test the API via `wrangler dev` or after deploy.

## Reviewing reports (your weekly 2 minutes)
```
curl -H "Authorization: Bearer YOUR_KEY" https://your-site/api/flags
```
Returns a summary sorted by how many students flagged the same question —
repeat offenders float to the top. Fix them in syllabus_taxonomy.py, re-run
the slicer, done. That's the correction engine, finally closed.

Safety: strict input validation (public endpoint), flags auto-expire after
6 months, admin endpoint requires the secret.

═══════════════════════════════════════════
PART 2 — GROWTH PACK (sitemap + SEO + analytics)
═══════════════════════════════════════════

## generate_sitemap.py (project root)
Builds public/sitemap.xml from your REAL content: every paper deep-link,
every subject page. Also adds the Sitemap: line to robots.txt.
```
python generate_sitemap.py
```
**SET YOUR DOMAIN FIRST**: either edit SITE_URL in the file or add
`SITE_URL=https://yourdomain.com` to .env. Add this command to your
paper-ingestion routine (after adding papers, regenerate).

Verified on real files: valid XML, correct deep-link URLs per paper.

## index.html
Now carries JSON-LD structured data (WebSite schema) — replace YOUR-DOMAIN-HERE
with your real domain. Helps Google understand and present the site.

## After deploying
1. Google Search Console (search.google.com/search-console): add your domain,
   submit /sitemap.xml. This is how "9702 s23 qp 12" searches start finding YOU.
2. Cloudflare dashboard → Web Analytics → enable for your site (free, no
   cookies, no code needed when your site is on Cloudflare). This is your
   night-walk at scale: see what students actually use.
