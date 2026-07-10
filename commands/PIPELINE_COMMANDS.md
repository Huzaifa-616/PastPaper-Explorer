# The Nexus — Pipeline Command Reference

Keep this in your project root. Everything below is run from
`C:\paper-explorer` (your project root) in PowerShell.

---

## The mental model (read once)

All these scripts run **on your computer**, read files from `public/`, and
produce two kinds of output:
- **JSON databases** (`topicals_db.json`, `library_db.json`, `answerKeys.generated.json`)
  → these are text, they get **committed to Git** and deployed with your app.
- **Uploads to R2** (papers, question slices, library files)
  → these go to the bucket, served free. They do **not** go in Git.

The `--upload-r2` flag is what pushes files to the bucket. Without it, scripts
only build the local JSON. All uploads are **incremental** — re-running only
sends new/changed files, so it's always safe and fast to re-run.

---

## ONE-TIME SETUP (only if on a fresh machine)

```
pip install PyMuPDF Pillow boto3 python-dotenv
```

Make sure `.env` exists in the project root with your R2 keys (already set up):
```
R2_ACCOUNT_ID=ce957d6ca27540393e681e26a8cac837
R2_ACCESS_KEY_ID=<your key>
R2_SECRET_ACCESS_KEY=<your secret>
R2_BUCKET=nexus-storage
R2_PUBLIC_URL=https://pub-263db9f5fa45478587e20aa3adda45c0.r2.dev
VITE_R2_PUBLIC_URL=https://pub-263db9f5fa45478587e20aa3adda45c0.r2.dev
```

---

## ADDING NEW PAST PAPERS  (the most common task)

1. Drop the new PDF files into `public\papers\`
   (correct names, e.g. `9702_s25_qp_12.pdf`, `9702_s25_ms_12.pdf`)

2. Upload the PDFs to R2:
```
python r2_upload.py ./public/papers papers
```

3. Extract MCQ answer keys (if you added Paper-1 mark schemes for Bio/Chem/Phys):
```
python generate_mcq_keys.py
```

4. Slice the questions into topical images AND upload them to R2:
```
python generate_topicals_v2.py --webp --upload-r2
```

5. Commit the updated JSON databases:
```
git add public/topicals_db.json src/config/answerKeys.generated.json
git commit -m "Add [season/year] papers"
git push
```

That's it. The new papers + their topical questions are live.

---

## ADDING NEW LIBRARY FILES  (textbooks / notes / formula sheets)

1. Drop the files into `public\library\` (subfolders per subject, e.g.
   `public\library\9618\somebook.pdf`)

2. Index them and upload to R2 in one command:
```
python generate_library.py --upload-r2
```

3. Commit the updated index:
```
git add public/library_db.json
git commit -m "Add library files"
git push
```

---

## CHANGING TOPICS OR KEYWORDS  (fixing misclassifications)

If students flag questions in the wrong topic, or you want to add keywords:

1. Edit **`syllabus_taxonomy.py`** only (the single source of truth).
   Never hand-edit `src/config/syllabus.js`.

2. Regenerate the frontend topic list so names stay matched:
```
python generate_syllabus_js.py
```

3. Re-slice with the updated keywords:
```
python generate_topicals_v2.py --webp --upload-r2
```

4. Commit:
```
git add public/topicals_db.json src/config/syllabus.js
git commit -m "Refine topic keywords"
git push
```

---

## FULL REBUILD FROM SCRATCH  (rare — e.g. after big changes)

Run in this order:
```
python generate_mcq_keys.py
python generate_syllabus_js.py
python generate_topicals_v2.py --webp --upload-r2
python generate_library.py --upload-r2
python r2_upload.py ./public/papers papers
```
Then commit all the JSON files and push.

---

## QUICK REFERENCE — every script at a glance

| Command | What it does | Uploads to R2? |
|---|---|---|
| `python r2_upload.py ./public/papers papers` | Push paper PDFs to bucket | Yes |
| `python generate_mcq_keys.py` | Extract MCQ answer keys from mark schemes | No (JSON only) |
| `python generate_topicals_v2.py --webp --upload-r2` | Slice + classify questions, upload images | Yes |
| `python generate_library.py --upload-r2` | Index + upload library files | Yes |
| `python generate_syllabus_js.py` | Sync frontend topic names to taxonomy | No (JS only) |

Drop `--upload-r2` from any command to build the local JSON without uploading
(useful for testing before you commit to pushing files).

---

## TROUBLESHOOTING

- **Script hangs / "Connection timed out"** → VPN or proxy interfering with the
  R2 connection. Disable it and retry.
- **"Auth failed"** → check the R2 keys in `.env`, or regenerate the API token
  (Object Read & Write, scoped to `nexus-storage`).
- **"No question anchors found" on a paper** → that PDF's layout differs from
  the standard; note the filename and it can be handled specially.
- **A topic shows "No data yet"** → either no questions matched (keyword gap,
  fixable in `syllabus_taxonomy.py`) or the topic name drifted (run
  `generate_syllabus_js.py`).
- **A file won't load in the browser** → check it actually uploaded (open the
  `pub-...r2.dev/...` URL directly); filenames are case-sensitive and must match.
- **Uploaded a file but it's not showing** → did you re-run the indexer
  (`generate_topicals_v2.py` or `generate_library.py`) and commit the JSON?
```
