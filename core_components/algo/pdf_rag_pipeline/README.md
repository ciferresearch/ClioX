# PDF RAG Pipeline

A containerized pipeline for processing PDF documents through OCR, text chunking, and content structuring. This pipeline is designed for pure backend processing without any web interface.

## Architecture

The pipeline consists of three sequential Docker containers:

1. **OCR Service** (`ocr/`) - Extracts text from PDF files using Tesseract OCR
2. **Chunker Service** (`chunker/`) - Splits extracted text into manageable chunks
3. **Structurer Service** (`structurer/`) - Analyzes and structures the chunks into organized sections

All services communicate through shared volumes, eliminating the need for web APIs or network communication.

## Directory Structure

```
pdf_rag_pipeline/
├── ocr/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── chunker/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── structurer/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── shared_volumes/
│   ├── input/          # Place PDF files here
│   ├── ocr_output/     # OCR extracted text
│   ├── chunker_output/ # Text chunks
│   └── final_output/   # Structured results
├── docker-compose.yml
├── run_pipeline.py     # Python pipeline runner
├── run_pipeline.sh     # Shell pipeline runner
└── README.md
```

## Prerequisites

- Docker and Docker Compose installed
- PDF files to process

## Quick Start

1. **Place PDF files** in the `shared_volumes/input/` directory:
   ```bash
   cp your_document.pdf shared_volumes/input/
   ```

2. **Run the pipeline** using either method:
   
   **Option A: Shell script (recommended)**
   ```bash
   ./run_pipeline.sh
   ```
   
   **Option B: Python script**
   ```bash
   python run_pipeline.py
   ```
   
   **Option C: Manual Docker Compose**
   ```bash
   # Run each service sequentially
   docker-compose run --rm ocr
   docker-compose run --rm chunker
   docker-compose run --rm structurer
   ```

3. **Check results** in `shared_volumes/final_output/structured_output.json`

## Pipeline Flow

```
PDF Files → OCR → Text Files → Chunker → Text Chunks → Structurer → JSON Output
```

### Step 1: OCR Processing
- Converts PDF pages to images
- Extracts text using Tesseract OCR
- Outputs: `{filename}.txt` files in `ocr_output/`

### Step 2: Text Chunking
- Splits text into manageable chunks (default: 1000 characters)
- Outputs: `chunk_{filename}_{index}.txt` files in `chunker_output/`

### Step 3: Content Structuring
- Analyzes chunks for section headers and structure
- Extracts metadata and organizes content
- Outputs: `structured_output.json` in `final_output/`

## Configuration

### OCR Service
- Supports multiple languages (default: English)
- Customizable in `ocr/app.py`

### Chunker Service
- Default chunk size: 1000 characters
- Modify `chunk_size` parameter in `chunker/app.py`

### Structurer Service
- Automatic section detection using regex patterns
- Customizable patterns in `structurer/app.py`

## Output Format

The structured output is a JSON file with the following format:

```json
{
  "document_sections": [
    {
      "source_chunk": "chunk_document_0.txt",
      "title": "Introduction",
      "content": "Document content...",
      "word_count": 150
    }
  ],
  "metadata": {
    "total_chunks_processed": 5,
    "total_sections_extracted": 12
  }
}
```

## Development

### Building Services
```bash
docker-compose build
```

### Running Individual Services
```bash
# OCR only
docker-compose run --rm ocr

# Chunker only (requires OCR output)
docker-compose run --rm chunker

# Structurer only (requires chunker output)
docker-compose run --rm structurer
```

### Debugging
- Check logs: `docker-compose logs [service_name]`
- Inspect volumes: `docker volume inspect pdf_rag_pipeline_shared_volumes`
- Access container: `docker-compose run --rm [service_name] bash`

## Troubleshooting

### Common Issues

1. **No PDF files found**
   - Ensure PDF files are in `shared_volumes/input/`
   - Check file permissions

2. **OCR fails**
   - Verify Tesseract installation in container
   - Check PDF file format compatibility

3. **Empty output**
   - Check intermediate outputs in shared volumes
   - Verify services ran in correct order

### Error Logs
Each service outputs detailed logs. Check them with:
```bash
docker-compose run --rm [service_name]
```

## Performance Notes

- OCR processing time depends on PDF size and complexity
- Memory usage scales with document size
- Consider adjusting chunk size for very large documents

## Future Enhancements

- Support for multiple languages in OCR
- Advanced text preprocessing
- Vector embedding generation
- Integration with vector databases
- Parallel processing for multiple PDFs
