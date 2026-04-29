#!/bin/bash

# Google Cloud Secret Manager Setup for es-front (DEV)
# Run this script to configure all required secrets for Cloud Build and Cloud Run

set -e

# Configuration
PROJECT_ID="es-cars-dev"
REGION="us-east1"
CLOUD_SQL_INSTANCE="es-cars-dev-db"
DB_NAME="esfront_dev"

echo "=================================================="
echo "Setting up GCP Secrets for es-front (DEV)"
echo "=================================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Cloud SQL Instance: $CLOUD_SQL_INSTANCE"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

echo "Step 1: Creating DATABASE_URL_DEV secret..."
echo "📝 Database URL format for Cloud SQL with Unix socket:"
echo "   postgresql://postgres:PASSWORD@/DATABASE?host=/cloudsql/PROJECT:REGION:INSTANCE"
echo ""
read -p "Enter Cloud SQL Postgres password: " DB_PASSWORD

# Create DATABASE_URL_DEV secret
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}"

# Check if secret already exists
if gcloud secrets describe DATABASE_URL_DEV &>/dev/null 2>&1; then
    echo "Updating existing DATABASE_URL_DEV secret..."
    echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL_DEV --data-file=-
else
    echo "Creating new DATABASE_URL_DEV secret..."
    echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL_DEV --data-file=-
fi

echo "✅ DATABASE_URL_DEV created/updated"
echo ""

echo "Step 2: Creating ADMIN_EMAIL_DEV secret..."
read -p "Enter admin email (default: admin@eandscars.com): " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@eandscars.com}"

if gcloud secrets describe ADMIN_EMAIL_DEV &>/dev/null 2>&1; then
    echo -n "$ADMIN_EMAIL" | gcloud secrets versions add ADMIN_EMAIL_DEV --data-file=-
else
    echo -n "$ADMIN_EMAIL" | gcloud secrets create ADMIN_EMAIL_DEV --data-file=-
fi
echo "✅ ADMIN_EMAIL_DEV: $ADMIN_EMAIL"
echo ""

echo "Step 3: Creating ADMIN_PASSWORD_DEV secret..."
read -sp "Enter admin password: " ADMIN_PASSWORD
echo ""

if gcloud secrets describe ADMIN_PASSWORD_DEV &>/dev/null 2>&1; then
    echo -n "$ADMIN_PASSWORD" | gcloud secrets versions add ADMIN_PASSWORD_DEV --data-file=-
else
    echo -n "$ADMIN_PASSWORD" | gcloud secrets create ADMIN_PASSWORD_DEV --data-file=-
fi
echo "✅ ADMIN_PASSWORD_DEV created"
echo ""

echo "Step 4: Creating ADMIN_SESSION_SECRET_DEV secret..."
read -sp "Enter session secret (min 32 chars): " SESSION_SECRET
echo ""

if gcloud secrets describe ADMIN_SESSION_SECRET_DEV &>/dev/null 2>&1; then
    echo -n "$SESSION_SECRET" | gcloud secrets versions add ADMIN_SESSION_SECRET_DEV --data-file=-
else
    echo -n "$SESSION_SECRET" | gcloud secrets create ADMIN_SESSION_SECRET_DEV --data-file=-
fi
echo "✅ ADMIN_SESSION_SECRET_DEV created"
echo ""

# Also create DATABASE_URL_MIGRATE for migrations
echo "Step 5: Creating DATABASE_URL_MIGRATE secret (for Cloud Build migrations)..."
if gcloud secrets describe DATABASE_URL_MIGRATE &>/dev/null 2>&1; then
    echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL_MIGRATE --data-file=-
else
    echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL_MIGRATE --data-file=-
fi
echo "✅ DATABASE_URL_MIGRATE created/updated"
echo ""

echo "=================================================="
echo "✅ All secrets configured successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Grant Cloud Build service account access to secrets:"
echo "   gcloud projects get-iam-policy $PROJECT_ID"
echo ""
echo "2. Verify secrets:"
echo "   gcloud secrets list"
echo ""
echo "3. Push to dev branch to trigger deployment:"
echo "   git push origin dev"
echo ""
