#!/usr/bin/env bash
set -u
ROOT="/opt/vlad/projects/KOPEAGRI"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="$ROOT/reports/autopilot/$STAMP.md"
mkdir -p "$(dirname "$OUT")"
cd "$ROOT"
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
  echo "## Typecheck"
  npm run typecheck 2>&1 || true
  echo
  echo "## Build"
  npm run build 2>&1 || true
} > "$OUT"
{
  echo
  echo "## Synthèse IA locale"
  timeout 120 "$ROOT/scripts/kopeagri-agent" "Analyse le rapport $OUT et donne 5 priorités maximum. N'invente aucune action externe." 2>&1 || echo "Synthèse IA indisponible"
} >> "$OUT"
echo "$OUT"
