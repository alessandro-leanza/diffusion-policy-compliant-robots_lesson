#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"

quarto render slides.qmd --to revealjs

chrome_bin="${CHROME_BIN:-}"
if [[ -z "$chrome_bin" ]]; then
  if command -v google-chrome-stable >/dev/null 2>&1; then
    chrome_bin="google-chrome-stable"
  elif command -v google-chrome >/dev/null 2>&1; then
    chrome_bin="google-chrome"
  else
    echo "No Chrome executable found. Set CHROME_BIN or install google-chrome." >&2
    exit 1
  fi
fi

devtools_port="${CHROME_DEVTOOLS_PORT:-9224}"
chrome_user_data_dir="$(mktemp -d "${TMPDIR:-/tmp}/dpcr-chrome-pdf.XXXXXX")"

"$chrome_bin" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --allow-file-access-from-files \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir="$chrome_user_data_dir" \
  --remote-debugging-port="$devtools_port" \
  "file://$project_dir/slides.html?print-pdf" >/tmp/dpcr-chrome-pdf.log 2>&1 &

chrome_pid="$!"
trap 'kill "$chrome_pid" >/dev/null 2>&1 || true; wait "$chrome_pid" 2>/dev/null || true; rm -rf "$chrome_user_data_dir" >/dev/null 2>&1 || true' EXIT

node "$project_dir/scripts/print_pdf_after_mathjax.js" "$devtools_port" "$project_dir/slides.pdf"
