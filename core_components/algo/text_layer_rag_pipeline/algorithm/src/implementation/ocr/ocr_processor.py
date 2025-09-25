import os
import io
import gc
import json
import hashlib
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
from PIL import Image
import pytesseract


# ---------------------
# Config via env vars
# ---------------------
OUTPUT_DIR = Path(os.environ.get("OCR_OUTPUT_DIR", "/tmp/pipeline_work/ocr_output"))
CACHE_DIR = Path(os.environ.get("OCR_CACHE_DIR", "/tmp/pipeline_work/ocr_cache"))
MIN_CHARS = int(os.environ.get("OCR_MIN_CHARS", "200"))
OCR_DPI = int(os.environ.get("OCR_DPI", "300"))
TESS_LANG = os.environ.get("TESS_LANG", "eng")
PIPELINE_VERSION = os.environ.get("PIPELINE_VERSION", "v1-textlayer-fallback")


def page_cache_key(pdf_bytes: bytes, page_index: int, version: str) -> str:
    h = hashlib.sha256()
    h.update(pdf_bytes) # entire PDF file’s bytes
    h.update(str(page_index).encode())
    h.update(version.encode())
    return h.hexdigest()

# Convert a PyMuPDF page to a PIL image for OCR （Tesseract）
def pixmap_to_pil(page: fitz.Page, dpi: int = 300) -> Image.Image:
    scale = dpi / 72.0
    matrix = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    img_bytes = pix.tobytes("png")
    return Image.open(io.BytesIO(img_bytes))


def extract_text_or_ocr(doc: fitz.Document, pdf_bytes: bytes) -> str:
    parts = []
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    for i, page in enumerate(doc):
        cache_key = page_cache_key(pdf_bytes, i, PIPELINE_VERSION)
        cache_path = CACHE_DIR / f"{cache_key}.txt"

        if cache_path.exists():
            try:
                parts.append(cache_path.read_text(encoding="utf-8"))
                continue
            except Exception:
                pass

        # text layer
        try:
            txt = page.get_text("text") or ""
        except Exception:
            txt = ""

        text_to_use: Optional[str] = None

        if len(txt.strip()) >= MIN_CHARS:
            text_to_use = txt
        else:
            # Fallback to OCR for this page only
            try:
                print("#### fall back to OCR #####")
                img = pixmap_to_pil(page, dpi=OCR_DPI)
                ocr_text = pytesseract.image_to_string(img, lang=TESS_LANG)
                text_to_use = ocr_text or ""
            except Exception as e:
                print(f"⚠️ OCR failed on page {i+1}: {e}")
                text_to_use = txt  # at least keep whatever text was available
            finally:
                del img
                gc.collect()
                

        # Write per-page cache
        try:
            page_header = f"\n--- Page {i+1} ---\n" # add apge header for better metadata retrival 
            final_text = page_header + (text_to_use or "")
            cache_path.write_text(final_text, encoding="utf-8")
        except Exception as e:
            print(f"⚠️ Failed to write cache for page {i+1}: {e}")

        parts.append(final_text)

    return "\n".join(parts)


def process_pdf(pdf_path: Path) -> Optional[str]:
    try:
        pdf_bytes = pdf_path.read_bytes()
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            print(f"🔄 Processing '{pdf_path.name}' with {doc.page_count} pages (fast text-layer + OCR fallback)")
            return extract_text_or_ocr(doc, pdf_bytes)
    except Exception as e:
        print(f"❌ Error opening PDF '{pdf_path}': {e}")
        return None


def main():
    # Ensure output dirs
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Check for source name override (for orchestrated processing)
    source_name_env = os.environ.get("SOURCE_NAME")
    
    input_paths_env = os.environ.get("INPUT_PATHS")
    if input_paths_env:
        pdf_files = [Path(p) for p in input_paths_env.split(",") if Path(p).suffix.lower() == ".pdf"]
        print(f"🔄 Processing files from direct paths: {len(pdf_files)} files")
    else:
        input_dir = Path("/shared_volumes/input")
        if input_dir.exists():
            pdf_files = list(input_dir.glob("*.pdf"))
            print(f"🔄 Processing files from shared volumes: {len(pdf_files)} files")
        else:
            print("❌ No input source available (neither INPUT_PATHS nor shared volumes)")
            return

    if not pdf_files:
        print("⚠️ No PDF files found to process")
        return

    for pdf_file in pdf_files:
        print(f"\n🔄 Starting extraction: {pdf_file.name}")
        text = process_pdf(pdf_file)
        if text is None:
            print(f"❌ Failed to process {pdf_file.name}")
            continue

        # Use source name if provided, otherwise use the file's stem
        if source_name_env:
            # Remove any path and extension from source name to get clean stem
            source_stem = Path(source_name_env).stem
            out_filename = f"{source_stem}.txt"
            print(f"📝 Using source name: {source_name_env} -> {out_filename}")
        else:
            out_filename = f"{pdf_file.stem}.txt"
        
        out_path = OUTPUT_DIR / out_filename
        try:
            out_path.write_text(text, encoding="utf-8")
        except Exception as e:
            print(f"❌ Failed to write output for {out_filename}: {e}")
        finally:
            gc.collect()

    print("🎯 OCR/text extraction complete")


if __name__ == "__main__":
    main()
