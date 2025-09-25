FROM python:3.9-slim

WORKDIR /app

COPY text_chunker.py .
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "text_chunker.py"]