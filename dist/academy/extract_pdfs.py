import os
import json
import pdfplumber
import re
from pathlib import Path

def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
                text += "\n"
        return text
    except Exception as e:
        print(f"Error extracting from {pdf_path}: {e}")
        return ""

def extract_sample_answers(text):
    """Try to extract sample answers and useful phrases from text"""
    questions = []
    
    # Split by common patterns for questions
    lines = text.split('\n')
    current_question = None
    current_answer = None
    current_phrases = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for question markers
        if re.match(r'^(Q|Question|\d+\.)\s*', line, re.IGNORECASE):
            # Save previous question if exists
            if current_question and current_answer:
                questions.append({
                    "question": current_question,
                    "sampleAnswer": current_answer,
                    "uzbekTranslation": "",
                    "usefulPhrases": current_phrases
                })
            current_question = line
            current_answer = None
            current_phrases = []
        
        # Look for answer markers
        elif re.match(r'^(Answer|Sample Answer|Model Answer|A:)', line, re.IGNORECASE):
            if current_answer:
                current_answer += " " + line
            else:
                current_answer = line
        
        # Build up the answer
        elif current_answer and not re.match(r'^(Q|Question|Answer)', line, re.IGNORECASE):
            if len(line) > 10:  # Only add substantial lines
                current_answer += " " + line
    
    # Add last question
    if current_question and current_answer:
        questions.append({
            "question": current_question,
            "sampleAnswer": current_answer,
            "uzbekTranslation": "",
            "usefulPhrases": current_phrases
        })
    
    return questions

def extract_collocations(text):
    """Try to extract collocations and vocabulary"""
    collocations = {}
    
    # Look for sections with vocabulary/collocations
    vocab_section = ""
    lines = text.split('\n')
    in_vocab = False
    
    for line in lines:
        lower_line = line.lower()
        if any(word in lower_line for word in ['vocabulary', 'collocation', 'phrase', 'expression', 'useful word']):
            in_vocab = True
        elif in_vocab and (any(word in lower_line for word in ['question', 'answer', 'passage'])):
            in_vocab = False
        elif in_vocab:
            vocab_section += line + "\n"
    
    # Extract key phrases from vocab section
    if vocab_section:
        phrases = [line.strip() for line in vocab_section.split('\n') if line.strip() and len(line.strip()) > 5]
        if phrases:
            collocations["extracted"] = phrases[:50]  # Limit to 50 items
    
    return collocations

def get_day_and_topic(filename, text):
    """Extract day and topic from filename and text"""
    filename_lower = filename.lower()
    
    # Extract day number from filename
    day_match = re.search(r'day\s*(\d+)', filename_lower)
    day_num = day_match.group(1) if day_match else "Unknown"
    
    # Extract topic from filename
    topic_match = re.search(r'passage\s*\d?\s*-?\s*(.+?)\.pdf', filename_lower)
    topic = topic_match.group(1).strip() if topic_match else "Unknown Topic"
    
    # Try to extract topic from text if not in filename
    if topic == "Unknown Topic":
        first_lines = '\n'.join(text.split('\n')[:10])
        # Look for capitalized words as potential topic
        words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', first_lines)
        if words:
            topic = ' '.join(words[:3])
    
    return f"Day {day_num} - {topic}"

def main():
    """Main extraction function"""
    pdf_folder = r"c:\Users\Windows 11\Desktop\IELTS TODAY"
    
    # Find all PDF files
    pdf_files = [f for f in os.listdir(pdf_folder) if f.endswith('.pdf')]
    pdf_files.sort()
    
    print(f"Found {len(pdf_files)} PDF files")
    print("Files:", pdf_files)
    
    readings = []
    all_collocations = {}
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_folder, pdf_file)
        print(f"\nProcessing: {pdf_file}")
        
        # Extract text
        text = extract_text_from_pdf(pdf_path)
        
        if not text.strip():
            print(f"  No text extracted from {pdf_file}")
            continue
        
        print(f"  Extracted {len(text)} characters")
        
        # Get title
        title = get_day_and_topic(pdf_file, text)
        
        # Extract questions and answers
        questions = extract_sample_answers(text)
        
        # Extract collocations
        collocations = extract_collocations(text)
        
        # Create reading entry
        reading_entry = {
            "title": title,
            "passage": text[:500] + "..." if len(text) > 500 else text,  # Store first 500 chars as preview
            "fullText": text,  # Store full text separately for reference
            "questions": questions if questions else [{"question": "Content extracted", "sampleAnswer": text[:1000], "uzbekTranslation": "", "usefulPhrases": []}]
        }
        
        readings.append(reading_entry)
        
        # Merge collocations
        for key, value in collocations.items():
            if key not in all_collocations:
                all_collocations[key] = []
            all_collocations[key].extend(value)
    
    # Create final JSON structure
    output_data = {
        "readings": readings,
        "collocations": all_collocations if all_collocations else {"default": ["No collocations extracted"]}
    }
    
    # Save to file
    output_file = os.path.join(pdf_folder, "extracted_data.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Extraction complete! Saved to {output_file}")
    print(f"  Total readings: {len(readings)}")
    print(f"  Total collocations categories: {len(all_collocations)}")
    
    return output_data

if __name__ == "__main__":
    data = main()
    print("\n" + "="*60)
    print("EXTRACTION SUMMARY")
    print("="*60)
    for reading in data["readings"]:
        print(f"\n📖 {reading['title']}")
        print(f"   - Passage length: {len(reading['fullText'])} characters")
        print(f"   - Questions found: {len(reading['questions'])}")
