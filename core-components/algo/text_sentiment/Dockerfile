# FROM python:3.12-slim

# RUN apt-get update && apt-get install -y \
#     build-essential \
#     && rm -rf /var/lib/apt/lists/*

# COPY requirements.txt /tmp/

# RUN pip install --upgrade pip \
#     && pip install -r /tmp/requirements.txt \
#     && python -m spacy download en_core_web_sm

FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/
RUN pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt \
    && python -m spacy download en_core_web_sm

WORKDIR /algo
