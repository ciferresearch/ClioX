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
import gc
import psutil
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
        self.processed_files = []  # Track processed files for recovery
        self.processing_stats = {}  # Track processing statistics
        logger.info(f"Using device: {self.device}")

    def get_memory_usage(self):
        """Get current memory usage in MB."""
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        return memory_info.rss / 1024 / 1024  # Convert to MB

    def cleanup_memory(self):
        """Force garbage collection and memory cleanup."""
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
    def log_memory_usage(self, stage=""):
        """Log current memory usage."""
        memory_mb = self.get_memory_usage()
        print(f"🔍 Memory usage {stage}: {memory_mb:.2f} MB")
        return memory_mb

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
        
        # Check if inputs directory exists
        if not inputs_dir.exists():
            print(f"❌ Inputs directory not found: {inputs_dir}")
            return resolved_files
        
        print(f"📁 Inputs directory found: {inputs_dir}")
        
        # Look for hash directories
        hash_dirs = [d for d in inputs_dir.iterdir() if d.is_dir()]
        
        if not hash_dirs:
            print(f"❌ No hash directories found in {inputs_dir}")
            return resolved_files
        
        # Use the first hash directory (Ocean Protocol standard approach)
        hash_dir = hash_dirs[0]  # Take the first hash directory
        print(f"📁 Found hash directory: {hash_dir.name}")
        
        # Look for file named "0" (the target file)
        zero_file = hash_dir / "0"
        if zero_file.exists():
            print(f"📄 Found Ocean Protocol file: {zero_file}")
            resolved_files.append(zero_file)
        else:
            print(f"⚠️ Target file '0' not found in {hash_dir.name}")
            # List available files for debugging
            available_files = [f.name for f in hash_dir.iterdir() if f.is_file()]
            print(f"📋 Available files in {hash_dir.name}: {available_files}")
        
        if resolved_files:
            print(f"✅ Successfully resolved {len(resolved_files)} file(s)")
        else:
            print("❌ No target files named '0' found in hash directory")
        
        return resolved_files

    def detect_file_type(self, file_path):
        """Detect if a file is PDF, zip, or other type based on content, not just extension."""
        try:
            file_path = Path(file_path)
            
            # Read first few bytes to check file signature
            with open(file_path, 'rb') as f:
                header = f.read(10)
            
            # Check for PDF signature
            if header.startswith(b'%PDF'):
                return 'pdf'
            
            # Check for ZIP signature (PK)
            if header.startswith(b'PK') or \
            header.startswith(b'PK\x03\x04') or \
            header.startswith(b'PK\x05\x06') or \
            header.startswith(b'PK\x07\x08'):
                return 'zip'
            
            return 'unknown'
        
        except Exception as e:
            print(f"⚠️  Warning: Could not detect file type for {file_path}: {e}")
            return 'unknown'

    def extract_files(self, input_files):
        """Extract zip files and return list of PDF files to process."""
        pdf_files = []
        
        for input_file in input_files:
            file_path = Path(input_file)
            
            # First, detect the actual file type
            file_type = self.detect_file_type(file_path)
            print(f"� Analyzing file: {file_path.name} -> Type: {file_type}")
            
            if file_type == 'pdf':
                # Direct PDF file - add it directly
                pdf_files.append(file_path)
                print(f"✅ Added PDF file directly: {file_path.name}")
                
            elif file_type == 'zip':
                # Zip file containing PDFs
                print(f"�📦 Extracting zip file: {file_path.name}")
                            
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
                    
            else:
                print(f"⚠️  Skipping unsupported file type: {file_path.name} (detected as {file_type})")

        return pdf_files

    def extract_and_process_files_streaming(self, input_files):
        """Stream process files one at a time to minimize memory usage."""
        total_processed = 0
        total_failed = 0
        failed_files = []
        
        for input_file in input_files:
            file_path = Path(input_file)
            
            # Log memory usage before processing each file
            self.log_memory_usage(f"before processing {file_path.name}")
            
            # Ocean Protocol file detection: try ZIP first (most common), then PDF
            print(f"📄 Analyzing Ocean Protocol file: {file_path.name}")
            
            # Try as ZIP first (Ocean Protocol standard)
            try:
                print(f"📦 Attempting to process as ZIP file: {file_path.name}")
                
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    # Get list of PDF files in the zip
                    pdf_entries = [name for name in zip_ref.namelist() 
                                 if name.lower().endswith('.pdf') and not name.startswith('__MACOSX/')]
                    
                    print(f"� Found {len(pdf_entries)} PDF files in ZIP")
                    
                    if not pdf_entries:
                        print(f"⚠️ No PDF files found in ZIP: {file_path.name}")
                        failed_files.append(f"{file_path.name} (no PDFs in ZIP)")
                        continue
                    
                    # Process each PDF individually
                    for pdf_entry in pdf_entries:
                        try:
                            print(f"🔄 Extracting and processing: {pdf_entry}")
                            self.log_memory_usage(f"before {pdf_entry}")
                            
                            # Create temporary file for this single PDF
                            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
                                temp_pdf.write(zip_ref.read(pdf_entry))
                                temp_pdf_path = Path(temp_pdf.name)
                            
                            # Process the single PDF
                            success = self.process_single_pdf(temp_pdf_path, source_name=pdf_entry)
                            
                            if success:
                                total_processed += 1
                                self.processed_files.append(pdf_entry)
                                print(f"✅ Processed: {pdf_entry}")
                            else:
                                total_failed += 1
                                failed_files.append(pdf_entry)
                                print(f"❌ Failed to process: {pdf_entry}")
                            
                            # Immediate cleanup of temporary file
                            try:
                                temp_pdf_path.unlink()
                            except:
                                pass
                            
                            # Force memory cleanup after each PDF
                            self.cleanup_memory()
                            self.log_memory_usage(f"after {pdf_entry}")
                            
                        except Exception as e:
                            total_failed += 1
                            failed_files.append(pdf_entry)
                            print(f"❌ Error processing {pdf_entry}: {str(e)}")
                            continue
                            
            except zipfile.BadZipFile:
                # Not a ZIP file, try as direct PDF
                print(f"📄 Not a ZIP file, attempting to process as direct PDF: {file_path.name}")
                
                # Check if it's a PDF by file signature
                file_type = self.detect_file_type(file_path)
                
                if file_type == 'pdf':
                    try:
                        success = self.process_single_pdf(file_path)
                        if success:
                            total_processed += 1
                            self.processed_files.append(file_path.name)
                            print(f"✅ Processed PDF file: {file_path.name}")
                        else:
                            total_failed += 1
                            failed_files.append(file_path.name)
                            print(f"❌ Failed to process PDF file: {file_path.name}")
                    except Exception as e:
                        total_failed += 1
                        failed_files.append(file_path.name)
                        print(f"❌ Exception processing PDF file {file_path.name}: {str(e)}")
                else:
                    print(f"⚠️ Unsupported file type: {file_path.name} (detected as {file_type})")
                    failed_files.append(f"{file_path.name} (unsupported type: {file_type})")
                    
            except Exception as e:
                print(f"❌ Error processing file {file_path.name}: {str(e)}")
                total_failed += 1
                failed_files.append(f"{file_path.name} (processing error)")
                continue
            
            # Cleanup memory after processing each input file
            self.cleanup_memory()
            self.log_memory_usage(f"after processing {file_path.name}")

        # Print processing summary
        print(f"\n📊 Processing Summary:")
        print(f"   ✅ Successfully processed: {total_processed} PDFs")
        print(f"   ❌ Failed to process: {total_failed} PDFs")
        
        if failed_files:
            print(f"📋 Failed files:")
            for i, failed_file in enumerate(failed_files, 1):
                print(f"   {i}. {failed_file}")
        
        # Store processing stats for metadata
        self.processing_stats = {
            'total_processed': total_processed,
            'total_failed': total_failed,
            'failed_files': failed_files,
            'success_rate': total_processed / (total_processed + total_failed) if (total_processed + total_failed) > 0 else 0
        }
        
        print(f"🎯 Overall success rate: {self.processing_stats['success_rate']:.1%}")
        
        # Return True if at least one file was processed successfully
        return total_processed > 0

    def process_single_pdf(self, pdf_path, source_name=None):
        """Process a single PDF file through the entire pipeline with robust error handling."""
        display_name = source_name or pdf_path.name
        error_log = []
        
        try:
            print(f"🔄 Processing PDF: {display_name}")
            
            # Step 1: OCR Processing for single file
            try:
                ocr_success = self.run_pipeline_step("ocr/ocr_processor.py", f"[OCR] || for {display_name}", [pdf_path])
                if not ocr_success:
                    error_msg = f"OCR processing failed for {display_name}"
                    error_log.append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
            except Exception as e:
                error_msg = f"OCR processing error for {display_name}: {str(e)}"
                error_log.append(error_msg)
                print(f"❌ {error_msg}")
                return False
            
            # Step 2: Text Chunking for the OCR output of this file
            try:
                chunker_success = self.run_pipeline_step("chunker/text_chunker.py", f"[Chunking] || for {display_name}")
                if not chunker_success:
                    error_msg = f"Text chunking failed for {display_name}"
                    error_log.append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
            except Exception as e:
                error_msg = f"Text chunking error for {display_name}: {str(e)}"
                error_log.append(error_msg)
                print(f"❌ {error_msg}")
                return False
            
            # Step 3: Content Structuring for the chunks of this file
            try:
                structurer_success = self.run_pipeline_step("structurer/content_structurer.py", f"[Structuring] || for {display_name}")
                if not structurer_success:
                    error_msg = f"Content structuring failed for {display_name}"
                    error_log.append(error_msg)
                    print(f"❌ {error_msg}")
                    return False
            except Exception as e:
                error_msg = f"Content structuring error for {display_name}: {str(e)}"
                error_log.append(error_msg)
                print(f"❌ {error_msg}")
                return False
            
            print(f"✅ Successfully processed: {display_name}")
            return True
            
        except Exception as e:
            error_msg = f"Unexpected error processing {display_name}: {str(e)}"
            error_log.append(error_msg)
            print(f"❌ {error_msg}")
            
            # Log all errors for this file
            if error_log:
                print(f"📋 Error summary for {display_name}:")
                for i, error in enumerate(error_log, 1):
                    print(f"   {i}. {error}")
            
            return False

    def aggregate_final_results(self):
        """Aggregate final results from all processed files."""
        final_output_path = Path("/tmp/pipeline_work/final_output/structured_output.json")
        if final_output_path.exists():
            try:
                with open(final_output_path, 'r', encoding='utf-8') as f:
                    self.results['final_output'] = json.load(f)
                print(f"📊 Loaded {len(self.results['final_output'])} chunks from final output")
            except Exception as e:
                print(f"⚠️ Error loading final output: {e}")
                self.results['final_output'] = []
        else:
            print("⚠️ No final structured output found")
            self.results['final_output'] = []

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
        print("🚀 Starting PDF RAG Pipeline Algorithm")
        print(f"📊 Python process ID: {os.getpid()}")
        
        # Initialize results dictionary
        self.results = {
            'final_output': [],
            'processing_status': {},
            'metadata': {}
        }

        try:
            print("🔍 Step 1: Validating input...")
            self._validate_input()
            
            print("🔍 Step 2: Setting up working directories...")
            self.ensure_working_directories()
            
            # Log initial memory usage
            self.log_memory_usage("at start")
            
            print("🔍 Step 3: Resolving file references...")
            # Get input files from Ocean Protocol (can be PDFs or zip files)
            input_file_refs = self._job_details.files.files[0].input_files
            print(f"📥 Processing {len(input_file_refs)} input file reference(s): {input_file_refs}")
            
            # Resolve Ocean Protocol file references to actual file paths
            resolved_files = self.resolve_ocean_protocol_files(input_file_refs)
            
            if not resolved_files:
                raise ValueError("No files found in Ocean Protocol data directories")
            
            print("🔍 Step 4: Starting file processing...")
            # Process files using streaming approach (one PDF at a time)
            print("\n🚀 Starting Streaming PDF RAG Pipeline")
            print("=" * 50)
            
            success = self.extract_and_process_files_streaming(resolved_files)
            
            if not success:
                raise ValueError("No PDF files were successfully processed")
            
            print("\n🔍 Step 5: Aggregating final results...")
            # Aggregate final results from all processed files
            print("\n📊 Aggregating results...")
            self.aggregate_final_results()
            
            # Mark processing as completed
            self.results['processing_status']['streaming_pipeline'] = 'completed'
            
            print(f"\n✅ Streaming pipeline completed successfully!")
            print(f"📋 Processed files: {len(self.processed_files)}")
            
            # Add processing metadata
            self.results['metadata'] = {
                'pipeline_version': '2.0-streaming',
                'processed_files': self.processed_files,
                'total_processing_steps': 3,
                'processing_completed': True,
                'total_files_processed': len(self.processed_files),
                'extraction_method': 'streaming',
                'processing_stats': self.processing_stats if hasattr(self, 'processing_stats') else {},
                'memory_optimized': True
            }
                
        except Exception as e:
            print(f"❌ Critical error in pipeline: {str(e)}")
            print(f"📍 Error type: {type(e).__name__}")
            import traceback
            print(f"📍 Full traceback: {traceback.format_exc()}")
            raise
        finally:
            # Always cleanup temporary files 
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
