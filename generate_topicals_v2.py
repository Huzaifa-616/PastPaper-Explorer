"""
The Nexus - Topical Engine v2: Question Slicing + Scored Classification
========================================================================
Upgrades generate_topicals.py from page-level keyword tagging to true
question-level extraction:

  1. ANCHOR DETECTION - finds each question's start by geometry: CAIE
     question numbers are bold, sit in their own left column (x < 62pt),
     and are validated by sequence tracking (1, 2, 3...) so stray numbers
     on data/formula pages can't produce false anchors.
  2. SLICING - renders each question region (across page breaks if needed)
     to a crisp PNG in /public/topicals/<paper>/q<N>.png
  3. SCORED CLASSIFICATION - matches syllabus keywords against the text of
     THAT QUESTION ONLY (not the whole page). Multi-word keywords score 2,
     single words score 1. The best-scoring topic wins; the score is stored
     as a confidence value so the UI can de-prioritize weak matches.

Output (backward compatible with the existing app):
  public/topicals_db.json  - same shape as before; entries are now
                             per-question and carry "img" + "score".

Reuses the SYLLABUS dict from your existing generate_topicals.py -
keep both files in the project root.

Usage:
    python generate_topicals_v2.py                 # papers in ./public/papers
    python generate_topicals_v2.py <papers_dir> <public_dir>

Requires: PyMuPDF, Pillow   (pip install PyMuPDF Pillow)
"""

import fitz  # PyMuPDF
import os
import re
import sys
import json
import io

from PIL import Image

# Reuse the single source of truth for topics/keywords
from syllabus_taxonomy import SYLLABUS

USE_WEBP = "--webp" in sys.argv
UPLOAD_R2 = "--upload-r2" in sys.argv
_args = [a for a in sys.argv[1:] if not a.startswith("--")]
PAPERS_DIR = _args[0] if len(_args) > 0 else "./public/papers"
PUBLIC_DIR = _args[1] if len(_args) > 1 else "./public"
IMG_EXT = "webp" if USE_WEBP else "png"
IMG_DIR    = os.path.join(PUBLIC_DIR, "topicals")
OUTPUT_JSON = os.path.join(PUBLIC_DIR, "topicals_db.json")

ZOOM = 2.0            # render scale (2.0 ~= 144 dpi, crisp on retina)
ANCHOR_X_MAX = 62     # question numbers live left of this x-coordinate
FOOTER_PAT = re.compile(r"©\s*UCLES|\[Turn over|Permission to reproduce", re.I)
FILENAME_RE = re.compile(r"^(\d{4})_([mws]\d{2})_qp_(\d)(\d)\.pdf$", re.I)

MIN_SCORE = 1         # questions scoring below this stay unclassified


# ─── Anchor detection ─────────────────────────────────────────────────────────

ANCHOR_X_MIN = 40     # cover-page barcode digits sit at x~20; real anchors at x~49
ANCHOR_SIZE_MIN = 9.5  # question numbers are body-size or larger

def find_anchors(doc):
    """
    Returns ordered [(page_index, y, qnum)] using geometry + sequence.

    Robust to subsetted font names (newer CAIE PDFs embed fonts as
    'AllAndNone' etc., so the literal 'Bold' string is unavailable). We
    therefore key on position + size + strict sequence validation rather
    than the font name:
      - digit token in the left question column (ANCHOR_X_MIN..ANCHOR_X_MAX)
      - font size at least body size (excludes tiny sub-labels)
      - the number must be the next one in sequence (1, 2, 3, ...),
        which rejects stray page/formula/barcode digits.
    """
    candidates = []  # (page, y, x, num)
    for pnum in range(len(doc)):
        d = doc[pnum].get_text("dict")
        for block in d.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    t = span["text"].strip()
                    # .isdigit() accepts superscripts (²³) that int() rejects;
                    # restrict to plain ASCII digits.
                    if not t.isascii() or not t.isdigit() or len(t) > 2:
                        continue
                    x0, y0 = span["bbox"][0], span["bbox"][1]
                    if ANCHOR_X_MIN <= x0 < ANCHOR_X_MAX and span.get("size", 0) >= ANCHOR_SIZE_MIN:
                        candidates.append((pnum, y0, x0, int(t)))

    candidates.sort()
    anchors, expected = [], 1
    for pnum, y, x, num in candidates:
        if num == expected:
            anchors.append((pnum, y, num))
            expected += 1
    return anchors


