import fitz  # PyMuPDF
import os
import re
import json

# Single Source of Truth for 9618
SYLLABUS = {
    "9618": {
        "1": {
            "title": "AS Level Theory",
            "topics": {
                "Data Representation": ["binary", "hexadecimal", "two's complement", "bcd", "binary coded decimal", "ascii", "unicode", "sampling", "sampling rate", "sampling resolution", "colour depth", "image resolution", "run-length encoding", "rle", "lossy", "lossless", "pixel", "bitmap", "vector graphic"],
                "Networking": ["topology", "packet", "router", "ip address", "mac address", "client-server", "peer-to-peer", "dns", "url", "tcp/ip", "ethernet", "csma/cd", "lan", "wan", "switch", "gateway", "bit streaming", "ipv4", "ipv6", "subnet", "public ip", "private ip", "copper cable", "fibre-optic"],
                "Hardware & Processors": ["von neumann", "alu", "control unit", "register", "program counter", "fetch-execute", "interrupt", "bus", "address bus", "data bus", "control bus", "usb", "hdmi", "vga", "ssd", "hdd", "ram", "rom", "cache", "solid state", "optical disk", "magnetic disk", "sensor", "actuator"],
                "Logic Gates": ["logic gate", "truth table", "boolean expression", "nand", "nor", "xor", "logic circuit", "and gate", "or gate", "not gate", "logic statement"],
                "Assembly Language": ["assembly", "opcode", "operand", "mnemonic", "addressing mode", "immediate addressing", "direct addressing", "indirect addressing", "indexed addressing", "ldd", "sto", "add", "inc", "cmp", "jmp", "ldx"],
                "System Software": ["operating system", "compiler", "interpreter", "assembler", "utility software", "disk formatter", "virus checker", "defragmentation", "backup software", "library program", "dll", "linker", "loader", "hardware driver"],
                "Security, Privacy & Ethics": ["encryption", "malware", "phishing", "firewall", "validation", "verification", "copyright", "open source", "shareware", "freeware", "commercial software", "data privacy", "data security", "authentication", "authorization", "password", "biometric", "spyware", "virus", "pharming", "parity check", "checksum", "echo check", "check digit"],
                "Databases": ["relational database", "primary key", "foreign key", "entity-relationship", "erd", "normalization", "1nf", "2nf", "3nf", "sql", "select", "ddl", "dml", "insert into", "update", "flat file", "compound key", "referential integrity", "data dictionary"]
            }
        },
        "2": {
            "title": "AS Problem Solving",
            "topics": {
                "Algorithm Design": ["pseudocode", "flowchart", "stepwise refinement", "trace table", "identifier", "assignment", "iteration", "selection", "structure chart", "sequence", "conditional statement", "loop", "while", "repeat until", "for loop"],
                "Data Structures": ["1d array", "2d array", "abstract data type", "record", "text file", "read file", "write file", "append file", "file handling", "index"],
                "Programming Concepts": ["procedure", "function", "by value", "by reference", "local variable", "global variable", "ide", "debugging", "syntax error", "logic error", "run-time error", "parameter", "return value", "constant", "variable scope"],
                "Software Development": ["software lifecycle", "waterfall", "agile", "black-box testing", "white-box testing", "stub", "dry run", "alpha testing", "beta testing", "acceptance testing", "integration testing", "iterative", "rapid application development", "rad"]
            }
        },
        "3": {
            "title": "A Level Advanced Theory",
            "topics": {
                "Advanced Data Representation": ["floating point", "mantissa", "exponent", "normalized form", "normalisation", "underflow", "overflow", "precision", "accuracy", "rounding", "truncation"],
                "Advanced Networking": ["osi model", "packet switching", "circuit switching", "cryptography", "digital signature", "digital certificate", "asymmetric encryption", "symmetric encryption", "public key", "private key", "quantum cryptography"],
                "Hardware & Virtual Machines": ["risc", "cisc", "pipelining", "multicore", "virtual machine", "boolean algebra", "karnaugh map", "k-map", "half adder", "full adder", "flip-flop", "sr flip-flop", "jk flip-flop", "sisd", "simd", "misd", "mimd", "cluster computing", "supercomputer", "de morgan"],
                "Advanced System Software": ["scheduling", "multiprogramming", "paging", "segmentation", "spooling", "lexical analysis", "syntax analysis", "code generation", "bnf", "rpn", "process scheduling", "round robin", "shortest job", "first come first served", "memory management", "virtual memory", "thrashing", "reverse polish notation", "syntax diagram", "optimization"],
                "Artificial Intelligence": ["artificial intelligence", "machine learning", "deep learning", "neural network", "a* algorithm", "heuristic", "dijkstra", "expert system", "knowledge base", "inference engine", "rule base", "reinforcement learning", "supervised learning", "unsupervised learning", "back-propagation"]
            }
        },
        "4": {
            "title": "A Level Practical",
            "topics": {
                "Algorithms & Recursion": ["recursion", "recursive", "base case", "binary search", "linear search", "insertion sort", "bubble sort", "winding", "unwinding", "general case", "call stack"],
                "OOP & Paradigms": ["object-oriented", "class", "object", "inheritance", "polymorphism", "encapsulation", "method", "constructor", "declarative programming", "instantiation", "getter", "setter", "private attribute", "public attribute", "facts", "rules", "goal", "backtracking", "prolog"],
                "Data Structures & Files": ["linked list", "stack", "queue", "binary tree", "hash table", "exception handling", "serial file", "sequential file", "random file", "node", "pointer", "null pointer", "root", "leaf", "inorder", "preorder", "postorder", "hashing", "collision", "synonym", "try", "catch", "push", "pop", "enqueue", "dequeue"]
            }
        }
    }
}

