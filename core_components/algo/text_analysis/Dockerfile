# FROM python:3.10-alpine
FROM python:3.12-slim

WORKDIR /algorithm

# Copy the algorithm code (with the same depth)
COPY algorithm/src /algorithm/src
COPY algorithm/tests /algorithm/tests
COPY algorithm/requirements.txt /algorithm/requirements.txt
COPY entrypoint.sh /algorithm/entrypoint.sh


COPY algorithm/src/implementation/nltk_data /usr/share/nltk_data
ENV NLTK_DATA=/usr/share/nltk_data

# Install the dependencies from the requirements.txt file
RUN pip install --no-cache-dir -r /algorithm/requirements.txt

# COPY algorithm/src/implementation/models/en_core_web_sm /usr/local/lib/python3.12/site-packages/en_core_web_sm
# RUN python -m spacy link en_core_web_sm en_core_web_sm

COPY en_core_web_sm-3.8.0-py3-none-any.whl /tmp/
RUN pip install /tmp/en_core_web_sm-3.8.0-py3-none-any.whl


ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Check if running dev & tests
# CMD ["sh", "/algorithm/entrypoint.sh"]
CMD ["python", "/algorithm/src/main.py"]