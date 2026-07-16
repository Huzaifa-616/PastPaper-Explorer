"""
The Nexus — Source File Indexer (9618 Paper 4)
==============================================
CAIE ships Paper 4 with source files: Blue.txt, TheData.txt, QueueData.txt...
The question is meaningless without them ("the file Blue.txt contains...").
Their own naming already treats sf as a TYPE, exactly like qp and ms:

    9618_s25_qp_42.pdf     the paper
    9618_s25_ms_42.pdf     the mark scheme
    9618_s25_sf_42/        the source files      <- a FOLDER, not a file

That folder-not-file difference is the only reason sf can't just ride the
existing QP/MS toggle, so this builds an index the UI can read.

EXPECTED LAYOUT
---------------
    public/sf/9618_s25_sf_42/Blue.txt
    public/sf/9618_s25_sf_42/TheData.txt
    public/sf/9618_w24_sf_41/Data.txt

Folder name must be:  {subject}_{season}{yy}_sf_{paper}{variant}
(Older folders named 9618_w24_sf41 — no underscore before the variant — are
still recognised and normalised.)

USAGE
    python generate_sf.py
    python generate_sf.py --upload-r2

OUTPUT  public/sf_db.json
    {
      "9618_s25_sf_42": {
        "subject": "9618", "session": "s25", "paper": "4", "variant": "2",
        "files": [ { "name": "Blue.txt", "path": "/sf/9618_s25_sf_42/Blue.txt",
                     "size": "1.2 KB", "lines": 40 } ]
      }
    }
"""

import os
import re
import json
import sys

SF_DIR = "./public/sf"
OUTPUT = "./public/sf_db.json"
UPLOAD_R2 = "--upload-r2" in sys.argv

# 9618_s25_sf_42  or the older 9618_w24_sf41
FOLDER_RE = re.compile(r"^(\d{4})_([smw]\d{2})_sf_?(\d)(\d)$", re.I)

IGNORED = {'.ds_store', 'thumbs.db', 'desktop.ini', '.gitkeep'}

# CAIE ships more than .txt with Paper 4 — evidence.doc is in every folder.
# A .doc is BINARY: fetching it as text renders garbage, so the viewer needs
# to know which files it can actually show and which are download-only.
TEXT_EXTS = {'.txt', '.csv', '.dat', '.json', '.md', '.log', '.tsv'}


def human(n):
    if n < 1024:
        return f"{n} B"
    if n < 1024 * 1024:
        return f"{round(n / 1024, 1)} KB"
    return f"{round(n / (1024 * 1024), 2)} MB"


def index():
    if not os.path.isdir(SF_DIR):
        os.makedirs(SF_DIR, exist_ok=True)
        print(f"Created {SF_DIR}")
        print("\nPut the source files in, one folder per paper:")
        print("    public/sf/9618_s25_sf_42/Blue.txt")
        print("    public/sf/9618_s25_sf_42/TheData.txt")
        print("    public/sf/9618_w24_sf_41/Data.txt")
        return {}

    db = {}
    skipped = []

    for folder in sorted(os.listdir(SF_DIR)):
        path = os.path.join(SF_DIR, folder)
        if not os.path.isdir(path):
            continue

        m = FOLDER_RE.match(folder)
        if not m:
            skipped.append(folder)
            continue

        subject, session, paper, variant = m.groups()
        # normalise the key, so 9618_w24_sf41 and 9618_w24_sf_41 agree
        key = f"{subject}_{session.lower()}_sf_{paper}{variant}"

        files = []
        for name in sorted(os.listdir(path)):
            if name.lower() in IGNORED or name.startswith('.'):
                continue
            fp = os.path.join(path, name)
            if not os.path.isfile(fp):
                continue

            ext = os.path.splitext(name.lower())[1]
            is_text = ext in TEXT_EXTS

            lines = None
            if is_text:                # line count only means something for text
                try:
                    with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                        lines = sum(1 for _ in f)
                except OSError:
                    pass

            files.append({
                "name": name,
                "path": f"/sf/{folder}/{name}",   # the real folder, for the URL
                "size": human(os.path.getsize(fp)),
                "lines": lines,
                "text": is_text,       # False -> download only (e.g. evidence.doc)
            })

        if files:
            db[key] = {
                "subject": subject,
                "session": session.lower(),
                "paper": paper,
                "variant": variant,
                "folder": folder,
                "files": files,
            }

    if skipped:
        print("Skipped — folder names don't match {subject}_{season}{yy}_sf_{paper}{variant}:")
        for s in skipped:
            print("   " + s)
        print()

    return db


def main():
    print("Indexing Paper 4 source files...\n")
    db = index()

    if not db:
        print("Nothing indexed.")
        return

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)

    total = sum(len(v["files"]) for v in db.values())
    print(f"Indexed {total} files across {len(db)} papers:\n")
    for key, v in db.items():
        names = ", ".join(x["name"] + ("" if x["text"] else " [download]") for x in v["files"])
        print(f"  {key}  ({v['subject']} P{v['paper']}/{v['variant']} {v['session']})")
        print(f"      {names}")
    print(f"\nSaved {OUTPUT}")

    if UPLOAD_R2:
        print("\nUploading to R2...")
        try:
            from r2_upload import upload_folder
            upload_folder(SF_DIR, "sf")
        except SystemExit:
            print("R2 upload skipped (see above).")
        except Exception as e:
            print(f"R2 upload error: {e}")
    else:
        print("\nNot uploaded. The app reads these from R2, so when you're ready:")
        print("    python generate_sf.py --upload-r2")


if __name__ == "__main__":
    main()