PAPERS_DIR = "./public/papers"
OUTPUT_JSON = "./public/topicals_db.json"

def build_topical_database():
    # 1. Initialize the pristine JSON structure
    database = {"9618": {}}
    for p_num, p_data in SYLLABUS["9618"].items():
        database["9618"][p_num] = {
            "title": p_data["title"],
            "topics": {t: [] for t in p_data["topics"].keys()}
        }

    print("Starting STRICT CAIE PDF analysis...\n")

    if not os.path.exists(PAPERS_DIR):
        print(f"Error: Could not find directory {PAPERS_DIR}")
        return

    question_pattern = re.compile(r'(?m)^\s*([1-9][0-9]*)(?:\s|\n|\()')

    # 2. Scan the PDFs and populate the array
    for filename in os.listdir(PAPERS_DIR):
        if not filename.endswith(".pdf") or "_qp_" not in filename:
            continue

        filepath = os.path.join(PAPERS_DIR, filename)
        parts = filename.replace(".pdf", "").split("_")

        if len(parts) < 4: continue

        subject_code = parts[0]
        season_year = parts[1]
        paper_variant = parts[3]
        paper_num = paper_variant[0]

        if subject_code != "9618" or paper_num not in SYLLABUS["9618"]:
            continue

        keywords_map = SYLLABUS["9618"][paper_num]["topics"]

        try:
            doc = fitz.open(filepath)
        except Exception as e:
            print(f"Failed to read {filename}: {e}")
            continue

        questions_found = 0

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text").lower()

            matches = question_pattern.findall(text)

            if not matches:
                continue

            for topic, keywords in keywords_map.items():
                if any(kw in text for kw in keywords):
                    page_entry = {
                        "paper_id": filename,
                        "season_year": season_year,
                        "variant": paper_variant,
                        "page_number": page_num + 1,
                        "questions": list(set(matches))
                    }

                    if page_entry not in database["9618"][paper_num]["topics"][topic]:
                        database["9618"][paper_num]["topics"][topic].append(page_entry)
                        questions_found += len(set(matches))

        doc.close()
        print(f"Processed: {filename} (Paper {paper_num}) - Found {questions_found} questions.")

    # 3. THE MAGIC FIX: Delete all topics that found 0 questions
    for p_num in list(database["9618"].keys()):
        topics = database["9618"][p_num]["topics"]
        database["9618"][p_num]["topics"] = {k: v for k, v in topics.items() if len(v) > 0}

    with open(OUTPUT_JSON, "w") as f:
        json.dump(database, f, indent=2)

    print(f"\nSuccess! Optimized database saved to {OUTPUT_JSON}")

if __name__ == "__main__":
    build_topical_database()