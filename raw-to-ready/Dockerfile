FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY raw-to-ready/backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY raw-to-ready/backend ./backend

# Expose port (Railway injects $PORT at runtime)
EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
