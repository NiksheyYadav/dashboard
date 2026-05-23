import subprocess
import sys

try:
    import pdfplumber
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pdfplumber', '-q'])
    import pdfplumber

pdfs = [
    ("SOET_Attendance_Mentorship_App_Developer_Specification.pdf", "spec_extracted.md"),
    ("Updated Instructions for App Designer.pdf", "instructions_extracted.md"),
]

for pdf_path, out_path in pdfs:
    print(f"Extracting: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        with open(out_path, "w", encoding="utf-8") as f:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    f.write(f"--- PAGE {i+1} ---\n")
                    f.write(text)
                    f.write("\n\n")
    print(f"  -> Written to {out_path}")

print("Done.")
