from pathlib import Path
import json
import re

def extract_sections(text):
    """Extract sections from text based on common patterns."""
    sections = []
    
    # Split by common section headers (you can customize these patterns)
    section_patterns = [
        r'\n\s*([A-Z][A-Z\s]{2,})\s*\n',  # ALL CAPS headers
        r'\n\s*(\d+\.?\s+[A-Z][a-zA-Z\s]+)\s*\n',  # Numbered headers
        r'\n\s*([A-Z][a-zA-Z\s]*:)\s*',  # Colon-terminated headers
    ]
    
    current_title = "Introduction"
    current_content = ""
    
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if this line looks like a header
        is_header = False
        for pattern in section_patterns:
            match = re.match(pattern, f'\n{line}\n')
            if match:
                # Save previous section
                if current_content.strip():
                    sections.append({
                        "title": current_title.strip(),
                        "content": current_content.strip()
                    })
                
                current_title = line
                current_content = ""
                is_header = True
                break
        
        if not is_header:
            current_content += line + " "
    
    # Add the last section
    if current_content.strip():
        sections.append({
            "title": current_title.strip(),
            "content": current_content.strip()
        })
    
    return sections

def structure_chunks(chunker_output_path):
    """Process chunk files and create RAG-optimized document chunks."""
    structured_output = []
    
    chunk_files = sorted(list(chunker_output_path.glob('chunk_*.txt')))
    
    for chunk_file in chunk_files:
        with open(chunk_file, 'r', encoding='utf-8') as file:
            chunk_text = file.read().strip()
        
        # Skip empty chunks
        if not chunk_text:
            continue
            
        # Create a simple chunk entry for the entire chunk content
        chunk_id = chunk_file.stem  # Use the filename as ID (e.g., "chunk_0_1")
        
        # Try to extract a meaningful section title from the content
        section_title = extract_meaningful_title(chunk_text)
        
        chunk_entry = {
            "id": chunk_id,
            "content": chunk_text,
            "metadata": {
                "source": "0.pdf",  # Could be made dynamic
                "page": extract_page_number(chunk_text),
                "type": "pdf",
                "section": section_title,
                "word_count": len(chunk_text.split())
            }
        }
        
        structured_output.append(chunk_entry)
    
    return structured_output

def extract_meaningful_title(content):
    """Try to extract a meaningful title from the content."""
    lines = content.split('\n')
    
    # Look for potential titles in the first few lines
    for line in lines[:3]:
        line = line.strip()
        if line and len(line) < 100:  # Reasonable title length
            # Check if it looks like a title (capitalized, short, not a page marker)
            if (line[0].isupper() and 
                not line.startswith('---') and 
                not line.startswith('ARCHIVARIA') and
                not line.lower().startswith('this is') and
                not line.lower().startswith('the ')):
                return line
    
    # Fallback: use first few words of content
    words = content.split()[:5]
    return ' '.join(words) + '...' if len(words) == 5 else ' '.join(words)

def extract_page_number(content):
    """Try to extract page number from content."""
    import re
    
    # Look for page markers like "--- Page 1 ---"
    page_match = re.search(r'---\s*Page (\d+)\s*---', content)
    if page_match:
        return int(page_match.group(1))
    
    # Look for page numbers in headers/footers
    page_match = re.search(r'ARCHIVARIA (\d+)', content)
    if page_match:
        return int(page_match.group(1))
    
    return None  # No page number found

def main():
    chunker_output_path = Path('/tmp/pipeline_work/chunker_output')
    final_output_path = Path('/tmp/pipeline_work/final_output')
    
    # Ensure output directory exists
    final_output_path.mkdir(parents=True, exist_ok=True)
    
    # Check if chunker output exists
    if not chunker_output_path.exists():
        print("Chunker output directory not found")
        return
    
    chunk_files = list(chunker_output_path.glob('chunk_*.txt'))
    if not chunk_files:
        print("No chunk files found in chunker output")
        return
    
    print(f"Processing {len(chunk_files)} chunk files")
    
    # Structure the chunks
    structured_output = structure_chunks(chunker_output_path)
    
    # Save structured output
    output_file = final_output_path / 'structured_output.json'
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(structured_output, file, indent=2, ensure_ascii=False)
    
    print(f"Structured output saved to {output_file}")
    print(f"Processed {len(chunk_files)} chunks")
    print(f"Extracted {len(structured_output)} sections")

if __name__ == "__main__":
    main()