def content_bottom(page):
    """Y-coordinate where real content ends (above the © UCLES footer)."""
    best = page.rect.height - 30
    for block in page.get_text("dict").get("blocks", []):
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"])
            if FOOTER_PAT.search(text):
                y = line["bbox"][1]
                if y > page.rect.height * 0.6:
                    best = min(best, y - 4)
    return best


# ─── Region building & rendering ──────────────────────────────────────────────

def build_regions(doc, anchors):
    """For each question: list of (page_index, fitz.Rect) segments."""
    regions = []
    for i, (pnum, y, qnum) in enumerate(anchors):
        nxt = anchors[i + 1] if i + 1 < len(anchors) else None
        segs = []
        top = max(y - 6, 0)
        if nxt and nxt[0] == pnum:
            segs.append((pnum, fitz.Rect(0, top, doc[pnum].rect.width, nxt[1] - 4)))
        else:
            segs.append((pnum, fitz.Rect(0, top, doc[pnum].rect.width, content_bottom(doc[pnum]))))
            # question continues on following pages until the next anchor
            end_page = nxt[0] if nxt else len(doc)
            for p in range(pnum + 1, end_page):
                page = doc[p]
                bottom = content_bottom(page)
                if nxt and p == nxt[0] - 0:  # unreachable; kept for clarity
                    pass
                if bottom > 60:  # skip effectively blank pages
                    segs.append((p, fitz.Rect(0, 50, page.rect.width, bottom)))
            if nxt and nxt[1] > 70:
                # next question starts partway down its page: include the
                # top portion of that page as the tail of this question
                page = doc[nxt[0]]
                segs.append((nxt[0], fitz.Rect(0, 50, page.rect.width, nxt[1] - 4)))
        # drop degenerate segments
        segs = [(p, r) for p, r in segs if r.height > 12]
        regions.append((qnum, pnum, segs))
    return regions


def render_question(doc, segs, out_path):
    mat = fitz.Matrix(ZOOM, ZOOM)
    images = []
    for pnum, rect in segs:
        pix = doc[pnum].get_pixmap(matrix=mat, clip=rect)
        images.append(Image.open(io.BytesIO(pix.tobytes("png"))))
    if not images:
        return False
    if len(images) == 1:
        img = images[0].convert("RGB") if USE_WEBP else images[0]
        img.save(out_path, **({"quality": 85} if USE_WEBP else {"optimize": True}))
    else:
        w = max(im.width for im in images)
        h = sum(im.height for im in images)
        canvas = Image.new("RGB", (w, h), "white")
        y = 0
        for im in images:
            canvas.paste(im, (0, y))
            y += im.height
        canvas.save(out_path, **({"quality": 85} if USE_WEBP else {"optimize": True}))
    return True


# ─── Classification ───────────────────────────────────────────────────────────

def classify(text, keywords_map):
    """Best topic by weighted keyword score. Multi-word keyword = 2 pts."""
    text = text.lower()
    best_topic, best_score = None, 0
    for topic, keywords in keywords_map.items():
        score = 0
        for kw in keywords:
            if kw in text:
                score += 2 if (" " in kw or "-" in kw) else 1
        if score > best_score:
            best_topic, best_score = topic, score
    return best_topic, best_score


def question_text(doc, segs):
    return " ".join(doc[p].get_text("text", clip=r) for p, r in segs)


# ─── Main ─────────────────────────────────────────────────────────────────────

