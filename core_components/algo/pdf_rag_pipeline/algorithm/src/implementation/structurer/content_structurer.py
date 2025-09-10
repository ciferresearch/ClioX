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
    """Structure all chunk files into a unified document."""
    structured_output = {
        "document_sections": [],
        "metadata": {
            "total_chunks_processed": 0,
            "total_sections_extracted": 0
        }
    }
    
    # Process all chunk files
    chunk_files = sorted(list(chunker_output_path.glob('chunk_*.txt')))
    
    for chunk_file in chunk_files:
        with open(chunk_file, 'r', encoding='utf-8') as file:
            chunk_text = file.read()
        
        # Extract sections from this chunk
        sections = extract_sections(chunk_text)
        
        for section in sections:
            structured_output["document_sections"].append({
                "source_chunk": chunk_file.name,
                "title": section["title"],
                "content": section["content"],
                "word_count": len(section["content"].split())
            })
    
    structured_output["metadata"]["total_chunks_processed"] = len(chunk_files)
    structured_output["metadata"]["total_sections_extracted"] = len(structured_output["document_sections"])
    
    return structured_output

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
    print(f"Processed {structured_output['metadata']['total_chunks_processed']} chunks")
    print(f"Extracted {structured_output['metadata']['total_sections_extracted']} sections")

if __name__ == "__main__":
    main()
