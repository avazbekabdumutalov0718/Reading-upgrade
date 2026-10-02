from pdfminer.high_level import extract_text

pdf_path = "uzbek1000_collacations.vocabulary.pdf"

try:
    # Extract all text from PDF
    text = extract_text(pdf_path)
    
    # Print first 3000 characters to preview
    print(text[:3000])
    print("\n\n=== TOTAL LENGTH ===")
    print(f"Total characters extracted: {len(text)}")
    
except Exception as e:
    print(f"Error: {e}")
