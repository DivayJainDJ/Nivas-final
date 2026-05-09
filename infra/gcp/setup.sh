#!/bin/bash

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

if ! command -v gcloud >/dev/null 2>&1; then
  log_error "gcloud CLI is not installed."
  exit 1
fi

if ! command -v bq >/dev/null 2>&1; then
  log_error "BigQuery CLI (bq) is not installed."
  exit 1
fi

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  log_error "No active GCP project. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATASET="nivasai_analytics"
LOCATION="asia-south1"
SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"

log_info "Using project: $PROJECT_ID"

while IFS= read -r api; do
  if [[ -n "$api" && ! "$api" =~ ^# ]]; then
    log_info "Enabling API: $api"
    gcloud services enable "$api" --project="$PROJECT_ID" || log_warning "Could not enable $api"
  fi
done < "$SCRIPT_DIR/apis-to-enable.txt"

while IFS= read -r topic; do
  if [[ -n "$topic" && ! "$topic" =~ ^# ]]; then
    log_info "Creating Pub/Sub topic: $topic"
    gcloud pubsub topics create "$topic" --project="$PROJECT_ID" 2>/dev/null || log_warning "Topic exists: $topic"
  fi
done < "$SCRIPT_DIR/pubsub-topics.txt"

log_info "Creating BigQuery dataset: $DATASET"
bq --location="$LOCATION" mk --dataset "$PROJECT_ID:$DATASET" 2>/dev/null || log_warning "Dataset may already exist"

for table in ward_stats complaint_events housing_matches; do
  schema_path="$SCRIPT_DIR/bigquery-schema/$table.json"
  log_info "Creating BigQuery table: $table"
  bq --location="$LOCATION" mk --table "$PROJECT_ID:$DATASET.$table" "$schema_path" 2>/dev/null || log_warning "Table may already exist: $table"
done

ROLES=(
  "roles/bigquery.dataEditor"
  "roles/bigquery.jobUser"
  "roles/pubsub.publisher"
  "roles/pubsub.subscriber"
  "roles/storage.objectAdmin"
  "roles/datastore.user"
  "roles/run.admin"
  "roles/iam.serviceAccountUser"
)

for role in "${ROLES[@]}"; do
  log_info "Granting $role to $SERVICE_ACCOUNT"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="$role" \
    --condition=None >/dev/null 2>&1 || log_warning "Role may already be assigned: $role"
done

log_success "Core GCP setup complete."
log_info "Next:"
log_info "1. Deploy Firebase rules from infra/firebase"
log_info "2. Deploy frontend to Firebase Hosting"
log_info "3. Deploy ai-services to Cloud Run or run it locally"
