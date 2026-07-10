import os
import json
import sys

# Define where to look and where to save
LIBRARY_DIR = "./public/library"
OUTPUT_JSON = "./public/library_db.json"
UPLOAD_R2 = "--upload-r2" in sys.argv

def build_tree(dir_path):
    tree = []
    try:
        # Get all items in the folder and sort them alphabetically
        items = sorted(os.listdir(dir_path))
    except PermissionError:
        return tree

    for item in items:
        # Ignore hidden system files (like .DS_Store on Mac)
        if item.startswith('.'):
            continue

        item_path = os.path.join(dir_path, item)
        
        # Create a web-friendly URL path for React (e.g., /library/9618/book.pdf)
        # We replace backslashes to ensure it works perfectly if you are on Windows
        web_path = item_path.replace("./public", "").replace("\\", "/")

        if os.path.isdir(item_path):
            # If it's a folder, run this function again inside that folder (Recursion)
            children = build_tree(item_path)
            tree.append({
                "name": item,
                "type": "folder",
                "children": children
            })
        else:
            # If it's a file, grab its size and add it to the list
            # You can add more file types here if you want to support word docs, etc.
            if item.lower().endswith(('.pdf', '.html', '.txt')):
                size_bytes = os.path.getsize(item_path)
                size_mb = round(size_bytes / (1024 * 1024), 2)
                
                tree.append({
                    "name": item,
                    "type": "file",
                    "path": web_path,
                    "size": f"{size_mb} MB"
                })
    
    # Sort the final list so Folders always appear at the top, and Files at the bottom
    tree.sort(key=lambda x: (x['type'] == 'file', x['name'].lower()))
    return tree

def generate_database():
    print("Scanning Library Directory...\n")
    
    if not os.path.exists(LIBRARY_DIR):
        print(f"Error: Directory not found -> {LIBRARY_DIR}")
        print("Creating the empty library folder structure for you now...")
        os.makedirs(LIBRARY_DIR)
        print("Please drag some PDFs into /public/library/ and run this script again.")
        return

    # Build the massive JSON tree
    database = build_tree(LIBRARY_DIR)

    # Save it to the public folder so React can fetch it
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=2)

    # Count everything up to show you a nice summary in the terminal
    def count_items(node_list):
        files = sum(1 for item in node_list if item['type'] == 'file')
        folders = sum(1 for item in node_list if item['type'] == 'folder')
        for item in node_list:
            if item['type'] == 'folder':
                f, fol = count_items(item['children'])
                files += f
                folders += fol
        return files, folders
    
    tot_files, tot_folders = count_items(database)
    print(f"Success! Indexed {tot_files} files across {tot_folders} folders.")
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