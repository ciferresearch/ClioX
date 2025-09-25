FROM python:3.9-slim

WORKDIR /app

COPY content_structurer.py .
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "content_structurer.py"]