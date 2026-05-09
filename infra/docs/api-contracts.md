# Nivas Final API Contracts

Current repo shape:

- `frontend/` - React frontend
- `ai-services/` - Python FastAPI AI backend

## Frontend Environment

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## AI Services Base URL

Local:

```text
http://127.0.0.1:8000
```

## AI Endpoints

- `POST /api/complaints/create`
- `POST /api/router/route`
- `POST /api/ward/analyze`
- `POST /api/housing/match`
- `POST /api/documents/upload`
- `GET /api/documents/status/{citizen_id}`
- `GET /analytics/summary`
- `POST /api/notifications/send`
- `POST /whatsapp/webhook`
- `POST /bot/webhook`

## Notes

- Complaint creation is multipart form-data.
- Ward analysis is multipart form-data with a satellite image.
- Housing match is JSON.
- Document upload is multipart form-data.
- The backend uses Firebase Admin credentials from:
  `ai-services/credentials/serviceAccountKey.json`
