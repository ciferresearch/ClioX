# FROM python:3.10-alpine
FROM --platform=linux/amd64 python:3.12-slim

WORKDIR /algorithm

# Copy the algorithm code (with the same depth)
COPY algorithm/src /algorithm/src
COPY algorithm/tests /algorithm/tests
COPY algorithm/requirements.txt /algorithm/requirements.txt
COPY entrypoint.sh /algorithm/entrypoint.sh

# Install the dependencies from the requirements.txt file
RUN pip install --no-cache-dir -r /algorithm/requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt_tab'); nltk.download('punkt'); nltk.download('stopwords')"

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

CMD ["python", "/algorithm/src/main.py"]