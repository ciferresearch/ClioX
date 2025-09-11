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
import zipfile
import tempfile
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
        self.temp_dir = None  # For storing extracted zip contents
        logger.info(f"Using device: {self.device}")

    def _validate_input(self) -> None:
        if not self._job_details.files:
            logger.warning("No files found")
            raise ValueError("No files found")
        
        # Debug Ocean Protocol job details
        print(f"🐙 Ocean Protocol Debug Info:")
        print(f"   Files object: {self._job_details.files}")
        print(f"   Number of file groups: {len(self._job_details.files.files) if self._job_details.files.files else 0}")
        if self._job_details.files.files:
            for i, file_group in enumerate(self._job_details.files.files):
                print(f"   File group {i}: {file_group}")
                print(f"   Input files: {file_group.input_files}")
        print(f"   Job details type: {type(self._job_details)}")
        print(f"   Available attributes: {dir(self._job_details)}")

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

    def resolve_ocean_protocol_files(self, input_file_refs):
        """Resolve Ocean Protocol file references to actual file paths."""
        resolved_files = []
        
        print(f"🔍 Resolving Ocean Protocol file references: {input_file_refs}")
        
        inputs_dir = Path("/data/inputs")
        
        hash_dirs = [d for d in inputs_dir.iterdir() if d.is_dir()]
        hash_dir = hash_dirs[0]  # Take the first hash directory
        print(f"📁 Found hash directory: {hash_dir.name}")
        
        zero_file = hash_dir / "0"
        print(f"📄 Found Ocean Protocol file: {zero_file}")
        resolved_files.append(zero_file)
        
        if resolved_files:
            print(f"✅ Successfully resolved {len(resolved_files)} file(s)")
        else:
            print("❌ No files found in Ocean Protocol data directory")
        
        return resolved_files

    def extract_zip(self, input_files):
        """Extract zip files and return list of PDF files to process."""
        pdf_files = []
        
        for input_file in input_files:
            file_path = Path(input_file)
            
            print(f"📦 Extracting zip file: {file_path.name}")
            
            # Ocean Protocol always provides zip files without extension

               
                
            # Create temporary directory for extraction
            if not self.temp_dir:
                self.temp_dir = tempfile.mkdtemp(prefix="pdf_rag_zip_")
                print(f"📁 Created temporary directory: {self.temp_dir}")
            
            temp_path = Path(self.temp_dir)
            
            # Extract zip file
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_path)
                    print(f"✅ Successfully extracted {file_path.name}")
                    
                    # Find all PDF files in extracted content
                    extracted_pdfs = []
                    for root, dirs, files in os.walk(temp_path):
                        for file in files:
                            if file.lower().endswith('.pdf'):
                                pdf_path = Path(root) / file
                                extracted_pdfs.append(pdf_path)
                                print(f"   📄 Found PDF: {file}")
                    
                    pdf_files.extend(extracted_pdfs)
                    
            except zipfile.BadZipFile:
                print(f"❌ Error: {file_path.name} is not a valid zip file")
                continue
            except Exception as e:
                print(f"❌ Error extracting {file_path.name}: {str(e)}")
                continue
                    
        
        return pdf_files

    def cleanup_temp_files(self):
        """Clean up temporary extraction directory."""
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir)
                print(f"🧹 Cleaned up temporary directory: {self.temp_dir}")
                self.temp_dir = None
            except Exception as e:
                print(f"⚠️  Warning: Could not clean up temp directory {self.temp_dir}: {str(e)}")
    
    def run(self) -> "Algorithm":
        # Initialize results dictionary
        self.results = {
            'final_output': [],
            'processing_status': {},
            'metadata': {}
        }

        self._validate_input()
        self.ensure_working_directories()
        
        try:
            # Get input files from Ocean Protocol (can be PDFs or zip files)
            input_file_refs = self._job_details.files.files[0].input_files
            print(f"📥 Processing {len(input_file_refs)} input file reference(s): {input_file_refs}")
            
            # Resolve Ocean Protocol file references to actual file paths
            resolved_files = self.resolve_ocean_protocol_files(input_file_refs)
            
            if not resolved_files:
                raise ValueError("No files found in Ocean Protocol data directories")
            
            # Extract zip files and collect all PDF files
            pdf_files = self.extract_zip(resolved_files)
            
            if not pdf_files:
                raise ValueError("No PDF files found to process (checked both direct PDFs and zip file contents)")
            
            print(f"\n📄 Total PDF file(s) to process: {len(pdf_files)}")
            for i, pdf_file in enumerate(pdf_files, 1):
                print(f"   {i}. {pdf_file.name} (from {pdf_file.parent})")
        
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
                'processing_completed': True,
                'total_files_processed': len(pdf_files),
                'extraction_method': 'zip' if self.temp_dir else 'direct'
            }
                
        finally:
            # Always cleanup temporary files even though the tmp is not mounted in docker container to ensure the file not accumulate in the entire lifetime 
            # it can be skiped tho
            self.cleanup_temp_files()
            
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
        
        # # Save processing metadata
        # metadata_path = path / "processing_metadata.json"
        # with open(metadata_path, "w", encoding="utf-8") as f:
        #     try:
        #         json.dump(self.results['metadata'], f, indent=2)
        #         logger.info(f"Saved processing metadata to {metadata_path}")
        #     except Exception as e:
        #         logger.exception(f"Error saving metadata: {e}")
        
        # # Save processing status
        # status_path = path / "processing_status.json"
        # with open(status_path, "w", encoding="utf-8") as f:
        #     try:
        #         json.dump(self.results['processing_status'], f, indent=2)
        #         logger.info(f"Saved processing status to {status_path}")
        #     except Exception as e:
        #         logger.exception(f"Error saving processing status: {e}")
        
        # # Save individual chunks as separate files for easier access
        # if 'final_output' in self.results and isinstance(self.results['final_output'], list):
        #     chunks_dir = path / "chunks"
        #     chunks_dir.mkdir(exist_ok=True)
            
        #     for chunk in self.results['final_output']:
        #         chunk_id = chunk['id']
        #         section_name = chunk['metadata']['section'][:50].replace('/', '_').replace(':', '_')
        #         chunk_path = chunks_dir / f"{chunk_id}_{section_name}.json"
        #         with open(chunk_path, "w", encoding="utf-8") as f:
        #             try:
        #                 json.dump(chunk, f, indent=2, ensure_ascii=False)
        #             except Exception as e:
        #                 logger.exception(f"Error saving chunk {chunk_id}: {e}")
            
        #     logger.info(f"Saved {len(self.results['final_output'])} chunks to {chunks_dir}")
        
        # # Create a summary file
        # summary_path = path / "pipeline_summary.txt"
        # with open(summary_path, "w", encoding="utf-8") as f:
        #     try:
        #         f.write("PDF RAG Pipeline Processing Summary\n")
        #         f.write("=" * 40 + "\n\n")
                
        #         if 'metadata' in self.results:
        #             f.write(f"Processed Files: {', '.join(self.results['metadata'].get('processed_files', []))}\n")
        #             f.write(f"Pipeline Version: {self.results['metadata'].get('pipeline_version', 'Unknown')}\n")
        #             f.write(f"Processing Completed: {self.results['metadata'].get('processing_completed', False)}\n\n")
                
        #         if 'final_output' in self.results and isinstance(self.results['final_output'], list):
        #             f.write(f"Total Structured Chunks: {len(self.results['final_output'])}\n")
        #             if self.results['final_output']:
        #                 # Get source from first chunk metadata
        #                 first_chunk = self.results['final_output'][0]
        #                 f.write(f"Document Source: {first_chunk['metadata'].get('source', 'Unknown')}\n\n")
                
        #         if 'processing_status' in self.results:
        #             f.write("Processing Status:\n")
        #             for step, status in self.results['processing_status'].items():
        #                 f.write(f"  - {step.upper()}: {status}\n")
                
        #         logger.info(f"Saved pipeline summary to {summary_path}")
        #     except Exception as e:
        #         logger.exception(f"Error saving summary: {e}")
