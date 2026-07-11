"""
The Nexus - Sitemap Generator
==============================
Generates public/sitemap.xml from your actual content:
  - the site root and section pages
  - one URL per paper deep-link (/papers/9702/s23/qp/12) from ./public/papers
  - one URL per subject topical/library page

Run as part of your paper-ingestion routine (see PIPELINE_COMMANDS.md):
    python generate_sitemap.py

Set your real domain ONCE below (or via SITE_URL in .env).
Also ensures robots.txt references the sitemap.
"""

import os
import re
from datetime import date

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── CONFIG ────────────────────────────────────────────────────────────────────
SITE_URL = os.environ.get("SITE_URL", "https://YOUR-DOMAIN-HERE.com").rstrip("/")
PAPERS_DIR = "./public/papers"
OUT = "./public/sitemap.xml"
ROBOTS = "./public/robots.txt"

FILENAME_RE = re.compile(r"^(\d{4})_([mws]\d{2})_(qp|ms)_(\d)(\d)\.pdf$", re.I)
SUBJECTS = ["9618", "9702", "9701", "9700", "9709", "9231"]

def main():
    if "YOUR-DOMAIN-HERE" in SITE_URL:
        print("WARNING: set your real domain — edit SITE_URL in this file or add")
        print('         SITE_URL=https://yourdomain.com  to your .env')

    today = date.today().isoformat()
    urls = []

    def add(path, priority="0.6", changefreq="monthly"):
        urls.append(
            f"  <url><loc>{SITE_URL}{path}</loc>"
            f"<lastmod>{today}</lastmod>"
            f"<changefreq>{changefreq}</changefreq>"
            f"<priority>{priority}</priority></url>"
        )

    # core pages
    add("/", "1.0", "weekly")
    add("/papers", "0.9", "weekly")
    add("/topicals", "0.9", "weekly")
    add("/library", "0.8", "weekly")
    for s in SUBJECTS:
        add(f"/topicals/{s}", "0.8")
        add(f"/library/{s}", "0.7")

    # one URL per question paper (QP only — the MS is reachable from the QP view)
    count = 0
    if os.path.isdir(PAPERS_DIR):
        for f in sorted(os.listdir(PAPERS_DIR)):
            m = FILENAME_RE.match(f)
            if not m or m.group(3).lower() != "qp":
                continue
            subj, session, _t, paper, variant = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
            add(f"/papers/{subj}/{session}/qp/{paper}{variant}", "0.7")
            count += 1

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    with open(OUT, "w") as f:
        f.write(xml)
    print(f"sitemap.xml written: {len(urls)} URLs ({count} papers)")

    # ensure robots.txt points at it
    line = f"Sitemap: {SITE_URL}/sitemap.xml"
    robots = ""
    if os.path.exists(ROBOTS):
        robots = open(ROBOTS).read()
    if "Sitemap:" not in robots:
        with open(ROBOTS, "a") as f:
            f.write(("\n" if robots and not robots.endswith("\n") else "") + line + "\n")
        print("robots.txt: sitemap line added")
    else:
        print("robots.txt: sitemap line already present")

if __name__ == "__main__":
    main()
