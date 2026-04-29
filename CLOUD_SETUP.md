# Cloud Deployment Configuration Guide

## Prerequisites

Before deploying to Cloud Run, ensure you have:

1. **GCP Project** with:
   - Cloud Build enabled
   - Cloud Run enabled
   - Cloud SQL PostgreSQL instance
   - Secret Manager enabled
   - Artifact Registry

2. **gcloud CLI** installed and configured:
   ```bash
   gcloud auth login
   gcloud config set project es-cars-dev
   ```

3. **Cloud SQL Instance** created:
   - Instance name: `es-cars-dev-db`
   - Region: `us-east1`
   - PostgreSQL 15+
   - Database: `esfront_dev` (must exist or be auto-created)

## Step 1: Create Required Secrets

Run the setup script to create all secrets in Google Secret Manager:

```bash
chmod +x scripts/setup-gcp-secrets.sh
./scripts/setup-gcp-secrets.sh
```

This will create:
- `DATABASE_URL_DEV` - Cloud SQL connection string
- `DATABASE_URL_MIGRATE` - Same, used for migrations
- `ADMIN_EMAIL_DEV` - Admin email
- `ADMIN_PASSWORD_DEV` - Admin password
- `ADMIN_SESSION_SECRET_DEV` - Session secret (32+ chars)

## Step 2: Verify Secrets

```bash
# List all secrets
gcloud secrets list

# Verify a specific secret exists
gcloud secrets describe DATABASE_URL_DEV

# View secret value (for debugging)
gcloud secrets versions access latest --secret=DATABASE_URL_DEV
```

## Step 3: Cloud Build Service Account Permissions

Ensure the Cloud Build service account can access the secrets:

```bash
PROJECT_ID="es-cars-dev"
CB_SA="$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com"

# Grant Secret Accessor role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$CB_SA \
  --role=roles/secretmanager.secretAccessor

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$CB_SA \
  --role=roles/run.admin

# Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$CB_SA \
  --role=roles/cloudsql.client
```

## Step 4: Database Setup

Ensure your Cloud SQL instance is properly configured:

```bash
PROJECT_ID="es-cars-dev"
INSTANCE="es-cars-dev-db"
REGION="us-east1"

# Get the instance connection name
gcloud sql instances describe $INSTANCE --format='value(connectionName)'

# Create database if it doesn't exist
gcloud sql databases create esfront_dev \
  --instance=$INSTANCE \
  --charset=utf8mb4
```

## Step 5: Deploy to Cloud Run

The deployment is triggered automatically when you push to the `dev` branch:

```bash
# Make sure changes are committed
git add .
git commit -m "Deploy to dev"

# Push to dev branch (triggers Cloud Build)
git push origin dev
```

Monitor the build:
```bash
# View the build
gcloud builds log <BUILD_ID>

# Or watch in Cloud Console
echo "https://console.cloud.google.com/cloud-build/builds"
```

## Troubleshooting

### Build fails at migration step
```bash
# Check if DATABASE_URL_MIGRATE secret exists
gcloud secrets describe DATABASE_URL_MIGRATE

# If missing, create it with the same value as DATABASE_URL_DEV
gcloud secrets versions access latest --secret=DATABASE_URL_DEV | \
  gcloud secrets versions add DATABASE_URL_MIGRATE --data-file=-
```

### Cloud Run can't connect to database
1. Verify `--add-cloudsql-instances` is set in cloudbuild-dev.yaml
2. Check Cloud SQL Proxy logs for errors
3. Ensure database URL format uses Unix socket: `?host=/cloudsql/PROJECT:REGION:INSTANCE`

### "Application error: a server-side exception has occurred"
This usually means DATABASE_URL is not set or invalid:
```bash
# SSH into Cloud Run container and test connection
gcloud run services describe es-front-dev --region=us-east1
```

## Secrets Format Reference

**DATABASE_URL_DEV** (Cloud SQL with Unix socket):
```
postgresql://postgres:PASSWORD@/esfront_dev?host=/cloudsql/PROJECT_ID:REGION:INSTANCE
```

Example:
```
postgresql://postgres:admin1234@/esfront_dev?host=/cloudsql/es-cars-dev:us-east1:es-cars-dev-db
```

## Manual Checks

### Test Cloud SQL Connection
```bash
# From your local machine (requires Cloud SQL Proxy)
cloud-sql-proxy PROJECT_ID:REGION:INSTANCE &
psql "postgresql://postgres:PASSWORD@localhost/esfront_dev"
```

### Check Cloud Run Logs
```bash
gcloud run services logs read es-front-dev --region=us-east1 --limit 50
```

### View Active Secrets
```bash
gcloud secrets list --format="table(name, created)"
```

## Next Steps

1. ✅ Run `scripts/setup-gcp-secrets.sh`
2. ✅ Grant service account permissions
3. ✅ Verify secrets with `gcloud secrets list`
4. ✅ Push to `dev` branch to trigger deployment
5. ✅ Monitor build and verify deployment
