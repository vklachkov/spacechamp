FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y chromium

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENTRYPOINT [ "python3", "-u", "/app/app.py" ]