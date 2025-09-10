from logging import getLogger
from pathlib import Path
from typing import Any, Optional, TypeVar
from oceanprotocol_job_details.ocean import JobDetails

import json
import torch
import subprocess
import time
import sys
import shutil
import os
from pathlib import Path


T = TypeVar("T")

logger = getLogger(__name__)

_ResultType = Any


class Algorithm:
    # Add these class variables at the beginning of the Algorithm class
    tokenizer = None
    sentiment_classifier = None
    device = None

    def __init__(self, job_details: JobDetails):
        self._job_details = job_details
        self.results = {}  # Initialize as empty dictionary instead of None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

    def _validate_input(self) -> None:
        if not self._job_details.files:
            logger.warning("No files found")
            raise ValueError("No files found")

    def run_pipeline_step(self, script_name, step_name, input_paths=None):
        """Run a pipeline step directly (no docker-compose needed in single image)."""
        try:
            print(f"🔄 Starting {step_name}...")
            
            # Get the full path to the script in the algorithm directory
            script_path = Path(__file__).parent / script_name
            
            # Set environment variables for input paths if provided
            env = {}
            if input_paths:
                env['INPUT_PATHS'] = ','.join(str(p) for p in input_paths)
            
            result = subprocess.run(
                [sys.executable, str(script_path)],
                capture_output=True,
                text=True,
                check=True,
                cwd="/algorithm",
                env={**os.environ, **env} if env else None
            )
            
            if result.stdout:
                print(f"📝 {step_name} output:")
                print(result.stdout)
            
            print(f"✅ {step_name} completed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ {step_name} failed:")
            print(f"Error: {e}")
            if e.stdout:
                print(f"Stdout: {e.stdout}")
            if e.stderr:
                print(f"Stderr: {e.stderr}")
            return False

    def ensure_working_directories(self):
        """Ensure working directories exist for intermediate processing."""
        directories = [
            Path("/tmp/pipeline_work/ocr_output"), 
            Path("/tmp/pipeline_work/chunker_output"), 
            Path("/tmp/pipeline_work/final_output")
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"📁 Working directory created: {directory}")
    
    def run(self) -> "Algorithm":
        # Initialize results dictionary
        self.results = {
            'final_output': [],
            'processing_status': {},
            'metadata': {}
        }

        self._validate_input()
        self.ensure_working_directories()
        
        # Get input PDF files directly from Ocean Protocol
        input_files = self._job_details.files.files[0].input_files
        pdf_files = [Path(f) for f in input_files if Path(f).suffix.lower() == '.pdf']
        
        if not pdf_files:
            raise ValueError("No PDF files found to process")
        
        print(f"📄 Found {len(pdf_files)} PDF file(s) to process:")
        for pdf_file in pdf_files:
            print(f"   - {pdf_file.name} (from {pdf_file.parent})")
        
        # Run PDF RAG Pipeline in sequence
        print("\n🚀 Starting PDF RAG Pipeline")
        print("=" * 50)
        
        # Step 1: OCR Processing
        print("\n📖 Step 1: OCR Processing")
        print("-" * 30)
        if not self.run_pipeline_step("ocr/ocr_processor.py", "OCR Processing", pdf_files):
            raise RuntimeError("OCR processing failed")
        self.results['processing_status']['ocr'] = 'completed'
        
        # Step 2: Text Chunking
        print("\n✂️  Step 2: Text Chunking")
        print("-" * 30)
        if not self.run_pipeline_step("chunker/text_chunker.py", "Text Chunking"):
            raise RuntimeError("Text chunking failed")
        self.results['processing_status']['chunker'] = 'completed'
        
        # Step 3: Content Structuring
        print("\n🏗️  Step 3: Content Structuring")
        print("-" * 30)
        if not self.run_pipeline_step("structurer/content_structurer.py", "Content Structuring"):
            raise RuntimeError("Content structuring failed")
        self.results['processing_status']['structurer'] = 'completed'
        
        # Load the final structured output
        final_output_path = Path("/tmp/pipeline_work/final_output/structured_output.json")
        if final_output_path.exists():
            with open(final_output_path, 'r', encoding='utf-8') as f:
                self.results['final_output'] = json.load(f)
            print(f"\n✅ Pipeline completed successfully!")
            print(f"📊 Processed {len(self.results['final_output'])} chunks")
            print(f"📋 Extracted {len(self.results['final_output'])} sections")
        else:
            raise RuntimeError("Final structured output not found")
        
        # Add processing metadata
        self.results['metadata'] = {
            'pipeline_version': '1.0',
            'processed_files': [f.name for f in pdf_files],
            'total_processing_steps': 3,
            'processing_completed': True
        }
            
        return self
    

    def save_result(self, path: Path) -> None:
        # Save structured PDF output
        structured_output_path = path / "structured_output.json"
        with open(structured_output_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['final_output'], f, indent=2, ensure_ascii=False)
                logger.info(f"Saved structured PDF output to {structured_output_path}")
            except Exception as e:
                logger.exception(f"Error saving structured output: {e}")
        
        # Save processing metadata
        metadata_path = path / "processing_metadata.json"
        with open(metadata_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['metadata'], f, indent=2)
                logger.info(f"Saved processing metadata to {metadata_path}")
            except Exception as e:
                logger.exception(f"Error saving metadata: {e}")
        
        # Save processing status
        status_path = path / "processing_status.json"
        with open(status_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['processing_status'], f, indent=2)
                logger.info(f"Saved processing status to {status_path}")
            except Exception as e:
                logger.exception(f"Error saving processing status: {e}")
        
        # Save individual chunks as separate files for easier access
        if 'final_output' in self.results and isinstance(self.results['final_output'], list):
            chunks_dir = path / "chunks"
            chunks_dir.mkdir(exist_ok=True)
            
            for chunk in self.results['final_output']:
                chunk_id = chunk['id']
                section_name = chunk['metadata']['section'][:50].replace('/', '_').replace(':', '_')
                chunk_path = chunks_dir / f"{chunk_id}_{section_name}.json"
                with open(chunk_path, "w", encoding="utf-8") as f:
                    try:
                        json.dump(chunk, f, indent=2, ensure_ascii=False)
                    except Exception as e:
                        logger.exception(f"Error saving chunk {chunk_id}: {e}")
            
            logger.info(f"Saved {len(self.results['final_output'])} chunks to {chunks_dir}")
        
        # Create a summary file
        summary_path = path / "pipeline_summary.txt"
        with open(summary_path, "w", encoding="utf-8") as f:
            try:
                f.write("PDF RAG Pipeline Processing Summary\n")
                f.write("=" * 40 + "\n\n")
                
                if 'metadata' in self.results:
                    f.write(f"Processed Files: {', '.join(self.results['metadata'].get('processed_files', []))}\n")
                    f.write(f"Pipeline Version: {self.results['metadata'].get('pipeline_version', 'Unknown')}\n")
                    f.write(f"Processing Completed: {self.results['metadata'].get('processing_completed', False)}\n\n")
                
                if 'final_output' in self.results and isinstance(self.results['final_output'], list):
                    f.write(f"Total Structured Chunks: {len(self.results['final_output'])}\n")
                    if self.results['final_output']:
                        # Get source from first chunk metadata
                        first_chunk = self.results['final_output'][0]
                        f.write(f"Document Source: {first_chunk['metadata'].get('source', 'Unknown')}\n\n")
                
                if 'processing_status' in self.results:
                    f.write("Processing Status:\n")
                    for step, status in self.results['processing_status'].items():
                        f.write(f"  - {step.upper()}: {status}\n")
                
                logger.info(f"Saved pipeline summary to {summary_path}")
            except Exception as e:
                logger.exception(f"Error saving summary: {e}")
