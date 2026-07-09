# Phase 5 — Real Syllabus Taxonomy (all 6 subjects)

## What changed
Your old keyword lists lived inside generate_topicals.py, covered only
9618/9701/9702, and were written from memory. I rebuilt the entire taxonomy
by extracting the topic structure directly from the SEVEN official CAIE
syllabus PDFs you uploaded, into one shared module: `syllabus_taxonomy.py`.

**Coverage now: 189 topics, 1,784 keywords, across all 6 subjects / 21 papers.**

| Subject | Papers mapped | Topics |
|---|---|---|
| 9702 Physics | 1,2,4,5 | 11 AS + 14 A2 |
| 9701 Chemistry | 1,2,4,5 | 19 AS + 12 A2 |
| 9700 Biology | 1,2,4,5 | 11 AS + 8 A2 |
| 9618 Computer Science | 1,2,3,4 | 12 AS + 8 A2 |
| 9709 Mathematics | 1,2,3,4,5,6 | 33 across components |
| 9231 Further Maths | 1,2,3,4 | 24 across components |

Practical papers (Phys/Chem/Bio P3) are intentionally not mapped — they
test lab skills, not topical content.

## Verified on real papers
Re-ran the slicer on genuine CAIE Physics papers with the new taxonomy:
**classification rose from 93% → 97%.** All 11 AS Physics topics populate
correctly, questions land in the right topic in sequence. (Sample output
in the phase-4 notes.)

## Files (all go in project root)
- `syllabus_taxonomy.py` — THE single source of truth. Both pipeline
  scripts now import `SYLLABUS` and `MCQ_SUBJECTS` from here.
- `generate_topicals_v2.py` — updated import line (was `from generate_topicals`).
- `generate_mcq_keys.py` — updated import line.

You can retire the SYLLABUS dict inside your old generate_topicals.py; the
new module supersedes it. Keep the old file only if v1 still runs anywhere.

## The honest limitation: Mathematics
9709 and 9231 keywords are a best-effort fallback and will misclassify
often — a question shows an integral, it never writes "integration." These
two subjects are flagged in `LLM_REQUIRED_SUBJECTS`. The real fix is the
LLM classification pass (next phase): each sliced question's text goes to
the Claude API once, offline, "which syllabus topic?", cached forever.
That pass also cleans up low-confidence (score-1) stragglers in the
science subjects.

## Run
```
pip install PyMuPDF Pillow
python generate_mcq_keys.py
python generate_topicals_v2.py --webp
```

## To adjust a topic or add keywords
Edit `syllabus_taxonomy.py` only — never the scripts. Both pick up changes
on next run. If you spot a question landing in the wrong topic during real
use, add the distinguishing term to that topic's keyword list.
