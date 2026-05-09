# Nivas AI Services

Python FastAPI backend for the AI agent layer.

## Main Folders

- `app/api/` - public HTTP endpoints for frontend/backend integration
- `app/complaint_classifier/` - complaint image classification
- `app/complaint_router/` - officer routing and escalation metadata
- `app/ward_analyzer/` - ward and satellite-image analysis
- `app/housing_matcher/` - housing recommendation engine
- `app/document_parser/` - Aadhaar / income / ration document parsing
- `app/notification_broadcaster/` - push notification broadcasting
- `app/whatsapp_agent/` - WhatsApp assistant logic
- `app/bot_webhook/` - Twilio webhook intake
- `app/analytics_aggregator/` - dashboard and analytics aggregation
- `tests/` - Python tests

## Run Locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Credentials

- Put Firebase admin JSON at `credentials/serviceAccountKey.json`
- Keep `credentials/serviceAccountKey.json` out of Git

## Stable Endpoints

- `POST /api/complaints/create`
- `POST /api/router/route`
- `POST /api/ward/analyze`
- `POST /api/housing/match`
- `POST /api/documents/upload`
- `GET /api/documents/status/{citizen_id}`
- `GET /api/analytics/summary`
- `POST /api/notifications/send`
- `POST /api/whatsapp/webhook`
- `POST /api/bot/webhook`
