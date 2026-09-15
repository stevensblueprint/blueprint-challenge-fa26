#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
SLEEP_SECONDS="${SLEEP_SECONDS:-2}"

check_backend_health() {
  local body
  body="$(curl -fsS "${BACKEND_URL}/")"
  if [[ "${body}" != *'"status":"ok"'* ]]; then
    echo "Backend health payload unexpected: ${body}" >&2
    return 1
  fi
}

check_backend_docs() {
  curl -fsS "${BACKEND_URL}/docs" >/dev/null
}

check_frontend() {
  local body
  body="$(curl -fsS "${FRONTEND_URL}")"
  if [[ "${body}" != *'<!doctype html>'* ]]; then
    echo "Frontend did not return HTML document" >&2
    return 1
  fi
}

wait_for() {
  local name="$1"
  local check_fn="$2"

  local attempt=1
  while (( attempt <= MAX_ATTEMPTS )); do
    if "${check_fn}"; then
      echo "[ok] ${name}"
      return 0
    fi

    echo "[wait] ${name} (${attempt}/${MAX_ATTEMPTS})"
    sleep "${SLEEP_SECONDS}"
    ((attempt++))
  done

  echo "[fail] ${name} did not become ready in time" >&2
  return 1
}

echo "Running smoke checks..."
wait_for "backend health (${BACKEND_URL}/)" check_backend_health
wait_for "backend docs (${BACKEND_URL}/docs)" check_backend_docs
wait_for "frontend (${FRONTEND_URL})" check_frontend

echo "All smoke checks passed."
