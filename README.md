# PastPaper Explorer

A simple, fast web application built to help students find and view Cambridge International (CAIE) past papers. Instead of digging through folders, you can use the dropdown menus to find exactly the paper you need in seconds.

## 🚀 Features

* **Quick Filtering:** Easily select Subject, Year, Season, and Paper Variant.
* **QP vs. MS:** Toggle between Question Papers and Mark Schemes with one click.
* **Built-in Viewer:** View PDFs directly in your browser using the PDF.js engine (no need to download first).
* **CS Tools:** A quick-access button to an online compiler for Computer Science (9618) students.
* **Fully Responsive:** Works on both desktop and mobile devices.

## 🛠️ Tech Stack

* **React:** For the user interface.
* **Tailwind CSS:** For the dark-themed, modern styling.
* **Lucide React:** For the icons.
* **PDF.js:** To power the internal PDF viewing experience.

## 📂 Project Structure

For this app to work, your PDF files must follow a specific naming convention and be stored in the public directory:

* **Path:** `/public/papers/`
* **Format:** `SUBJECT_SEASON_YEAR_TYPE_PAPER_VARIANT.pdf`
* **Example:** `9709_s23_qp_12.pdf` (Mathematics, Summer 2023, Question Paper 12)

🛠️ Installation & Setup

1. **Clone the repo:**
git clone https://github.com/Huzaifa-616/PastPaper-Explorer.git

👤 Author

Muhammad Huzaifa Imran
Email: huzaifa.bravo@gmail.com
---

Would you like me to add a section on how to contribute or how to host this on a platform like Vercel/Netlify?
