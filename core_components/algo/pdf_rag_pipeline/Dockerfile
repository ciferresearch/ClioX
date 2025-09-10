# Multi-Stage Dockerfile for PDF RAG Pipeline
# Combines OCR, Chunking, and Structuring services into a single image

ARG TARGETPLATFORM=linux/amd64

# Base stage with system dependencies
FROM --platform=${TARGETPLATFORM} python:3.11-slim AS base

# Install system dependencies for OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /algorithm

# Stage 1: Dependencies
FROM base AS dependencies

# Copy all requirements files from algorithm structure
COPY algorithm/src/implementation/ocr/requirements.txt ./ocr_requirements.txt
COPY algorithm/src/implementation/chunker/requirements.txt ./chunker_requirements.txt  
COPY algorithm/src/implementation/structurer/requirements.txt ./structurer_requirements.txt
COPY algorithm/requirements.txt ./algorithm_requirements.txt

# Create combined requirements file
RUN cat algorithm_requirements.txt > combined_requirements.txt && \
    cat ocr_requirements.txt >> combined_requirements.txt && \
    cat chunker_requirements.txt >> combined_requirements.txt && \
    cat structurer_requirements.txt >> combined_requirements.txt && \
    sort combined_requirements.txt | uniq > final_requirements.txt

# Install all dependencies
RUN pip install --no-cache-dir -r final_requirements.txt

# Stage 2: Application
FROM base AS application

# Copy installed packages from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy the algorithm code (with the same depth)
COPY algorithm/src /algorithm/src
COPY algorithm/tests /algorithm/tests
COPY algorithm/requirements.txt /algorithm/requirements.txt
COPY entrypoint.sh /algorithm/entrypoint.sh

# Copy the algorithm directory structure (Ocean Protocol format)
COPY algorithm/ ./algorithm/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/algorithm

# Create shared volumes directory structure
RUN mkdir -p /shared_volumes/{input,ocr_output,chunker_output,final_output}

# Set the entry point to run the Ocean Protocol algorithm
CMD ["python", "/algorithm/src/main.py"]