def build():
    if not os.path.isdir(PAPERS_DIR):
        print(f"Error: {PAPERS_DIR} not found.")
        sys.exit(1)
    os.makedirs(IMG_DIR, exist_ok=True)

    # fresh database, same outer shape as v1
    database = {
        subj: {p: {"topics": {t: [] for t in cfg["topics"]}}
               for p, cfg in papers.items()}
        for subj, papers in ((s, v) for s, v in SYLLABUS.items())
    }
    # note: SYLLABUS values are {paper: {"title":..., "topics": {...}}}
    database = {}
    for subj, papers in SYLLABUS.items():
        database[subj] = {}
        for p, cfg in papers.items():
            database[subj][p] = {"topics": {t: [] for t in cfg["topics"]}}

    stats = {"papers": 0, "questions": 0, "classified": 0}

    for filename in sorted(os.listdir(PAPERS_DIR)):
        m = FILENAME_RE.match(filename)
        if not m:
            continue
        subject, season_year, paper_num, variant_num = m.groups()
        if subject not in SYLLABUS or paper_num not in SYLLABUS[subject]:
            continue
        variant = paper_num + variant_num
        keywords_map = SYLLABUS[subject][paper_num]["topics"]

        try:
            doc = fitz.open(os.path.join(PAPERS_DIR, filename))
        except Exception as e:
            print(f"SKIP {filename}: {e}")
            continue

        anchors = find_anchors(doc)
        if not anchors:
            print(f"SKIP {filename}: no question anchors found")
            doc.close()
            continue

        base = filename[:-4]
        paper_img_dir = os.path.join(IMG_DIR, base)
        os.makedirs(paper_img_dir, exist_ok=True)

        regions = build_regions(doc, anchors)
        classified = 0
        for qnum, start_page, segs in regions:
            img_rel = f"/topicals/{base}/q{qnum}.{IMG_EXT}"
            ok = render_question(doc, segs, os.path.join(PUBLIC_DIR, img_rel.lstrip("/")))
            text = question_text(doc, segs)
            topic, score = classify(text, keywords_map)

            if topic and score >= MIN_SCORE and ok:
                database[subject][paper_num]["topics"][topic].append({
                    "paper_id": filename,
                    "season_year": season_year,
                    "variant": variant,
                    "page_number": start_page + 1,
                    "questions": [str(qnum)],   # v1 UI compatibility
                    "question": qnum,
                    "img": img_rel,
                    "score": score,
                    # trimmed text enables the optional LLM re-classification
                    # pass (generate_llm_topics.py) to fix low-score guesses.
                    "text": " ".join(text.split())[:1200],
                })
                classified += 1

        stats["papers"] += 1
        stats["questions"] += len(regions)
        stats["classified"] += classified
        print(f"OK  {filename}: {len(regions)} questions sliced, {classified} classified")
        doc.close()

    # prune empty topics, matching v1 behavior
    for subj in list(database):
        for p in list(database[subj]):
            topics = database[subj][p]["topics"]
            database[subj][p]["topics"] = {k: v for k, v in topics.items() if v}
        database[subj] = {p: v for p, v in database[subj].items() if v["topics"]}
    database = {s: v for s, v in database.items() if v}

    # Write TWO files:
    #   topicals_db.json      - slim, app-facing (no bulky question text)
    #   topicals_db.full.json - includes text, consumed by the LLM pass
    with open(OUTPUT_JSON.replace(".json", ".full.json"), "w") as f:
        json.dump(database, f, indent=1)

    slim = json.loads(json.dumps(database))
    for subj in slim:
        for p in slim[subj]:
            for entries in slim[subj][p]["topics"].values():
                for e in entries:
                    e.pop("text", None)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(slim, f, indent=1)

    print(f"\nDone. {stats['papers']} papers, {stats['questions']} questions sliced, "
          f"{stats['classified']} classified ({stats['classified']*100//max(stats['questions'],1)}%).")
    print(f"Images in {IMG_DIR}/, database at {OUTPUT_JSON}")

    if UPLOAD_R2:
        print("\nUploading slices to R2...")
        try:
            from r2_upload import upload_folder
            upload_folder(IMG_DIR, "topicals")
        except SystemExit:
            print("R2 upload skipped (see message above).")
        except Exception as e:
            print(f"R2 upload error: {e}")


if __name__ == "__main__":
    build()
