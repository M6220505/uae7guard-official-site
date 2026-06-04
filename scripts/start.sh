#!/bin/bash
# UAE7Guard v2.6 — start production server
# Usage: ./scripts/start.sh [port]

PORT="${1:-3000}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE="/opt/homebrew/bin/node"

cd "$DIR"

# Load env vars from .env.local for standalone runtime
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

cp -r .next/static .next/standalone/.next/static 2>/dev/null
cp -r public .next/standalone/public 2>/dev/null

echo "UAE7Guard starting on http://localhost:$PORT (http://0.0.0.0:$PORT on network)"
PORT="$PORT" HOSTNAME="0.0.0.0" "$NODE" .next/standalone/server.js
