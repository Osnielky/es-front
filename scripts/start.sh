#!/bin/sh
# Startup script that loads credentials from mounted secret and starts the app

CREDENTIALS_FILE="/secrets/credentials/credentials.json"

if [ -f "$CREDENTIALS_FILE" ]; then
  echo "Loading credentials from secret..."
  
  # Parse JSON using jq and export as environment variables
  export DATABASE_URL=$(jq -r '.DATABASE_URL' "$CREDENTIALS_FILE")
  export ADMIN_EMAIL=$(jq -r '.ADMIN_EMAIL' "$CREDENTIALS_FILE")
  export ADMIN_PASSWORD=$(jq -r '.ADMIN_PASSWORD' "$CREDENTIALS_FILE")
  export ADMIN_SESSION_SECRET=$(jq -r '.ADMIN_SESSION_SECRET' "$CREDENTIALS_FILE")
  
  echo "DATABASE_URL loaded"
  echo "Credentials loaded successfully"
else
  echo "No credentials file found at $CREDENTIALS_FILE, using environment variables"
fi

# Start the Next.js server
exec node server.js
