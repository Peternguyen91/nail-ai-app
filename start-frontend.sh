#!/bin/bash
set -e

cd "$(dirname "$0")/frontend"

# Create .env.local if not exists
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "✅ Created frontend/.env.local"
fi

# Install deps if needed
if [ ! -d node_modules ]; then
  echo "📦 Installing npm dependencies..."
  npm install
fi

echo ""
echo "🚀 Starting Next.js frontend at http://localhost:3000"
echo ""

npm run dev
