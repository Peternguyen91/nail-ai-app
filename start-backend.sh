#!/bin/bash
set -e

cd "$(dirname "$0")/backend"

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env (edit it to add HF_TOKEN for AI try-on)"
fi

# Create virtualenv if not exists
if [ ! -d venv ]; then
  echo "📦 Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "🚀 Starting FastAPI backend at http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
