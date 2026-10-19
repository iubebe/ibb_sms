#!/bin/sh
# Runs from /docker-entrypoint.d/ before nginx starts: renders env.js from the template.
set -e

DIR="/usr/share/nginx/html/assets/environment"
TEMPLATE="$DIR/env.template.js"

[ -f "$TEMPLATE" ] || { echo "env template not found: $TEMPLATE" >&2; exit 1; }

# Only substitute the placeholders listed in the template, so a stray $ is left alone.
VARS=$(grep -o '\${[A-Z0-9_]*}' "$TEMPLATE" | sort -u | tr '\n' ' ')
envsubst "$VARS" < "$TEMPLATE" > "$DIR/env.js"
echo "Generated $DIR/env.js"
