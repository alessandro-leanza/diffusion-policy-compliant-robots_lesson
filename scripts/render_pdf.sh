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
pdf_page_dir="$(mktemp -d "${TMPDIR:-/tmp}/dpcr-pdf-pages.XXXXXX")"

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
trap 'kill "$chrome_pid" >/dev/null 2>&1 || true; wait "$chrome_pid" 2>/dev/null || true; rm -rf "$chrome_user_data_dir" "$pdf_page_dir" >/dev/null 2>&1 || true' EXIT

node "$project_dir/scripts/capture_pdf_pages.js" "$devtools_port" "$pdf_page_dir"

python3 - "$pdf_page_dir" "$project_dir/slides.pdf" <<'PY'
from pathlib import Path
from PIL import Image
import sys

page_dir = Path(sys.argv[1])
output_path = Path(sys.argv[2])
page_files = sorted(page_dir.glob("page-*.png"))

if len(page_files) <= 1:
    raise SystemExit(f"Expected multiple captured pages, got {len(page_files)}")

images = [Image.open(path).convert("RGB") for path in page_files]
images[0].save(output_path, save_all=True, append_images=images[1:], resolution=144.0)
PY
