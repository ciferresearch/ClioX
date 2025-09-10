from pathlib import Path
import json
import re

def extract_source_from_filename(chunk_filename):
    """Extract original PDF source filename from chunk filename.
    
    Chunk files are named: chunk_{pdf_stem}_{chunk_index}.txt
    Example: chunk_document1_0.txt -> document1.pdf
    """
    # Remove 'chunk_' prefix and '.txt' suffix, then split by '_'
    name_parts = chunk_filename.replace('chunk_', '').replace('.txt', '').split('_')
    
    # The last part is the chunk index, everything before is the PDF stem
    if len(name_parts) >= 2:
        pdf_stem = '_'.join(name_parts[:-1])  # Join all parts except the last (index)
        return f"{pdf_stem}.pdf"
    else:
        # Fallback for unexpected naming
        return "unknown.pdf"

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
        
        # Extract the original PDF source from the chunk filename
        source_filename = extract_source_from_filename(chunk_file.name)
        
        chunk_entry = {
            "id": chunk_id,
            "content": chunk_text,
            "metadata": {
                "source": source_filename, 
                "page": extract_page_number(chunk_text),
                "type": "pdf",
                "word_count": len(chunk_text.split())
            }
        }
        
        structured_output.append(chunk_entry)
    
    return structured_output

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
