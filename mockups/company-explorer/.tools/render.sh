#!/usr/bin/env bash
# Renders the mockup frames with headless Chrome.
# Usage: .tools/render.sh   (expects a static server on 127.0.0.1:8899 at repo root)
set -u

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://127.0.0.1:8899/mockups/company-explorer/index.html"
OUT="$(cd "$(dirname "$0")/.." && pwd)"

RUN="$(date +%s)"

shot() {
  local name="$1" w="$2" h="$3" scale="$4" query="$5"
  local file="$OUT/$name.png"
  rm -f "$file"
  # A fresh profile per run: a lingering headless Chrome keeps the old one locked.
  "$CHROME" --headless --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="/tmp/cx-$RUN-$name" \
    --force-device-scale-factor="$scale" \
    --window-size="$w,$h" \
    --screenshot="$file" \
    "$BASE$query" >/dev/null 2>&1 &

  for _ in $(seq 1 20); do
    sleep 1
    [ -f "$file" ] && break
  done

  if [ -f "$file" ]; then
    echo "ok   $name.png"
  else
    echo "FAIL $name.png"
  fi
}

shot "company-explorer-desktop"  1512 2550 2 ""
# ?frame=lower drops the intro and the hero so the verdicts and the full
# company table fit in one shot instead of a 4000px strip.
shot "company-explorer-desktop-lower" 1512 2300 2 "?frame=lower&rows=12"
shot "company-explorer-filtered" 1512 2550 2 "?sector=20"
# The industry chips start collapsed; ?expand=sector captures "Show more".
shot "company-explorer-filters-open" 1512 900 2 "?frame=top&expand=sector"
# Chrome clamps a headless window to 500px wide on macOS, so ?frame=phone
# constrains the document to 390px inside a 500px window instead.
shot "company-explorer-phone"     500 1000 2 "?frame=top,phone"
shot "company-explorer-phone-lower" 500 1620 2 "?frame=lower,phone"
