from pathlib import Path
import os
import re

def chunk_text_overlapping(text, chunk_size=1000, overlap=200):
    """Splits text into overlapping chunks of specified size."""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Don't add empty chunks
        if chunk.strip():
            chunks.append(chunk)
        
        # Move start position by (chunk_size - overlap)
        start += (chunk_size - overlap)
        
        # Break if we've reached the end
        if end >= len(text):
            break
    
    return chunks

def chunk_text_smart_boundaries(text, target_chunk_size=1000, max_chunk_size=1500):
    """Splits text at smart boundaries (sentences, paragraphs) near target size."""
    chunks = []
    
    # Split into paragraphs first
    paragraphs = re.split(r'\n\s*\n', text.strip())
    
    current_chunk = ""
    
    for paragraph in paragraphs:
        # If paragraph alone is longer than max_chunk_size, split by sentences
        if len(paragraph) > max_chunk_size:
            # Split into sentences
            sentences = re.split(r'(?<=[.!?])\s+', paragraph)
            
            for sentence in sentences:
                # If adding this sentence would exceed target size, save current chunk
                if len(current_chunk) + len(sentence) > target_chunk_size and current_chunk.strip():
                    chunks.append(current_chunk.strip())
                    current_chunk = sentence + " "
                else:
                    current_chunk += sentence + " "
                    
                # If single sentence is too long, force split it
                if len(current_chunk) > max_chunk_size:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
        else:
            # If adding this paragraph would exceed target size, save current chunk
            if len(current_chunk) + len(paragraph) > target_chunk_size and current_chunk.strip():
                chunks.append(current_chunk.strip())
                current_chunk = paragraph + "\n\n"
            else:
                current_chunk += paragraph + "\n\n"
    
    # Add the last chunk if it has content
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

def chunk_text(text, strategy="smart", chunk_size=1000, overlap=200):
    """
    Splits text into chunks using different strategies.
    
    Args:
        text: Input text to chunk
        strategy: "overlapping" or "smart" 
        chunk_size: Target size for chunks
        overlap: Overlap size for overlapping strategy
    """
    if strategy == "overlapping":
        return chunk_text_overlapping(text, chunk_size, overlap)
    elif strategy == "smart":
        return chunk_text_smart_boundaries(text, chunk_size, chunk_size + 500)
    else:
        # Fallback to original fixed chunking
        return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

def main():
    # Define the path to the OCR output and chunker output directories
    ocr_output_path = Path('/tmp/pipeline_work/ocr_output')
    chunker_output_path = Path('/tmp/pipeline_work/chunker_output')

    # Ensure the output directory exists
    chunker_output_path.mkdir(parents=True, exist_ok=True)

    # Check if OCR output exists
    if not ocr_output_path.exists():
        print("OCR output directory not found")
        return

    text_files = list(ocr_output_path.glob('*.txt'))
    if not text_files:
        print("No text files found in OCR output")
        return

    print(f"Processing {len(text_files)} text files")

    # Read the OCR output files
    for ocr_file in text_files:
        print(f"Chunking: {ocr_file.name}")
        
        with open(ocr_file, 'r', encoding='utf-8') as file:
            text = file.read()

        # Try smart boundary chunking first
        print(f"  Using smart boundary chunking...")
        chunks = chunk_text(text, strategy="smart", chunk_size=1000)
        
        # If smart chunking produces too few chunks, try overlapping
        if len(chunks) < 3:
            print(f"  Smart chunking produced {len(chunks)} chunks, trying overlapping...")
            chunks = chunk_text(text, strategy="overlapping", chunk_size=800, overlap=200)

        # Write the chunks to the chunker output directory
        for i, chunk in enumerate(chunks):
            chunk_file_path = chunker_output_path / f'chunk_{ocr_file.stem}_{i}.txt'
            with open(chunk_file_path, 'w', encoding='utf-8') as chunk_file:
                chunk_file.write(chunk)
        
        print(f"Created {len(chunks)} chunks for {ocr_file.name}")

    print("Text chunking complete")

if __name__ == '__main__':
    main()
