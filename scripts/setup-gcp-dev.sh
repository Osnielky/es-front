#!/bin/bash
# ===========================================
# GCP DEV Environment Setup Script
# ===========================================
# Run this script to set up the dev environment in GCP
# Make sure you're authenticated: gcloud auth login
# And connected to the right project: gcloud config set project es-cars-dev

set -e

# Configuration
PROJECT_ID="es-cars-dev"
REGION="us-east1"
DB_INSTANCE_NAME="es-cars-dev-db"
DB_NAME="esfront_dev"
DB_USER="postgres"
SERVICE_NAME="es-front-dev"
REPO_NAME="es-front"
BUCKET_NAME="es-cars-dev-images"
GITHUB_OWNER="Osnielky"
GITHUB_REPO="es-front"

echo "============================================="
echo "Setting up DEV environment for es-cars-dev"
echo "============================================="

# Step 1: Enable required APIs
echo ""
echo "Step 1: Enabling GCP APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project=$PROJECT_ID

echo "✓ APIs enabled"

# Step 2: Create Artifact Registry repository
echo ""
echo "Step 2: Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker images for es-front" \
  --project=$PROJECT_ID 2>/dev/null || echo "Repository already exists"

echo "✓ Artifact Registry ready"

# Step 3: Create Cloud SQL instance
echo ""
echo "Step 3: Creating Cloud SQL PostgreSQL instance..."
echo "This may take several minutes..."

# Check if instance exists
if gcloud sql instances describe $DB_INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
  echo "Cloud SQL instance already exists"
else
  gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup \
    --project=$PROJECT_ID

  # Set root password (you should change this!)
  echo ""
  echo "Setting database password..."
  read -sp "Enter password for postgres user: " DB_PASSWORD
  echo ""
  gcloud sql users set-password $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD \
    --project=$PROJECT_ID

  # Create database
  gcloud sql databases create $DB_NAME \
    --instance=$DB_INSTANCE_NAME \
    --project=$PROJECT_ID
fi

echo "✓ Cloud SQL instance ready"

# Get the connection name for Cloud Run
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(connectionName)' --project=$PROJECT_ID)
echo "Connection name: $CONNECTION_NAME"

# Step 4: Create GCS bucket for images
echo ""
echo "Step 4: Creating Cloud Storage bucket..."
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME 2>/dev/null || true
echo "✓ Storage bucket ready"

# Step 5: Create secrets in Secret Manager
echo ""
echo "Step 5: Setting up Secret Manager secrets..."

# Function to create or update secret
create_secret() {
  SECRET_NAME=$1
  echo "Creating secret: $SECRET_NAME"
  
  if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID &>/dev/null; then
    echo "  Secret exists, creating new version..."
    read -sp "  Enter value for $SECRET_NAME: " SECRET_VALUE
    echo ""
    echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID
  else
    read -sp "  Enter value for $SECRET_NAME: " SECRET_VALUE
    echo ""
    echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID
  fi
}

# Get private IP for database URL
PRIVATE_IP=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(ipAddresses[0].ipAddress)' --project=$PROJECT_ID)
echo ""
echo "Cloud SQL IP: $PRIVATE_IP"
echo "Database URL format: postgresql://postgres:PASSWORD@/esfront_dev?host=/cloudsql/$CONNECTION_NAME"
echo ""

create_secret "DATABASE_URL_DEV"
create_secret "ADMIN_EMAIL_DEV"
create_secret "ADMIN_PASSWORD_DEV"
create_secret "ADMIN_SESSION_SECRET_DEV"

echo "✓ Secrets created"

# Step 6: Grant Cloud Build permissions
echo ""
echo "Step 6: Granting Cloud Build permissions..."

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_BUILD_SA="$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/run.admin" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/iam.serviceAccountUser" \
  --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/cloudsql.client" \
  --quiet

echo "✓ Permissions granted"

# Step 7: Create Cloud Build trigger
echo ""
echo "Step 7: Creating Cloud Build trigger..."
echo ""
echo "To create the trigger, run this command or do it in the Console:"
echo ""
echo "gcloud builds triggers create github \\"
echo "  --name='es-front-dev-trigger' \\"
echo "  --repo-name='$GITHUB_REPO' \\"
echo "  --repo-owner='$GITHUB_OWNER' \\"
echo "  --branch-pattern='^dev$' \\"
echo "  --build-config='cloudbuild-dev.yaml' \\"
echo "  --project=$PROJECT_ID"
echo ""
echo "Or go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"

echo ""
echo "============================================="
echo "Setup Complete!"
echo "============================================="
echo ""
echo "Next steps:"
echo "1. Connect your GitHub repo to Cloud Build (if not done)"
echo "2. Create the Cloud Build trigger for 'dev' branch"
echo "3. Push to 'dev' branch to trigger deployment"
echo ""
echo "Useful commands:"
echo "  View builds: gcloud builds list --project=$PROJECT_ID"
echo "  View service: gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
echo "  View logs: gcloud run services logs read $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
echo ""
