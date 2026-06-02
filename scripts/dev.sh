#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/sources/backend-nest"
FRONTEND_DIR="$ROOT_DIR/sources/frontend"
BACKEND_PORT="${BACKEND_PORT:-4100}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

PIDS=()
CLEANED_UP=0

cleanup() {
  if [ "$CLEANED_UP" -eq 1 ]; then
    return
  fi
  CLEANED_UP=1
  trap - INT TERM EXIT

  if [ "${#PIDS[@]}" -gt 0 ]; then
    echo
    echo "Stopping MockHub dev services..."
    kill "${PIDS[@]}" 2>/dev/null || true
    wait "${PIDS[@]}" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

check_node_modules() {
  local name="$1"
  local dir="$2"

  if [ ! -d "$dir/node_modules" ]; then
    echo "$name dependencies are missing: $dir/node_modules"
    echo "Run: cd $dir && npm install"
    exit 1
  fi
}

check_node_modules "Backend" "$BACKEND_DIR"
check_node_modules "Frontend" "$FRONTEND_DIR"

echo "Starting MockHub in development mode..."
echo "Backend:  http://127.0.0.1:$BACKEND_PORT/docs"
echo "Frontend: http://127.0.0.1:$FRONTEND_PORT"
echo

(
  trap - INT TERM EXIT
  cd "$BACKEND_DIR"
  PORT="$BACKEND_PORT" HOST="${BACKEND_HOST:-127.0.0.1}" npm run start:dev
) &
PIDS+=("$!")

(
  trap - INT TERM EXIT
  cd "$FRONTEND_DIR"
  npx vite --port "$FRONTEND_PORT" --host "${FRONTEND_HOST:-0.0.0.0}"
) &
PIDS+=("$!")

wait "${PIDS[@]}"
