# Use Python 3.9 as base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download required NLTK data
RUN python -m nltk.downloader punkt stopwords punkt_tab

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy the application code
COPY core-components/algo/text_sentiment /app/

# Create directories for static files
RUN mkdir -p /app/static/outputs /app/static/data

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["python", "main.py"] 