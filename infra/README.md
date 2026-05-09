# Nivas Final Infra

Infrastructure assets for the unified `Nivas-final` repo.

## What Is Kept

- `firebase/firestore.rules` - Firestore access rules
- `firebase/firestore.indexes.json` - Firestore composite indexes
- `firebase/storage.rules` - Storage rules
- `firebase/remoteconfig.template.json` - Firebase Remote Config defaults
- `gcp/apis-to-enable.txt` - required Google Cloud APIs
- `gcp/pubsub-topics.txt` - topic names used by the platform
- `gcp/bigquery-schema/` - BigQuery table schemas for analytics
- `gcp/setup.sh` - helper script to create the core GCP resources

## Why This Was Not Merged As-Is

The original `nivasai-infra` repo assumed:

- old `nivasai-services` Firebase Cloud Functions deployment
- old Node-based function runtime
- stale env update scripts with hardcoded secrets

This final repo now uses:

- `frontend/` for the React app
- `ai-services/` for the Python FastAPI AI backend

So only the reusable infra assets were kept.

## Suggested Deployment Shape

- `frontend/` -> Firebase Hosting
- Firebase -> Auth, Firestore, Storage, Remote Config, FCM
- `ai-services/` -> Cloud Run or a VM/container host
- GCP -> BigQuery, Pub/Sub, Document AI, Monitoring

## Basic Order

```bash
cd infra/gcp
chmod +x setup.sh
./setup.sh
```

Then deploy Firebase rules:

```bash
cd ../firebase
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Then run the backend from:

```bash
cd ../../ai-services
source .venv/bin/activate
env ENABLE_TRIGGERS=false .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```
