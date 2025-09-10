import os
import pytesseract
from pdf2image import convert_from_path
from pathlib import Path

def process_pdf_ocr(pdf_path, output_dir):
    """Extract text from a PDF file using OCR."""
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path)
        
        # Extract text from each image
        full_text = ''
        for i, image in enumerate(images):
            page_text = pytesseract.image_to_string(image)
            full_text += f"\n--- Page {i+1} ---\n{page_text}\n"
        
        return full_text
    except Exception as e:
        print(f"Error processing {pdf_path}: {str(e)}")
        return None

def main():
    import os
    output_dir = Path('/tmp/pipeline_work/ocr_output')
    
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get input files from environment variable or fallback to shared volumes
    input_paths_env = os.environ.get('INPUT_PATHS')
    if input_paths_env:
        pdf_files = [Path(p) for p in input_paths_env.split(',') if Path(p).suffix.lower() == '.pdf']
        print(f"Processing files from direct paths: {len(pdf_files)} files")
    else:
        # Fallback to shared volumes approach
        input_dir = Path('/shared_volumes/input')
        pdf_files = list(input_dir.glob('*.pdf'))
        print(f"Processing files from shared volumes: {len(pdf_files)} files")
    
    if not pdf_files:
        print("No PDF files found to process")
        return
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        
        # Extract text using OCR
        extracted_text = process_pdf_ocr(pdf_file, output_dir)
        
        if extracted_text:
            # Write the extracted text to a text file in the output directory
            output_file_path = output_dir / f'{pdf_file.stem}.txt'
            with open(output_file_path, 'w', encoding='utf-8') as output_file:
                output_file.write(extracted_text)
            print(f"OCR completed for {pdf_file.name} -> {output_file_path.name}")
        else:
            print(f"Failed to process {pdf_file.name}")
    
    print("OCR processing complete")

if __name__ == '__main__':
    main()
