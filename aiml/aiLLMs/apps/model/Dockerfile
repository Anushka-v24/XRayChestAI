FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --upgrade pip \
    && pip install \
      fastapi \
      "uvicorn[standard]" \
      python-multipart \
      pillow \
      numpy \
      pandas \
      scikit-learn \
      tqdm \
      opencv-python-headless \
      matplotlib \
    && pip install \
      --index-url https://download.pytorch.org/whl/cpu \
      "torch==2.3.0" \
      "torchvision==0.18.0"

COPY app.py revised_densnet.py ./
COPY best_model.pth ./best_model.pth

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/ || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
