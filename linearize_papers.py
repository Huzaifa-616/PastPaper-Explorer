import os
import subprocess

PAPERS_DIR = "./public/papers"

def linearize_pdfs():
    if not os.path.exists(PAPERS_DIR):
        print(f"Error: Directory {PAPERS_DIR} not found.")
        return

    print("Starting Fast Web View (Linearization) process...\n")
    optimized_count = 0

    for filename in os.listdir(PAPERS_DIR):
        if not filename.endswith(".pdf"):
            continue

        filepath = os.path.join(PAPERS_DIR, filename)
        temp_filepath = os.path.join(PAPERS_DIR, f"temp_{filename}")

        print(f"Optimizing: {filename}...")
        
        try:
            # Run qpdf to linearize the file and save to a temporary file
            subprocess.run(
                ["qpdf", "--linearize", filepath, temp_filepath],
                check=True,
                stdout=subprocess.DEVNULL, 
                stderr=subprocess.DEVNULL
            )
            
            # Replace the old bulky PDF with the optimized one
            os.replace(temp_filepath, filepath)
            optimized_count += 1
            
        except subprocess.CalledProcessError:
            print(f"Failed to optimize {filename}. Skipping.")
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)

    print(f"\nSuccess! Linearized {optimized_count} PDFs for Fast Web View.")

if __name__ == "__main__":
    linearize_pdfs()