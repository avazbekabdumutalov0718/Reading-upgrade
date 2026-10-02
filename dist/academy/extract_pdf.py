import pdfplumber

pdf_path = "uzbek1000_collacations.vocabulary.pdf"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")
        
        # Extract text from first 10 pages to see format
        for i in range(min(10, len(pdf.pages))):
            page = pdf.pages[i]
            text = page.extract_text()
            print(f"--- PAGE {i+1} ---")
            if text:
                print(text[:800])
            else:
                print("No text found")
            print("\n" + "="*80 + "\n")
except Exception as e:
    print(f"Error: {e}")
