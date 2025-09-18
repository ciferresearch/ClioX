import os
import gc
import pytesseract
from pdf2image import convert_from_path
from pathlib import Path

def process_pdf_ocr(pdf_path, output_dir):
    """Extract text from a PDF file using OCR with memory-efficient page processing."""
    try:
        print(f"🔄 Starting OCR for: {pdf_path}")
        
        # Process PDF page by page to reduce memory usage
        full_text = ''
        page_count = 0
        
        # First, get the total number of pages
        try:
            # Use convert_from_path with first_page and last_page to get page count
            test_images = convert_from_path(pdf_path, first_page=1, last_page=1)
            if not test_images:
                print(f"❌ No pages found in PDF: {pdf_path}")
                return None
            del test_images  # Immediately clean up
            gc.collect()
        except Exception as e:
            print(f"❌ Error accessing PDF pages: {e}")
            return None
        
        # Process pages in small batches to manage memory
        batch_size = 3  # Process 3 pages at a time
        page_num = 1
        
        while True:
            try:
                # Convert a batch of pages to images
                images = convert_from_path(
                    pdf_path, 
                    first_page=page_num, 
                    last_page=page_num + batch_size - 1
                )
                
                if not images:
                    break  # No more pages
                
                # Process each image in the batch
                for i, image in enumerate(images):
                    current_page = page_num + i
                    print(f"📄 Processing page {current_page}")
                    
                    # Extract text from this page
                    page_text = pytesseract.image_to_string(image)
                    full_text += f"\n--- Page {current_page} ---\n{page_text}\n"
                    page_count += 1
                    
                    # Clear the image from memory immediately
                    del image
                
                # Clear the batch from memory
                del images
                gc.collect()
                
                page_num += batch_size
                
            except Exception as e:
                print(f"⚠️ Error processing pages starting from {page_num}: {e}")
                break
        
        if page_count > 0:
            print(f"✅ OCR completed: {page_count} pages processed")
            return full_text
        else:
            print(f"❌ No pages were successfully processed")
            return None
            
    except Exception as e:
        print(f"❌ Error processing {pdf_path}: {str(e)}")
        return None

def main():
    import os
    output_dir = Path('/tmp/pipeline_work/ocr_output')
    
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get input files from environment variable (single file processing)
    input_paths_env = os.environ.get('INPUT_PATHS')
    if input_paths_env:
        pdf_files = [Path(p) for p in input_paths_env.split(',') if Path(p).suffix.lower() == '.pdf']
        print(f"🔄 Processing files from direct paths: {len(pdf_files)} files")
    else:
        # Fallback to shared volumes approach
        input_dir = Path('/shared_volumes/input')
        if input_dir.exists():
            pdf_files = list(input_dir.glob('*.pdf'))
            print(f"🔄 Processing files from shared volumes: {len(pdf_files)} files")
        else:
            print("❌ No input source available (neither INPUT_PATHS nor shared volumes)")
            return
    
    if not pdf_files:
        print("⚠️ No PDF files found to process")
        return
    
    # Process each PDF file individually with memory management
    for pdf_file in pdf_files:
        print(f"\n🔄 Starting OCR processing: {pdf_file.name}")
        
        # Extract text using OCR with memory-efficient processing
        extracted_text = process_pdf_ocr(pdf_file, output_dir)
        
        if extracted_text:
            # Write the extracted text to a text file in the output directory
            output_file_path = output_dir / f'{pdf_file.stem}.txt'
            try:
                with open(output_file_path, 'w', encoding='utf-8') as output_file:
                    output_file.write(extracted_text)
                # print(f"✅ OCR completed for {pdf_file.name} -> {output_file_path.name}")
            except Exception as e:
                print(f"❌ Failed to write OCR output for {pdf_file.name}: {e}")
        else:
            print(f"❌ Failed to process {pdf_file.name}")
        
        # Force garbage collection after each file
        gc.collect()
    
    print("🎯 OCR processing complete")

if __name__ == '__main__':
    main()
