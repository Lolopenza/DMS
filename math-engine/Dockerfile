FROM python:3.11-slim

WORKDIR /app/math-engine

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system dmc && adduser --system --ingroup dmc dmc

# Copy only requirements first for better caching
COPY math-engine/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=dmc:dmc math-engine/ ./
COPY --chown=dmc:dmc dmc_ai /app/dmc_ai

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

USER dmc

EXPOSE 8081

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]
