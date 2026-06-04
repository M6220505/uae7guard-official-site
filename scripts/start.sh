#!/bin/bash
# UAE7Guard v2.6 — start production server
# Usage: ./scripts/start.sh [port]

PORT="${1:-3000}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$DIR"
cp -r .next/static .next/standalone/.next/static 2>/dev/null
cp -r public .next/standalone/public 2>/dev/null

NODE="$(command -v node)"
if [ -z "$NODE" ]; then
  NODE="/opt/homebrew/bin/node"
fi

echo "UAE7Guard starting on http://localhost:$PORT"
PORT="$PORT" HOSTNAME="0.0.0.0" "$NODE" .next/standalone/server.js
