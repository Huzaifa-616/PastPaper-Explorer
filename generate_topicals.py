import fitz  # PyMuPDF
import os
import re
import json

# Comprehensive CAIE 9618 Syllabus Mapping
SYLLABUS_KEYWORDS = {
    "9618": {
        "Data Representation": ["binary", "hexadecimal", "two's complement", "floating point", "ascii", "unicode", "sampling rate", "colour depth", "run-length encoding", "lossy", "lossless", "mantissa", "exponent"],
        "Networking & Internet": ["topology", "packet", "router", "ip address", "mac address", "client-server", "peer-to-peer", "dns", "url", "tcp/ip", "osi model", "ethernet", "csma/cd"],
        "Hardware & Logic": ["von neumann", "alu", "control unit", "register", "program counter", "fetch-execute", "logic gate", "truth table", "karnaugh", "boolean", "risc", "cisc", "virtual machine"],
        "System Software": ["operating system", "compiler", "interpreter", "assembler", "utility software", "scheduling", "multiprogramming", "paging", "segmentation", "interrupt"],
        "Security & Ethics": ["encryption", "malware", "phishing", "firewall", "validation", "verification", "copyright", "open source", "shareware", "digital signature", "digital certificate", "asymmetric"],
        "Databases": ["relational database", "primary key", "foreign key", "entity-relationship", "normalization", "1nf", "2nf", "3nf", "sql", "select", "data definition language", "data manipulation language", "dbms"],
        "Algorithm Design": ["pseudocode", "flowchart", "stepwise refinement", "trace table", "identifier", "assignment", "iteration", "selection", "procedure", "function"],
        "Data Structures": ["array", "linked list", "stack", "queue", "binary tree", "hash table", "record", "pointer", "push", "pop", "enqueue", "dequeue"],
        "Programming & OOP": ["object-oriented", "class", "object", "inheritance", "polymorphism", "encapsulation", "method", "constructor", "exception handling", "file handling", "recursion"],
        "Software Development": ["software lifecycle", "waterfall", "agile", "black-box testing", "white-box testing", "alpha testing", "beta testing", "stub", "dry run"],
        "Artificial Intelligence": ["artificial intelligence", "machine learning", "deep learning", "neural network", "a* algorithm", "heuristic", "dijkstra"]
    }
}

# Paths based on your Vite setup
PAPERS_DIR = "./public/papers"
OUTPUT_JSON = "./public/topicals_db.json"

def build_topical_database():
    database = {}
    print("Starting CAIE PDF analysis...\n")

    if not os.path.exists(PAPERS_DIR):
        print(f"Error: Could not find directory {PAPERS_DIR}")
        return

    # Regex to catch Cambridge question numbers (e.g. "1 ", "12\n", "1(") at the start of lines
    question_pattern = re.compile(r'(?m)^\s*([1-9][0-9]*)(?:\s|\n|\()')

    # Iterate through all PDFs in your folder
    for filename in os.listdir(PAPERS_DIR):
        if not filename.endswith(".pdf") or "_qp_" not in filename:
            continue  # Only process Question Papers
            
        filepath = os.path.join(PAPERS_DIR, filename)
        parts = filename.replace(".pdf", "").split("_")
        
        # Expected format: 9618_m22_qp_12.pdf
        if len(parts) < 4: continue
        
        subject_code = parts[0]
        season_year = parts[1]
        paper_variant = parts[3]
        
        if subject_code not in SYLLABUS_KEYWORDS:
            continue

        keywords_map = SYLLABUS_KEYWORDS[subject_code]
        
        try:
            doc = fitz.open(filepath)
        except Exception as e:
            print(f"Failed to read {filename}: {e}")
            continue
            
        questions_found_in_paper = 0

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text").lower()
            
            # Find all question numbers on this page
            matches = question_pattern.findall(text)
            
            if not matches:
                continue # No new questions start on this page
                
            # For each topic, check if its keywords exist in this page's text
            for topic, keywords in keywords_map.items():
                if any(kw in text for kw in keywords):
                    
                    if subject_code not in database: database[subject_code] = {}
                    if topic not in database[subject_code]: database[subject_code][topic] = []
                    
                    # Prevent duplicate entries for the same page
                    page_entry = {
                        "paper_id": filename,
                        "season_year": season_year,
                        "variant": paper_variant,
                        "page_number": page_num + 1, # PDF.js uses 1-indexed pages
                        "questions": list(set(matches))
                    }
                    
                    # Avoid adding the exact same page to the same topic twice
                    if page_entry not in database[subject_code][topic]:
                        database[subject_code][topic].append(page_entry)
                        questions_found_in_paper += len(set(matches))
                    
        doc.close()
        print(f"Processed: {filename} - Found ~{questions_found_in_paper} topical matches.")

    # Save to JSON in the public folder so the React app can fetch it
    with open(OUTPUT_JSON, "w") as f:
        json.dump(database, f, indent=2)
        
    print(f"\nSuccess! Topical database saved to {OUTPUT_JSON}")
    print("You can now fetch this JSON in your React app.")

if __name__ == "__main__":
    build_topical_database()