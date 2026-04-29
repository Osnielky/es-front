#!/bin/bash

# Upload all DEV environment variables as a single secret
# This consolidates all dev env vars into one secret called ENV_DEV

set -e

PROJECT_ID="es-cars-dev"

echo "=================================================="
echo "Uploading DEV Environment Variables"
echo "=================================================="
echo "Project: $PROJECT_ID"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

echo "📝 Creating/Updating ENV_DEV secret with all dev environment variables..."
echo ""

# Create or update the ENV_DEV secret with the contents of .env.dev
if gcloud secrets describe ENV_DEV &>/dev/null 2>&1; then
    echo "✅ Updating existing ENV_DEV secret..."
    gcloud secrets versions add ENV_DEV --data-file=.env.dev
else
    echo "✅ Creating new ENV_DEV secret..."
    gcloud secrets create ENV_DEV --data-file=.env.dev
fi

echo ""
echo "=================================================="
echo "✅ ENV_DEV secret created/updated successfully!"
echo "=================================================="
echo ""
echo "All environment variables are now stored in GCP Secret Manager"
echo "Secret name: ENV_DEV"
echo ""
echo "To view the secret (for verification):"
echo "  gcloud secrets versions access latest --secret=ENV_DEV"
echo ""
echo "To use in Cloud Run, update cloudbuild-dev.yaml to read from this secret"
echo ""
