#!/bin/sh
# Startup script that loads credentials from mounted secret and starts the app

CREDENTIALS_FILE="/secrets/credentials/credentials.json"

if [ -f "$CREDENTIALS_FILE" ]; then
  echo "Loading credentials from secret..."
  
  # Parse JSON and export as environment variables
  export DATABASE_URL=$(cat "$CREDENTIALS_FILE" | sed -n 's/.*"DATABASE_URL"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  export ADMIN_EMAIL=$(cat "$CREDENTIALS_FILE" | sed -n 's/.*"ADMIN_EMAIL"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  export ADMIN_PASSWORD=$(cat "$CREDENTIALS_FILE" | sed -n 's/.*"ADMIN_PASSWORD"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  export ADMIN_SESSION_SECRET=$(cat "$CREDENTIALS_FILE" | sed -n 's/.*"ADMIN_SESSION_SECRET"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  
  echo "Credentials loaded successfully"
else
  echo "No credentials file found at $CREDENTIALS_FILE, using environment variables"
fi

# Start the Next.js server
exec node server.js
