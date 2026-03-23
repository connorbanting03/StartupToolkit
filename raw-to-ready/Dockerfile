# ─────────────────────────────────────────────────────────────
# Stage 1: Build Next.js frontend (standalone output)
# ─────────────────────────────────────────────────────────────
FROM node:20-slim AS frontend

WORKDIR /app/frontend

COPY raw-to-ready/frontend/package.json raw-to-ready/frontend/package-lock.json ./
RUN npm ci

COPY raw-to-ready/frontend/ ./

# Injected at build time via Railway build variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Final runtime image (Python + Node)
# ─────────────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Install Node.js for running the Next.js standalone server
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY raw-to-ready/backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY raw-to-ready/backend ./backend

# Copy Next.js standalone build + static assets
COPY --from=frontend /app/frontend/.next/standalone ./frontend/
COPY --from=frontend /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend /app/frontend/public ./frontend/public

# Startup script:
#   - FastAPI runs on internal port 8000
#   - Next.js listens on Railway's $PORT (internet-facing)
RUN printf '#!/bin/sh\n\
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &\n\
cd /app/frontend && HOSTNAME=0.0.0.0 PORT=${PORT:-3000} node server.js\n\
' > /start.sh && chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]
