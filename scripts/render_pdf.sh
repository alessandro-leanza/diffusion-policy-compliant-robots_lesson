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

"$chrome_bin" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --allow-file-access-from-files \
  --run-all-compositor-stages-before-draw \
  --virtual-time-budget=10000 \
  --print-to-pdf="$project_dir/slides.pdf" \
  "file://$project_dir/slides.html?print-pdf"
