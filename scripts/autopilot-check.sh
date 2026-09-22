#!/usr/bin/env bash
set -u
ROOT="/opt/vlad/projects/KOPEAGRI"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="$ROOT/reports/autopilot/$STAMP.md"
mkdir -p "$(dirname "$OUT")"
find "$ROOT/reports/autopilot" -type f -name "*.md" -mtime +14 -delete 2>/dev/null || true
cd "$ROOT"

run_check() {
  local name="$1"; shift
  local log
  log=$(mktemp)
  "$@" >"$log" 2>&1
  local rc=$?
  {
    echo "## $name"
    echo "exit_code=$rc"
    tail -6 "$log"
    echo
  } >> "$OUT"
  rm -f "$log"
  return 0
}

{
  echo "# Audit automatique KopéAgri — $STAMP"
  echo
  echo "## Git"
  git status --short || true
  git log -1 --oneline || true
  echo
  echo "## Disque"
  df -h / || true
  echo
} > "$OUT"
run_check "Lint" npm run lint
run_check "Typecheck" npm run typecheck
run_check "Build" npm run build

REPORT_CONTEXT=$(cat "$OUT")
{
  echo
  echo "## Synthèse IA locale"
  timeout 120 "$ROOT/scripts/kopeagri-agent" "Voici le contenu du dernier audit :

$REPORT_CONTEXT

Donne 3 priorités concrètes maximum en 220 mots maximum. Cite les preuves du rapport. Distingue correction automatique et validation humaine. N'invente aucune action externe." 2>&1 || echo "Synthèse IA indisponible"
} >> "$OUT"

echo "$OUT"
