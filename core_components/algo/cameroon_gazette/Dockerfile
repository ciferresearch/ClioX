# Dockerfile
# ARG TARGETPLATFORM=linux/amd64
# FROM --platform=${TARGETPLATFORM} python:3.11-slim
FROM python:3.11-slim


WORKDIR /algorithm

# Copy the algorithm code (with the same depth)
COPY algorithm/src /algorithm/src
COPY algorithm/tests /algorithm/tests
COPY algorithm/requirements.txt /algorithm/requirements.txt
COPY entrypoint.sh /algorithm/entrypoint.sh

# Install the dependencies from the requirements.txt file
RUN pip install --no-cache-dir -r /algorithm/requirements.txt

COPY algorithm/src/implementation/nltk_data /usr/share/nltk_data
ENV NLTK_DATA=/usr/share/nltk_data

COPY algorithm/src/implementation/models/en_core_web_sm /usr/local/lib/python3.12/site-packages/en_core_web_sm
RUN python -m spacy link en_core_web_sm en_core_web_sm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Check if running dev & tests
# CMD ["sh", "/algorithm/entrypoint.sh"]
CMD ["python", "/algorithm/src/main.py"]