# Use Python 3.12 as base image
FROM python:3.12-slim

# Set working directory
WORKDIR /algorithm

# Copy requirements file first for better caching
COPY requirements.txt .

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Download required NLTK data
RUN python -m nltk.downloader punkt stopwords punkt_tab

# Copy the application code 
COPY *.py /algorithm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Command to run the application
CMD ["sh", "/algorithm/entrypoint.sh"]