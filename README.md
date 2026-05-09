# Nivas Final

Single repo for the Nivas project.

## Folders

- `frontend/` - React frontend currently used by your teammate
- `ai-services/` - Python FastAPI AI services backend

## AI Service Start

```bash
cd ai-services
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Swagger docs will be available at:

```text
http://127.0.0.1:8000/docs
```

## Important AI Endpoints

- `POST /api/complaints/create`
- `POST /api/router/route`
- `POST /api/ward/analyze`
- `POST /api/housing/match`
- `POST /api/documents/upload`
- `GET /api/analytics/summary`
- `POST /api/notifications/send`
- `POST /api/whatsapp/webhook`
- `POST /api/bot/webhook`
