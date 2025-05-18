# FROM python:3.10-alpine
FROM python:3.12-slim

WORKDIR /algorithm

# Copy the algorithm code (with the same depth)
COPY algorithm/src /algorithm/src
COPY algorithm/tests /algorithm/tests
COPY algorithm/requirements.txt /algorithm/requirements.txt
COPY entrypoint.sh /algorithm/entrypoint.sh

# Install the dependencies from the requirements.txt file
RUN pip install --no-cache-dir -r /algorithm/requirements.txt

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Check if running dev & tests
CMD ["sh", "/algorithm/entrypoint.sh"]