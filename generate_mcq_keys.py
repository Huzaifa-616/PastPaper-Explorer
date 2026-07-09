"""
The Nexus - MCQ Answer Key Extractor
=====================================
Scans ./public/papers for Paper 1 mark schemes (e.g. 9702_s23_ms_12.pdf),
extracts the answer grid, and writes src/config/answerKeys.generated.json
in the exact format the app consumes:

    { "9702_s23_1_2": ["A", "C", null, ...40 entries...] }

`null` marks withdrawn/unresolvable questions - same convention as the
hand-typed legacy keys. Generated keys override legacy keys in the app,
so re-running this after adding new mark schemes is all you ever do.

Usage:
    python generate_mcq_keys.py            # scan default ./public/papers
    python generate_mcq_keys.py /some/dir  # scan a custom directory

Requires: PyMuPDF  (pip install PyMuPDF)
"""

import fitz  # PyMuPDF
import os
import re
import sys
import json

PAPERS_DIR   = sys.argv[1] if len(sys.argv) > 1 else "./public/papers"
OUTPUT_JSON  = "./src/config/answerKeys.generated.json"
from syllabus_taxonomy import MCQ_SUBJECTS
MCQ_PAPER    = "1"
MCQ_COUNT    = 40

# Filename convention: 9702_s23_ms_12.pdf
FILENAME_RE = re.compile(r"^(\d{4})_([mws]\d{2})_ms_(\d)(\d)\.pdf$", re.I)

# Modern (2016+) mark scheme rows extract as:  "17 \nC \n1"
MODERN_ROW_RE = re.compile(
    r"(?<![\d.])(\d{1,2})\s*\n\s*([A-D])(?:\s*(?:/|or)\s*([A-D]))?\s*\n\s*1\b"
)

# Legacy (pre-2016) grid pairs: "17 C" on their own line, possibly
# several pairs per line ("1 A 21 B").
LEGACY_PAIR_RE = re.compile(r"(?<![\d.])(\d{1,2})\s+([A-D])(?![\w])")


def extract_answers(doc):
    """Returns ({qnum: letter}, method, warnings) for one mark scheme PDF."""
    answers, warnings = {}, []

    # ── Pass 1: modern table format ──
    for page in doc:
        text = page.get_text("text")
        # Only trust pages that carry the answer-grid header - this keeps
        # regex noise from the cover page / guidance text out.
        if not ("Question" in text and "Answer" in text and "Marks" in text):
            continue
        for m in MODERN_ROW_RE.finditer(text):
            q, letter, alt = int(m.group(1)), m.group(2), m.group(3)
            if not (1 <= q <= MCQ_COUNT):
                continue
            if alt:
                warnings.append(f"Q{q}: multiple accepted answers ({letter}/{alt}), stored {letter}")
            if q in answers and answers[q] != letter:
                warnings.append(f"Q{q}: conflicting answers {answers[q]} vs {letter}, kept first")
                continue
            answers[q] = letter

    if len(answers) >= MCQ_COUNT * 0.75:
        return answers, "modern", warnings

    # ── Pass 2: legacy grid fallback ──
    answers, warnings = {}, []
    for page in doc:
        text = page.get_text("text")
        if "Mark Scheme" not in text and "MARK SCHEME" not in text:
            continue
        for m in LEGACY_PAIR_RE.finditer(text):
            q, letter = int(m.group(1)), m.group(2)
            if 1 <= q <= MCQ_COUNT and q not in answers:
                answers[q] = letter

    return answers, "legacy", warnings


def build_key_array(answers):
    """40-slot array, null where the MS gave nothing (withdrawn question)."""
    return [answers.get(q) for q in range(1, MCQ_COUNT + 1)]


def main():
    if not os.path.isdir(PAPERS_DIR):
        print(f"Error: directory {PAPERS_DIR} not found.")
        sys.exit(1)

    # Merge into any previously generated file - re-runs are incremental.
    database = {}
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON) as f:
                database = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    processed = skipped = 0

    for filename in sorted(os.listdir(PAPERS_DIR)):
        m = FILENAME_RE.match(filename)
        if not m:
            continue
        subject, season_year, paper, variant = m.groups()
        if subject not in MCQ_SUBJECTS or paper != MCQ_PAPER:
            continue

        key = f"{subject}_{season_year}_{paper}_{variant}"
        filepath = os.path.join(PAPERS_DIR, filename)

        try:
            doc = fitz.open(filepath)
        except Exception as e:
            print(f"  SKIP {filename}: cannot open ({e})")
            skipped += 1
            continue

        answers, method, warnings = extract_answers(doc)
        doc.close()

        found = len(answers)
        if found == 0:
            print(f"  SKIP {filename}: no answer grid detected")
            skipped += 1
            continue

        database[key] = build_key_array(answers)
        gaps = MCQ_COUNT - found
        status = f"OK  {key}  ({found}/{MCQ_COUNT} answers, {method} format)"
        if gaps:
            status += f"  [{gaps} missing -> null]"
        print(status)
        for w in warnings:
            print(f"      note: {w}")
        processed += 1

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(database, f, indent=1)

    print(f"\nDone. {processed} mark schemes extracted, {skipped} skipped.")
    print(f"Total keys in database: {len(database)}")
    print(f"Written to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
