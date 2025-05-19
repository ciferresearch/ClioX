FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt /tmp/

# Download spaCy model
RUN pip install -r /tmp/requirements.txt

RUN python -m spacy download en_core_web_sm