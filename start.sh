#!/bin/bash
# Start script for tickets-app
# Data lives at ./data/ relative to the app directory

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$APP_DIR/data"
STANDALONE_DIR="$APP_DIR/.next/standalone"

# Create data directories if they don't exist
mkdir -p "$DATA_DIR/tickets/open" "$DATA_DIR/tickets/closed"

# Copy example tickets if data directory is empty
if [ -z "$(ls -A "$DATA_DIR/tickets/open/" 2>/dev/null)" ]; then
    if [ -d "$APP_DIR/examples" ]; then
        cp "$APP_DIR/examples"/*.md "$DATA_DIR/tickets/open/" 2>/dev/null
        echo "Loaded example tickets."
    fi
fi

# Ensure .next/static is accessible from the standalone directory
# The standalone server chdirs to its own dir, so symlink static there
if [ ! -L "$STANDALONE_DIR/.next/static" ] && [ ! -d "$STANDALONE_DIR/.next/static" ]; then
    ln -sfn "$APP_DIR/.next/static" "$STANDALONE_DIR/.next/static"
    echo "Linked static files."
fi

cd "$APP_DIR"
export TICKETS_BASE="$DATA_DIR/tickets"
exec node .next/standalone/server.js
