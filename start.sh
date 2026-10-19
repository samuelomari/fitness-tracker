#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🏋️ Initializing FitTrack Pro SQLite database & demo data..."
python3 "$DIR/backend/seed.py"

echo "🚀 Starting Flask backend on http://127.0.0.1:5000..."
python3 "$DIR/backend/run.py" &
BACKEND_PID=$!

echo "🌐 Starting Vite frontend on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}

trap cleanup EXIT INT TERM

wait

