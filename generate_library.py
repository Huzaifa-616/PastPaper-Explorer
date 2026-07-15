"""
The Nexus - Library Indexer
===========================
Scans ./public/library and writes ./public/library_db.json for the app.

  python generate_library.py                # index only
  python generate_library.py --upload-r2    # index AND sync the files to R2

Indexes EVERY real file (PDFs, Word, PowerPoint, images, code, archives...),
skipping only junk/system files. Each entry carries a `kind` so the UI can
show a proper icon.
"""

import os
import json
import sys

LIBRARY_DIR = "./public/library"
OUTPUT_JSON = "./public/library_db.json"
UPLOAD_R2 = "--upload-r2" in sys.argv

# ── Junk that should never appear in a student's library ─────────────────────
IGNORED_NAMES = {'.ds_store', 'thumbs.db', 'desktop.ini', '.gitkeep', '.gitignore'}
IGNORED_EXTS = {'.tmp', '.part', '.crdownload', '.swp', '.lock'}

def is_ignored(name):
    low = name.lower()
    if low in IGNORED_NAMES or low.startswith('~$') or low.startswith('.'):
        return True
    return os.path.splitext(low)[1] in IGNORED_EXTS

# ── File kind → lets the UI pick an icon/colour ──────────────────────────────
KIND_BY_EXT = {
    '.pdf': 'pdf',
    '.doc': 'doc', '.docx': 'doc', '.odt': 'doc', '.rtf': 'doc',
    '.ppt': 'slides', '.pptx': 'slides', '.odp': 'slides',
    '.xls': 'sheet', '.xlsx': 'sheet', '.csv': 'sheet', '.ods': 'sheet',
    '.png': 'image', '.jpg': 'image', '.jpeg': 'image', '.gif': 'image',
    '.webp': 'image', '.svg': 'image', '.bmp': 'image',
    '.zip': 'archive', '.rar': 'archive', '.7z': 'archive', '.tar': 'archive', '.gz': 'archive',
    '.mp4': 'video', '.mov': 'video', '.mkv': 'video', '.webm': 'video',
    '.mp3': 'audio', '.wav': 'audio', '.m4a': 'audio',
    '.txt': 'text', '.md': 'text',
    '.html': 'web', '.htm': 'web',
    '.py': 'code', '.js': 'code', '.java': 'code', '.cpp': 'code', '.c': 'code',
    '.epub': 'book', '.mobi': 'book',
}

def kind_of(name):
    return KIND_BY_EXT.get(os.path.splitext(name.lower())[1], 'file')

def human_size(n):
    if n < 1024:
        return f"{n} B"
    if n < 1024 * 1024:
        return f"{round(n / 1024, 1)} KB"
    return f"{round(n / (1024 * 1024), 2)} MB"

def build_tree(dir_path):
    tree = []
    try:
        items = sorted(os.listdir(dir_path))
    except PermissionError:
        return tree

    for item in items:
        if is_ignored(item):
            continue

        item_path = os.path.join(dir_path, item)
        # Web path for React, e.g. /library/9618/book.pdf  (Windows-safe)
        web_path = item_path.replace("./public", "").replace("\\", "/")

        if os.path.isdir(item_path):
            tree.append({
                "name": item,
                "type": "folder",
                "children": build_tree(item_path),
            })
        else:
            tree.append({
                "name": item,
                "type": "file",
                "path": web_path,
                "size": human_size(os.path.getsize(item_path)),
                "kind": kind_of(item),
            })

    # Folders first, then files, each alphabetical
    tree.sort(key=lambda x: (x['type'] == 'file', x['name'].lower()))
    return tree

def count_items(nodes):
    files = folders = 0
    for n in nodes:
        if n['type'] == 'folder':
            folders += 1
            f, d = count_items(n.get('children', []))
            files += f; folders += d
        else:
            files += 1
    return files, folders

def generate_database():
    print("Scanning Library Directory...\n")

    if not os.path.exists(LIBRARY_DIR):
        print(f"Error: Directory not found -> {LIBRARY_DIR}")
        os.makedirs(LIBRARY_DIR)
        print("Created ./public/library — drop your files in and run this again.")
        return

    database = build_tree(LIBRARY_DIR)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=4)

    files, folders = count_items(database)
    print(f"Success! Indexed {files} files across {folders} folders.")

    kinds = {}
    def tally(nodes):
        for n in nodes:
            if n['type'] == 'folder':
                tally(n.get('children', []))
            else:
                kinds[n['kind']] = kinds.get(n['kind'], 0) + 1
    tally(database)
    if kinds:
        print("  by type: " + ", ".join(f"{v} {k}" for k, v in sorted(kinds.items(), key=lambda x: -x[1])))
    print(f"Library database saved to {OUTPUT_JSON}")

    if UPLOAD_R2:
        print("\nUploading library files to R2...")
        try:
            from r2_upload import upload_folder
            upload_folder(LIBRARY_DIR, "library")
        except SystemExit:
            print("R2 upload skipped (see message above).")
        except Exception as e:
            print(f"R2 upload error: {e}")

if __name__ == "__main__":
    generate_database()
