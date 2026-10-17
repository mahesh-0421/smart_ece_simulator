# Multi-stage Dockerfile for Smart ECE Lab
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Toolchains (GNU Octave, Icarus Verilog)
FROM python:3.11-slim

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system compilers, simulation runtimes and fonts (fonts needed for Octave plots)
RUN apt-get update && apt-get install -y --no-install-recommends \
    octave \
    gnuplot-nox \
    iverilog \
    fontconfig \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-freefont-ttf \
    fonts-freefont-otf \
    curl \
    && fc-cache -f \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets into static directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set working directory to backend
WORKDIR /app/backend

# Create unprivileged sandbox user
RUN useradd -m -u 1000 ece_user && \
    chown -R ece_user:ece_user /app

# Writable home/cache for the unprivileged user (fontconfig, Octave)
ENV HOME=/home/ece_user
ENV XDG_CACHE_HOME=/tmp/.cache

USER ece_user

# Build-time check: tests a headless Octave plot (look for PLOT TEST OK in build logs)
RUN octave-cli --no-gui --eval "graphics_toolkit('gnuplot'); f=figure('visible','off'); plot(1:3); title('t'); print(f,'/tmp/t.png','-dpng'); disp('PLOT TEST OK')" \
    || echo "PLOT TEST FAILED"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]