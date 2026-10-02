import pypdfium2 as pdfium

pdf_path = "uzbek1000_collacations.vocabulary.pdf"

try:
    # Open PDF
    pdf = pdfium.PdfDocument.new()
    pdf = pdfium.PdfDocument.load(pdf_path)
    
    print(f"Total pages: {len(pdf)}\n")
    
    # Extract text from first few pages
    for page_num in range(min(5, len(pdf))):
        page = pdf.get_page(page_num)
        
        # Use an alternative approach if direct text extraction isn't available
        print(f"--- PAGE {page_num + 1} ---")
        print(f"Page size: {page.get_mediabox()}")
        print("\n")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
