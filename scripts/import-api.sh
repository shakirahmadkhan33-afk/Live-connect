#!/data/data/com.termux/files/usr/bin/bash
# Usage: bash scripts/import-api.sh [SOURCE_API_FOLDER]
# Copies your API into apps/api (skips node_modules, .env, dist, .git)
SRC="${1:-$HOME/live-connect/apps/api}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/apps/api"

if [ ! -f "$SRC/package.json" ]; then
  echo "ERROR: $SRC/package.json not found. Give the correct API folder path."
  exit 1
fi
if [ -f "$DEST/package.json" ]; then
  echo "ERROR: $DEST already has an API (package.json exists). Nothing copied."
  exit 1
fi

rm -f "$DEST/PLACEHOLDER.md"
cd "$SRC" || exit 1
tar --exclude=node_modules --exclude=.env --exclude='.env.*' --exclude=dist --exclude=.git -cf - . | (cd "$DEST" && tar -xf -)
echo "API copied to $DEST"
echo "Next: cd $DEST && npm install"
echo "Then create .env yourself (copy from .env.example). Secrets were NOT copied."
